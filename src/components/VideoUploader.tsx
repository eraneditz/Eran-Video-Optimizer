import React, { useRef, useState } from 'react';
import { UploadCloud, Film, Play, Sparkles, CheckCircle2, AlertCircle, HardDrive, Zap } from 'lucide-react';
import { VideoMetadata } from '../types/video';

interface VideoUploaderProps {
  onVideoSelected: (metadata: VideoMetadata) => void;
  isLoading: boolean;
  onLoadSample: (preset: '1080p' | '4k') => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoSelected,
  isLoading,
  onLoadSample
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze video');
      }

      onVideoSelected(data.metadata);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'An error occurred while uploading');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|mkv|webm|avi|flv|ts|m4v)$/i)) {
        setUploadError('Please select a valid video file (MP4, MKV, MOV, WebM, AVI, TS)');
        return;
      }
      await uploadFile(file);
    }
  };

  return (
    <div className="w-full">
      {/* Upload card container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-8 sm:p-12 text-center ${
          isDragging
            ? 'border-purple-400 bg-purple-950/30 scale-[1.01] shadow-2xl shadow-purple-500/20'
            : 'border-slate-800/80 hover:border-purple-500/50 bg-[#0f0f1a]/80 backdrop-blur-xl hover:bg-[#121222]'
        }`}
      >
        {/* Ambient neon backdrop gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-b from-purple-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none"></div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.mkv,.webm,.avi,.flv,.ts"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
          {/* Pulsing icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/25 mb-6 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-full h-full bg-[#0a0a12] rounded-[14px] flex items-center justify-center transition-transform group-hover:scale-95">
              <UploadCloud className="w-9 h-9 text-cyan-400 group-hover:text-purple-300 transition-colors" />
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Upload Video to <span className="text-purple-400">Optimize</span>
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
            Drag and drop your video file here, or browse from device storage. Supports 
            <span className="text-purple-300 font-semibold"> MP4, MOV, MKV, WebM, 8K &amp; 4K 120 FPS</span>.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all duration-200 cursor-pointer flex items-center space-x-2"
            >
              <HardDrive className="w-4 h-4" />
              <span>Browse Device Storage</span>
            </button>

            <span className="text-xs text-slate-500 font-medium px-1">or test immediately:</span>

            <button
              type="button"
              onClick={() => onLoadSample('1080p')}
              disabled={isLoading}
              className="px-4 py-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Load 1080p 60FPS Demo</span>
            </button>

            <button
              type="button"
              onClick={() => onLoadSample('4k')}
              disabled={isLoading}
              className="px-4 py-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Load 4K UHD 60FPS Demo</span>
            </button>
          </div>

          {/* Error alert */}
          {uploadError && (
            <div className="w-full max-w-md mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 text-left">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Feature checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-slate-800/80 text-left">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Native FFmpeg Engine</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>120 FPS &amp; 60 FPS High Rate</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Zero Artificial Sim</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span>Up to 80% File Savings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
