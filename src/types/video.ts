export interface VideoMetadata {
  id: string;
  filename: string;
  filesize: number; // in bytes
  filesizeFormatted: string;
  resolution: string; // e.g. "1920x1080"
  width: number;
  height: number;
  videoCodec: string; // e.g. "h264"
  fps: number; // e.g. 60 or 120
  fpsFormatted: string; // e.g. "60 FPS"
  format: string; // e.g. "mov,mp4,m4a,3gp,3g2,mj2" or "mp4"
  videoBitrate: number; // in bps
  videoBitrateFormatted: string; // e.g. "8.5 Mbps"
  duration: number; // in seconds
  durationFormatted: string; // e.g. "00:01:24"
  aspectRatio: string; // e.g. "16:9"
  orientation: 'Landscape' | 'Portrait' | 'Square' | 'Unknown';
  audioCodec: string; // e.g. "aac"
  audioBitrate: number; // in bps
  audioBitrateFormatted: string; // e.g. "192 kbps"
  audioSampleRate: number; // in Hz
  audioSampleRateFormatted: string; // e.g. "48,000 Hz"
  url?: string;
  thumbnailUrl?: string;
}

export type OptimizationPreset = 
  | 'balanced'
  | 'esports_high_fps'
  | 'web_social'
  | 'ultra_compression'
  | 'cinematic_fidelity'
  | 'custom';

export interface OptimizationSettings {
  preset: OptimizationPreset;
  targetResolution: 'original' | '8k' | '4k' | '2k' | '1080p' | '720p' | '480p';
  targetFps: 'original' | '120' | '60' | '30' | '24';
  videoCodec: 'libx264' | 'libx265' | 'libvpx-vp9';
  crf: number; // 0 to 51 (18=visually lossless, 23=default, 28=smaller)
  speedPreset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium';
  audioCodec: 'aac' | 'mp3' | 'copy' | 'mute';
  audioBitrate: 'original' | '320k' | '256k' | '192k' | '128k' | '64k';
  targetFileSizeMB?: number; // optional target max size
  trim?: {
    enabled: boolean;
    startTime: number;
    endTime: number;
  };
}

export interface OptimizationJob {
  id: string;
  sourceMetadata: VideoMetadata;
  settings: OptimizationSettings;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  currentFrame?: number;
  totalFrames?: number;
  fps?: number;
  speed?: string;
  timeProcessed?: number;
  etaSeconds?: number;
  error?: string;
  outputMetadata?: VideoMetadata;
  downloadUrl?: string;
  originalSize: number;
  optimizedSize?: number;
  savedPercentage?: number;
  createdAt: number;
  completedAt?: number;
}
