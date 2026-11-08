import React from 'react';
import { Cpu, Activity, Clock, Zap, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';
import { OptimizationJob } from '../types/video';

interface ProcessingViewProps {
  job: OptimizationJob | null;
  onCancel?: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ job }) => {
  if (!job) return null;

  const progress = Math.min(100, Math.max(0, job.progress || 0));

  return (
    <div className="w-full max-w-3xl mx-auto my-8 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-[#0f0f1c]/95 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-purple-950/50">
        
        {/* Ambient neon back-glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Animated spinner */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  strokeLinecap="round"
                  className="text-purple-500 transition-all duration-300"
                  fill="transparent"
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white font-mono">{progress}%</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            FFmpeg Processing In Progress
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-8">
            Executing hardware-accelerated video transcoding, stream downsampling, and spatial audio compression.
          </p>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-slate-800 mb-8 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Real-time stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-left mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-semibold uppercase">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Frames</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {job.currentFrame || 0}
                {job.totalFrames ? <span className="text-slate-500 text-xs"> / {job.totalFrames}</span> : ''}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-semibold uppercase">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Encoder FPS</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {job.fps ? `${job.fps.toFixed(1)} fps` : 'Analyzing...'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-semibold uppercase">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Speed Factor</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {job.speed || '1.0x'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-semibold uppercase">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Processed</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                {job.timeProcessed ? `${job.timeProcessed.toFixed(1)}s` : '0.0s'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Target: {job.settings.targetResolution || 'Original'} @ {job.settings.targetFps || 'Original'} FPS ({job.settings.videoCodec})</span>
          </div>

        </div>
      </div>
    </div>
  );
};
