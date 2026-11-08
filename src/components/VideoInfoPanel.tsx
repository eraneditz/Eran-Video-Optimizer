import React from 'react';
import {
  FileVideo,
  HardDrive,
  Maximize2,
  Cpu,
  Gauge,
  FileCode,
  Activity,
  Clock,
  Compass,
  Volume2,
  Sliders,
  AudioWaveform,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VideoMetadata } from '../types/video';

interface VideoInfoPanelProps {
  metadata: VideoMetadata;
  onChangeVideo: () => void;
  onProceedToOptimize: () => void;
}

export const VideoInfoPanel: React.FC<VideoInfoPanelProps> = ({
  metadata,
  onChangeVideo,
  onProceedToOptimize
}) => {
  // 13 required metrics defined cleanly
  const metrics = [
    {
      label: 'Video Filename',
      value: metadata.filename || 'Unknown',
      icon: FileVideo,
      accent: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'File'
    },
    {
      label: 'Original File Size',
      value: metadata.filesizeFormatted || 'Unknown',
      icon: HardDrive,
      accent: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30',
      badge: 'Storage'
    },
    {
      label: 'Resolution',
      value: metadata.resolution || 'Unknown',
      icon: Maximize2,
      accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: metadata.height >= 2160 ? '4K / 8K UHD' : metadata.height >= 1080 ? 'FHD' : 'HD'
    },
    {
      label: 'Video Codec',
      value: metadata.videoCodec || 'Unknown',
      icon: Cpu,
      accent: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'Codec'
    },
    {
      label: 'FPS / Frame Rate',
      value: metadata.fpsFormatted || 'Unknown',
      icon: Gauge,
      accent: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
      badge: metadata.fps >= 100 ? '120 FPS High' : metadata.fps >= 50 ? '60 FPS Smooth' : 'Standard'
    },
    {
      label: 'Video Format',
      value: metadata.format || 'Unknown',
      icon: FileCode,
      accent: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
      badge: 'Container'
    },
    {
      label: 'Video Bitrate',
      value: metadata.videoBitrateFormatted || 'Unknown',
      icon: Activity,
      accent: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
      badge: 'Bitrate'
    },
    {
      label: 'Duration',
      value: metadata.durationFormatted || 'Unknown',
      icon: Clock,
      accent: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
      badge: 'Length'
    },
    {
      label: 'Aspect Ratio',
      value: metadata.aspectRatio || 'Unknown',
      icon: Sliders,
      accent: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
      badge: 'Proportion'
    },
    {
      label: 'Video Orientation',
      value: metadata.orientation || 'Unknown',
      icon: Compass,
      accent: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: metadata.orientation === 'Landscape' ? 'Wide' : metadata.orientation === 'Portrait' ? 'Vertical' : 'Orientation'
    },
    {
      label: 'Audio Codec',
      value: metadata.audioCodec || 'Unknown',
      icon: Volume2,
      accent: 'from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30',
      badge: 'Audio'
    },
    {
      label: 'Audio Bitrate',
      value: metadata.audioBitrateFormatted || 'Unknown',
      icon: Activity,
      accent: 'from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
      badge: 'Stream'
    },
    {
      label: 'Audio Sample Rate',
      value: metadata.audioSampleRateFormatted || 'Unknown',
      icon: AudioWaveform,
      accent: 'from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-500/30',
      badge: 'Sample'
    }
  ];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Banner with Video Preview and Quick Summary */}
      <div className="rounded-3xl border border-purple-900/40 bg-[#0f0f1c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
          
          {/* Video Preview Player */}
          <div className="w-full lg:w-5/12">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-black aspect-video flex items-center justify-center group">
              <video
                src={metadata.url}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center space-x-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>ORIGINAL SOURCE</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Header */}
          <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deep FFprobe Metadata Extracted</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-all">
                {metadata.filename}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Detected {metadata.resolution} at {metadata.fpsFormatted} ({metadata.filesizeFormatted})
              </p>
            </div>

            {/* Quick highlight tags */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono font-medium">
                {metadata.resolution}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 font-mono font-bold">
                {metadata.fpsFormatted}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-mono font-semibold">
                {metadata.videoCodec}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono font-medium">
                {metadata.filesizeFormatted}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onChangeVideo}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Upload Different Video</span>
              </button>

              <button
                type="button"
                onClick={onProceedToOptimize}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all cursor-pointer flex items-center space-x-2"
              >
                <span>Continue to Optimization Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Large Information Panel: 2 columns on mobile, 3 columns on desktop */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Automatic Video Information</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                13 Technical Metrics
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Parsed directly from stream headers via native FFprobe analyzer
            </p>
          </div>
        </div>

        {/* 2 columns on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4.5">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[#0f0f1a]/90 hover:bg-[#131322] border border-slate-800/80 hover:border-purple-500/40 p-4 transition-all duration-200 group flex flex-col justify-between shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${metric.accent} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-400 border border-slate-800">
                    {metric.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {metric.label}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white group-hover:text-purple-200 transition-colors font-mono break-all leading-snug">
                    {metric.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
