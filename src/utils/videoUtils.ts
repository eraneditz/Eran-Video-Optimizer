import { OptimizationPreset, OptimizationSettings, VideoMetadata } from '../types/video';

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Unknown';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format bitrate in bps to human-readable string (kbps, Mbps)
 */
export function formatBitrate(bps: number): string {
  if (!bps || isNaN(bps) || bps <= 0) return 'Unknown';
  if (bps >= 1_000_000) {
    return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  }
  return `${Math.round(bps / 1_000)} kbps`;
}

/**
 * Format duration in seconds into HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Compute greatest common divisor for aspect ratio
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate aspect ratio label from width and height
 */
export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height || width <= 0 || height <= 0) return 'Unknown';
  const divisor = gcd(width, height);
  const wRatio = width / divisor;
  const hRatio = height / divisor;

  // Check common approximations (e.g., 1920x1080 is 16:9)
  const ratioVal = width / height;
  if (Math.abs(ratioVal - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(ratioVal - 9 / 16) < 0.02) return '9:16 (Portrait)';
  if (Math.abs(ratioVal - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(ratioVal - 3 / 4) < 0.02) return '3:4';
  if (Math.abs(ratioVal - 1) < 0.02) return '1:1 (Square)';
  if (Math.abs(ratioVal - 21 / 9) < 0.04) return '21:9 (Ultrawide)';

  return `${wRatio}:${hRatio}`;
}

/**
 * Calculate orientation
 */
export function calculateOrientation(width: number, height: number): 'Landscape' | 'Portrait' | 'Square' | 'Unknown' {
  if (!width || !height) return 'Unknown';
  if (width > height) return 'Landscape';
  if (height > width) return 'Portrait';
  return 'Square';
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(originalBytes: number, optimizedBytes: number): number {
  if (!originalBytes || originalBytes <= 0 || !optimizedBytes || optimizedBytes <= 0) return 0;
  const diff = originalBytes - optimizedBytes;
  const pct = (diff / originalBytes) * 100;
  return Number(pct.toFixed(1));
}

/**
 * Preset profiles
 */
export const PRESET_CONFIGS: Record<OptimizationPreset, Partial<OptimizationSettings>> = {
  balanced: {
    preset: 'balanced',
    targetResolution: 'original',
    targetFps: 'original',
    videoCodec: 'libx264',
    crf: 23,
    speedPreset: 'faster',
    audioCodec: 'aac',
    audioBitrate: '192k'
  },
  esports_high_fps: {
    preset: 'esports_high_fps',
    targetResolution: 'original',
    targetFps: '60', // or 120 if input is 120
    videoCodec: 'libx264',
    crf: 20, // crisper gaming detail
    speedPreset: 'fast',
    audioCodec: 'aac',
    audioBitrate: '256k'
  },
  web_social: {
    preset: 'web_social',
    targetResolution: '1080p',
    targetFps: '60',
    videoCodec: 'libx264',
    crf: 24,
    speedPreset: 'faster',
    audioCodec: 'aac',
    audioBitrate: '128k'
  },
  ultra_compression: {
    preset: 'ultra_compression',
    targetResolution: '720p',
    targetFps: '30',
    videoCodec: 'libx264',
    crf: 28,
    speedPreset: 'faster',
    audioCodec: 'aac',
    audioBitrate: '96k' as any
  },
  cinematic_fidelity: {
    preset: 'cinematic_fidelity',
    targetResolution: 'original',
    targetFps: 'original',
    videoCodec: 'libx264',
    crf: 18,
    speedPreset: 'fast',
    audioCodec: 'aac',
    audioBitrate: '320k'
  },
  custom: {
    preset: 'custom',
    targetResolution: 'original',
    targetFps: 'original',
    videoCodec: 'libx264',
    crf: 22,
    speedPreset: 'faster',
    audioCodec: 'aac',
    audioBitrate: '192k'
  }
};

/**
 * Map target resolution string to width/height dimensions
 */
export function getResolutionDimensions(target: string, origWidth: number, origHeight: number): { width: number; height: number } | null {
  if (target === 'original' || !target) return null;
  const isPortrait = origHeight > origWidth;

  let longSide = 1920;
  let shortSide = 1080;

  switch (target) {
    case '8k':
      longSide = 7680;
      shortSide = 4320;
      break;
    case '4k':
      longSide = 3840;
      shortSide = 2160;
      break;
    case '2k':
      longSide = 2560;
      shortSide = 1440;
      break;
    case '1080p':
      longSide = 1920;
      shortSide = 1080;
      break;
    case '720p':
      longSide = 1280;
      shortSide = 720;
      break;
    case '480p':
      longSide = 854;
      shortSide = 480;
      break;
    default:
      return null;
  }

  if (isPortrait) {
    return { width: shortSide, height: longSide };
  }
  return { width: longSide, height: shortSide };
}

/**
 * Generate FFmpeg CLI arguments array from OptimizationSettings
 */
export function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  settings: OptimizationSettings,
  sourceMeta?: Partial<VideoMetadata>
): string[] {
  const args: string[] = ['-y']; // overwrite output

  // Trimming start time if specified
  if (settings.trim?.enabled && settings.trim.startTime > 0) {
    args.push('-ss', settings.trim.startTime.toString());
  }

  // Input file
  args.push('-i', inputPath);

  // Trimming duration / end time
  if (settings.trim?.enabled && settings.trim.endTime > settings.trim.startTime) {
    const duration = settings.trim.endTime - settings.trim.startTime;
    args.push('-t', duration.toString());
  }

  // Video filters: scaling and fps
  const vfFilters: string[] = [];

  // Resolution scaling (preserving aspect ratio and ensuring even dimensions for H.264)
  if (settings.targetResolution !== 'original' && sourceMeta?.width && sourceMeta?.height) {
    const dims = getResolutionDimensions(settings.targetResolution, sourceMeta.width, sourceMeta.height);
    if (dims) {
      // Scale maintaining aspect ratio, force divisible by 2
      vfFilters.push(`scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2`);
    }
  } else {
    // Ensure even dimensions even if original resolution is slightly odd
    vfFilters.push('pad=ceil(iw/2)*2:ceil(ih/2)*2');
  }

  // FPS adjustment
  if (settings.targetFps !== 'original') {
    vfFilters.push(`fps=${settings.targetFps}`);
  }

  if (vfFilters.length > 0) {
    args.push('-vf', vfFilters.join(','));
  }

  // Video codec
  args.push('-c:v', settings.videoCodec || 'libx264');

  // CRF (Constant Rate Factor)
  args.push('-crf', (settings.crf ?? 23).toString());

  // Speed preset
  if (settings.videoCodec === 'libx264' || settings.videoCodec === 'libx265') {
    args.push('-preset', settings.speedPreset || 'faster');
  }

  // Pixel format for widest browser / device compatibility
  args.push('-pix_fmt', 'yuv420p');

  // Audio configuration
  if (settings.audioCodec === 'mute') {
    args.push('-an');
  } else if (settings.audioCodec === 'copy') {
    args.push('-c:a', 'copy');
  } else {
    args.push('-c:a', settings.audioCodec || 'aac');
    if (settings.audioBitrate && settings.audioBitrate !== 'original') {
      args.push('-b:a', settings.audioBitrate);
    }
  }

  // Fast start for web streaming / mobile playback
  args.push('-movflags', '+faststart');

  // Output path
  args.push(outputPath);

  return args;
}
