import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import multer from 'multer';
import { fileURLToPath } from 'url';
import {
  formatBitrate,
  formatBytes,
  formatDuration,
  calculateAspectRatio,
  calculateOrientation,
  calculateSavings,
  buildFfmpegArgs
} from './src/utils/videoUtils';
import { OptimizationJob, OptimizationSettings, VideoMetadata } from './src/types/video';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// Ensure temporary working directories exist
const TEMP_DIR = path.join(__dirname, 'temp');
const UPLOADS_DIR = path.join(TEMP_DIR, 'uploads');
const OUTPUTS_DIR = path.join(TEMP_DIR, 'outputs');
const SAMPLES_DIR = path.join(TEMP_DIR, 'samples');

for (const dir of [TEMP_DIR, UPLOADS_DIR, OUTPUTS_DIR, SAMPLES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `upload-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
  }
});

app.use(express.json());

// In-memory store for active jobs and metadata cache
const jobs = new Map<string, OptimizationJob>();
const filesMetadata = new Map<string, VideoMetadata>();
const recentJobsFile = path.join(TEMP_DIR, 'recent.json');

function loadRecentJobs(): OptimizationJob[] {
  try {
    if (fs.existsSync(recentJobsFile)) {
      const data = fs.readFileSync(recentJobsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load recent jobs:', err);
  }
  return [];
}

function saveRecentJobs(recent: OptimizationJob[]) {
  try {
    fs.writeFileSync(recentJobsFile, JSON.stringify(recent.slice(0, 30), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save recent jobs:', err);
  }
}

let recentJobs: OptimizationJob[] = loadRecentJobs();

/**
 * Execute ffprobe to extract real video and audio stream information
 */
export async function probeVideoFile(filePath: string, originalFilename?: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', chunk => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', chunk => {
      stderrData += chunk.toString();
    });

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`ffprobe failed with code ${code}: ${stderrData}`));
      }

      try {
        const parsed = JSON.parse(stdoutData);
        const format = parsed.format || {};
        const streams = parsed.streams || [];

        // Find primary video and audio streams
        const videoStream = streams.find((s: any) => s.codec_type === 'video');
        const audioStream = streams.find((s: any) => s.codec_type === 'audio');

        const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : { size: 0 };
        const filesize = Number(format.size) || stat.size;

        // Calculate FPS
        let fps = 0;
        if (videoStream?.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          if (den && den > 0 && num > 0) {
            fps = Math.round((num / den) * 100) / 100;
          }
        }
        if (!fps && videoStream?.avg_frame_rate) {
          const [num, den] = videoStream.avg_frame_rate.split('/').map(Number);
          if (den && den > 0 && num > 0) {
            fps = Math.round((num / den) * 100) / 100;
          }
        }

        const width = videoStream?.width ? Number(videoStream.width) : 0;
        const height = videoStream?.height ? Number(videoStream.height) : 0;
        const durationSec = Number(format.duration) || Number(videoStream?.duration) || 0;

        // Bitrates
        const videoBitrate = Number(videoStream?.bit_rate) || 
          (durationSec > 0 && filesize > 0 ? Math.round((filesize * 8) / durationSec) : 0);
        const audioBitrate = Number(audioStream?.bit_rate) || 0;
        const audioSampleRate = Number(audioStream?.sample_rate) || 0;

        const id = path.basename(filePath);
        const fname = originalFilename || path.basename(filePath);

        // Check rotation or orientation
        let orientation = calculateOrientation(width, height);
        const rotateTag = videoStream?.tags?.rotate || videoStream?.side_data_list?.[0]?.rotation;
        if (rotateTag === '90' || rotateTag === '270' || rotateTag === 90 || rotateTag === 270) {
          orientation = 'Portrait';
        }

        const meta: VideoMetadata = {
          id,
          filename: fname,
          filesize,
          filesizeFormatted: formatBytes(filesize),
          resolution: width && height ? `${width}x${height}` : 'Unknown',
          width,
          height,
          videoCodec: videoStream?.codec_name ? videoStream.codec_name.toUpperCase() : 'Unknown',
          fps: fps || 0,
          fpsFormatted: fps ? `${fps} FPS` : 'Unknown',
          format: format.format_name ? format.format_name.split(',')[0].toUpperCase() : 'Unknown',
          videoBitrate,
          videoBitrateFormatted: formatBitrate(videoBitrate),
          duration: durationSec,
          durationFormatted: formatDuration(durationSec),
          aspectRatio: calculateAspectRatio(width, height),
          orientation,
          audioCodec: audioStream?.codec_name ? audioStream.codec_name.toUpperCase() : 'Unknown',
          audioBitrate,
          audioBitrateFormatted: formatBitrate(audioBitrate),
          audioSampleRate,
          audioSampleRateFormatted: audioSampleRate ? `${audioSampleRate.toLocaleString()} Hz` : 'Unknown',
          url: `/api/media/stream/${id}`
        };

        resolve(meta);
      } catch (err: any) {
        reject(new Error(`Failed to parse ffprobe output: ${err.message}`));
      }
    });
  });
}

/**
 * Generate test sample clips on startup if not present
 */
async function ensureSampleVideos() {
  const sample1080p = path.join(SAMPLES_DIR, 'sample_1080p60.mp4');
  if (!fs.existsSync(sample1080p)) {
    console.log('Generating 1080p 60fps sample video...');
    await new Promise<void>((resolve) => {
      const proc = spawn('ffmpeg', [
        '-y',
        '-f', 'lavfi',
        '-i', 'testsrc=size=1920x1080:rate=60',
        '-f', 'lavfi',
        '-i', 'sine=frequency=440:sample_rate=48000',
        '-t', '5',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        sample1080p
      ]);
      proc.on('close', () => resolve());
    });
  }

  const sample4k = path.join(SAMPLES_DIR, 'sample_4k60.mp4');
  if (!fs.existsSync(sample4k)) {
    console.log('Generating 4K 60fps sample video...');
    await new Promise<void>((resolve) => {
      const proc = spawn('ffmpeg', [
        '-y',
        '-f', 'lavfi',
        '-i', 'testsrc=size=3840x2160:rate=60',
        '-f', 'lavfi',
        '-i', 'sine=frequency=660:sample_rate=48000',
        '-t', '3',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        sample4k
      ]);
      proc.on('close', () => resolve());
    });
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Upload endpoint
app.post('/api/upload', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const filePath = req.file.path;
    const metadata = await probeVideoFile(filePath, req.file.originalname);
    filesMetadata.set(metadata.id, metadata);

    return res.json({ success: true, metadata });
  } catch (err: any) {
    console.error('Upload & Probe error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process uploaded video' });
  }
});

// Load sample video endpoint
app.get('/api/sample/:preset', async (req: Request, res: Response) => {
  try {
    const { preset } = req.params;
    let sampleFilename = 'sample_1080p60.mp4';
    let displayName = 'Cyberpunk_1080p60_Esports.mp4';

    if (preset === '4k') {
      sampleFilename = 'sample_4k60.mp4';
      displayName = 'Eran_4K_UltraHD_60FPS.mp4';
    }

    const samplePath = path.join(SAMPLES_DIR, sampleFilename);
    if (!fs.existsSync(samplePath)) {
      await ensureSampleVideos();
    }

    // Copy to uploads dir so it can be transformed
    const copyId = `sample-${Date.now()}-${sampleFilename}`;
    const copyPath = path.join(UPLOADS_DIR, copyId);
    fs.copyFileSync(samplePath, copyPath);

    const metadata = await probeVideoFile(copyPath, displayName);
    filesMetadata.set(metadata.id, metadata);

    return res.json({ success: true, metadata });
  } catch (err: any) {
    console.error('Sample error:', err);
    return res.status(500).json({ error: err.message || 'Failed to load sample video' });
  }
});

// Start optimization endpoint
app.post('/api/optimize', async (req: Request, res: Response) => {
  try {
    const { fileId, settings } = req.body as { fileId: string; settings: OptimizationSettings };

    if (!fileId) {
      return res.status(400).json({ error: 'Missing fileId' });
    }

    const inputPath = path.join(UPLOADS_DIR, fileId);
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Source video file not found' });
    }

    let sourceMeta = filesMetadata.get(fileId);
    if (!sourceMeta) {
      sourceMeta = await probeVideoFile(inputPath);
      filesMetadata.set(fileId, sourceMeta);
    }

    const jobId = `job-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const outputFilename = `optimized-${sourceMeta.filename.replace(/\.[^/.]+$/, '')}-${settings.targetResolution || 'opt'}.mp4`;
    const outputPath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);

    const totalDuration = (settings.trim?.enabled && settings.trim.endTime > settings.trim.startTime)
      ? (settings.trim.endTime - settings.trim.startTime)
      : (sourceMeta.duration || 1);

    const targetFpsNum = settings.targetFps !== 'original' ? Number(settings.targetFps) : (sourceMeta.fps || 60);
    const totalFrames = Math.max(1, Math.round(totalDuration * targetFpsNum));

    const job: OptimizationJob = {
      id: jobId,
      sourceMetadata: sourceMeta,
      settings,
      status: 'processing',
      progress: 0,
      currentFrame: 0,
      totalFrames,
      originalSize: sourceMeta.filesize,
      createdAt: Date.now()
    };

    jobs.set(jobId, job);

    // Build FFmpeg command arguments
    const ffmpegArgs = buildFfmpegArgs(inputPath, outputPath, settings, sourceMeta);
    
    // Add progress reporting to stdout
    ffmpegArgs.unshift('-progress', 'pipe:1', '-nostats');

    console.log(`Starting FFmpeg job [${jobId}]: ffmpeg ${ffmpegArgs.join(' ')}`);

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    let progressBuffer = '';

    ffmpegProcess.stdout.on('data', chunk => {
      progressBuffer += chunk.toString();
      const lines = progressBuffer.split('\n');
      progressBuffer = lines.pop() || '';

      const progressData: Record<string, string> = {};
      for (const line of lines) {
        const [k, v] = line.split('=');
        if (k && v) progressData[k.trim()] = v.trim();
      }

      if (progressData.frame) {
        const frame = parseInt(progressData.frame, 10);
        job.currentFrame = frame;
        if (totalFrames > 0) {
          const calcProgress = Math.min(99, Math.round((frame / totalFrames) * 100));
          job.progress = Math.max(job.progress, calcProgress);
        }
      }

      if (progressData.out_time_us) {
        const micro = parseInt(progressData.out_time_us, 10);
        const timeSec = micro / 1_000_000;
        job.timeProcessed = timeSec;
        if (totalDuration > 0) {
          const timeProgress = Math.min(99, Math.round((timeSec / totalDuration) * 100));
          job.progress = Math.max(job.progress, timeProgress);
        }
      }

      if (progressData.speed) {
        job.speed = progressData.speed;
      }
      if (progressData.fps) {
        job.fps = parseFloat(progressData.fps);
      }
    });

    let stderrOutput = '';
    ffmpegProcess.stderr.on('data', chunk => {
      stderrOutput += chunk.toString();
      // Keep last 1000 characters for error reporting
      if (stderrOutput.length > 2000) {
        stderrOutput = stderrOutput.substring(stderrOutput.length - 2000);
      }
    });

    ffmpegProcess.on('close', async code => {
      if (code === 0 && fs.existsSync(outputPath)) {
        try {
          const outMeta = await probeVideoFile(outputPath, outputFilename);
          job.status = 'completed';
          job.progress = 100;
          job.outputMetadata = outMeta;
          job.optimizedSize = outMeta.filesize;
          job.savedPercentage = calculateSavings(job.originalSize, outMeta.filesize);
          job.downloadUrl = `/api/download/${jobId}`;
          job.completedAt = Date.now();

          // Prepend to recent list
          recentJobs = [job, ...recentJobs.filter(j => j.id !== jobId)].slice(0, 30);
          saveRecentJobs(recentJobs);
        } catch (err: any) {
          job.status = 'failed';
          job.error = `Failed to probe output video: ${err.message}`;
        }
      } else {
        job.status = 'failed';
        job.error = `FFmpeg failed with code ${code}. ${stderrOutput.slice(-300)}`;
      }
    });

    return res.json({ success: true, jobId, job });
  } catch (err: any) {
    console.error('Optimization error:', err);
    return res.status(500).json({ error: err.message || 'Failed to start optimization' });
  }
});

// Job status polling endpoint
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobs.get(id);

  if (!job) {
    // Check in recent jobs
    const recent = recentJobs.find(j => j.id === id);
    if (recent) return res.json({ job: recent });
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.json({ job });
});

// SSE endpoint for live optimization progress
app.get('/api/jobs/:id/events', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobs.get(id);

  if (!job) {
    return res.status(404).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(() => {
    const currentJob = jobs.get(id);
    if (!currentJob) {
      clearInterval(interval);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify(currentJob)}\n\n`);

    if (currentJob.status === 'completed' || currentJob.status === 'failed') {
      clearInterval(interval);
      res.end();
    }
  }, 250);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Recent jobs endpoint
app.get('/api/recent', (_req: Request, res: Response) => {
  res.json({ recent: recentJobs });
});

// Stream video with HTTP 206 Partial Content Range support
app.get('/api/media/stream/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  let filePath = path.join(UPLOADS_DIR, fileId);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(OUTPUTS_DIR, fileId);
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(SAMPLES_DIR, fileId);
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Stream optimized video output
app.get('/api/media/output/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const filePath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Output video not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Download endpoint
app.get('/api/download/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const filePath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const job = jobs.get(jobId) || recentJobs.find(j => j.id === jobId);
  const downloadName = job?.outputMetadata?.filename || `eran-optimized-${jobId}.mp4`;

  res.download(filePath, downloadName);
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  await ensureSampleVideos();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERAN VIDEO OPTIMIZER server running on port ${PORT}`);
  });
}

startServer();
