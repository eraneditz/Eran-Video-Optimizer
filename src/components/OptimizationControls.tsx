import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Zap,
  Share2,
  Minimize2,
  Film,
  Settings2,
  Play,
  Scissors,
  Check,
  Cpu,
  Layers,
  Volume2
} from 'lucide-react';
import { OptimizationPreset, OptimizationSettings, VideoMetadata } from '../types/video';
import { PRESET_CONFIGS } from '../utils/videoUtils';

interface OptimizationControlsProps {
  metadata: VideoMetadata;
  onStartOptimization: (settings: OptimizationSettings) => void;
  isProcessing: boolean;
}

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({
  metadata,
  onStartOptimization,
  isProcessing
}) => {
  const [selectedPreset, setSelectedPreset] = useState<OptimizationPreset>('balanced');
  
  // Optimization granular settings state initialized from balanced preset
  const [targetResolution, setTargetResolution] = useState<OptimizationSettings['targetResolution']>('original');
  const [targetFps, setTargetFps] = useState<OptimizationSettings['targetFps']>('original');
  const [videoCodec, setVideoCodec] = useState<OptimizationSettings['videoCodec']>('libx264');
  const [crf, setCrf] = useState<number>(23);
  const [speedPreset, setSpeedPreset] = useState<OptimizationSettings['speedPreset']>('faster');
  const [audioCodec, setAudioCodec] = useState<OptimizationSettings['audioCodec']>('aac');
  const [audioBitrate, setAudioBitrate] = useState<OptimizationSettings['audioBitrate']>('192k');
  
  // Trimming
  const [enableTrim, setEnableTrim] = useState<boolean>(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(Math.min(metadata.duration || 60, 60));

  // Switch preset
  const applyPreset = (presetKey: OptimizationPreset) => {
    setSelectedPreset(presetKey);
    const config = PRESET_CONFIGS[presetKey];
    if (config) {
      if (config.targetResolution) setTargetResolution(config.targetResolution);
      if (config.targetFps) setTargetFps(config.targetFps);
      if (config.videoCodec) setVideoCodec(config.videoCodec);
      if (config.crf !== undefined) setCrf(config.crf);
      if (config.speedPreset) setSpeedPreset(config.speedPreset);
      if (config.audioCodec) setAudioCodec(config.audioCodec);
      if (config.audioBitrate) setAudioBitrate(config.audioBitrate);
    }
  };

  const handleStart = () => {
    const settings: OptimizationSettings = {
      preset: selectedPreset,
      targetResolution,
      targetFps,
      videoCodec,
      crf,
      speedPreset,
      audioCodec,
      audioBitrate,
      trim: enableTrim
        ? {
            enabled: true,
            startTime: Math.max(0, trimStart),
            endTime: Math.min(metadata.duration || trimEnd, trimEnd)
          }
        : undefined
    };

    onStartOptimization(settings);
  };

  // Preset definitions
  const presetsList: Array<{
    id: OptimizationPreset;
    name: string;
    description: string;
    icon: any;
    tag: string;
    badgeColor: string;
  }> = [
    {
      id: 'balanced',
      name: 'Smart Balanced',
      description: 'Ideal sweet spot between small file size and high fidelity.',
      icon: Sparkles,
      tag: 'Recommended',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'esports_high_fps',
      name: 'Esports & Gaming',
      description: 'Preserves 120 FPS / 60 FPS motion clarity with low compression artifacts.',
      icon: Zap,
      tag: '120/60 FPS',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
    },
    {
      id: 'web_social',
      name: 'Social & Reels',
      description: 'Optimized for TikTok, Instagram Reels, YouTube Shorts, and X.',
      icon: Share2,
      tag: 'Social Media',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'ultra_compression',
      name: 'Ultra Compact',
      description: 'Extreme size reduction for Discord (<25MB), WhatsApp & email sharing.',
      icon: Minimize2,
      tag: '<25MB Discord',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'cinematic_fidelity',
      name: 'Cinematic Master',
      description: 'High-bitrate studio master with 320k audio for 4K and films.',
      icon: Film,
      tag: 'Master 4K',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
    },
    {
      id: 'custom',
      name: 'Custom Studio',
      description: 'Full manual control over resolution, codecs, CRF, and FPS parameters.',
      icon: Settings2,
      tag: 'Pro Control',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>Optimization &amp; Transcoding Settings</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose an intelligent preset or fine-tune exact resolution, frame rate, and encoder parameters.
          </p>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          1. Select Optimization Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {presetsList.map(preset => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-500/20'
                    : 'border-slate-800/80 bg-[#0f0f1a]/80 hover:bg-[#131322] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/40'
                          : 'bg-slate-800/90 text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                      {preset.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mb-1">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {preset.id === 'esports_high_fps' ? '120/60 FPS • CRF 20' :
                     preset.id === 'web_social' ? '1080p60 • Fast Start' :
                     preset.id === 'ultra_compression' ? '720p • Max Savings' :
                     preset.id === 'cinematic_fidelity' ? 'Orig Res • CRF 18' : 'Smart Auto'}
                  </span>
                  {isSelected && (
                    <span className="flex items-center space-x-1 text-purple-300 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Controls Accordion / Panel */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0f0f1c]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Resolution, FPS &amp; Compression Engine</span>
          </h3>
          <span className="text-xs text-slate-400">
            Current input: <span className="text-purple-300 font-mono font-bold">{metadata.resolution} @ {metadata.fpsFormatted}</span>
          </span>
        </div>

        {/* Resolution & FPS Support Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Resolution */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Target Resolution
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'original', label: 'Preserve Original', sub: metadata.resolution },
                { id: '8k', label: '8K Ultra HD', sub: '7680x4320' },
                { id: '4k', label: '4K UHD', sub: '3840x2160' },
                { id: '2k', label: '2K / 1440p', sub: '2560x1440' },
                { id: '1080p', label: '1080p FHD', sub: '1920x1080' },
                { id: '720p', label: '720p HD', sub: '1280x720' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetResolution(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetResolution === item.id
                      ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/20'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target FPS / Frame Rate */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Target Frame Rate (FPS)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'original', label: 'Preserve Original', sub: metadata.fpsFormatted },
                { id: '120', label: '120 FPS', sub: 'Ultra High Rate' },
                { id: '60', label: '60 FPS', sub: 'Smooth Gaming' },
                { id: '30', label: '30 FPS', sub: 'Standard Web' },
                { id: '24', label: '24 FPS', sub: 'Cinematic Film' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetFps(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetFps === item.id
                      ? 'border-yellow-400 bg-yellow-950/30 text-white shadow-md shadow-yellow-500/20'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Codec & Quality CRF Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
          
          {/* Video Codec */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Video Codec
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'libx264', label: 'H.264 / AVC', sub: 'Universal (All Devices)' },
                { id: 'libx265', label: 'H.265 / HEVC', sub: '50% Smaller Size' },
                { id: 'libvpx-vp9', label: 'VP9', sub: 'Web Standard' }
              ].map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setVideoCodec(c.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    videoCodec === c.id
                      ? 'border-purple-400 bg-purple-950/30 text-white shadow-md shadow-purple-500/20'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{c.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (CRF) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Quality Factor (CRF: {crf})
              </label>
              <span className="text-xs text-purple-300 font-mono">
                {crf <= 18 ? 'Visually Lossless' : crf <= 23 ? 'Balanced Quality' : crf <= 28 ? 'High Compression' : 'Maximum Savings'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={16}
                max={34}
                value={crf}
                onChange={e => setCrf(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>16 (Master Studio)</span>
                <span>20 (Esports)</span>
                <span>23 (Default)</span>
                <span>28 (Discord)</span>
                <span>34 (Tiny)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Audio Optimization & Speed Preset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
          
          {/* Audio Options */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Optimization</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={audioCodec}
                onChange={e => setAudioCodec(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="aac">AAC (Recommended)</option>
                <option value="mp3">MP3 Audio</option>
                <option value="copy">Copy Original Audio</option>
                <option value="mute">Mute / Remove Audio</option>
              </select>

              <select
                value={audioBitrate}
                onChange={e => setAudioBitrate(e.target.value as any)}
                disabled={audioCodec === 'mute' || audioCodec === 'copy'}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-40"
              >
                <option value="original">Original Audio Bitrate</option>
                <option value="320k">320 kbps (High Fidelity)</option>
                <option value="256k">256 kbps (Studio)</option>
                <option value="192k">192 kbps (Standard)</option>
                <option value="128k">128 kbps (Compact)</option>
                <option value="64k">64 kbps (Voice / Ultra Low)</option>
              </select>
            </div>
          </div>

          {/* Speed Preset */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              FFmpeg Encoding Speed Preset
            </label>
            <select
              value={speedPreset}
              onChange={e => setSpeedPreset(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ultrafast">ultrafast (Fastest processing, slightly larger file)</option>
              <option value="superfast">superfast (Very fast processing)</option>
              <option value="veryfast">veryfast (Fast processing)</option>
              <option value="faster">faster (Balanced speed &amp; file size - Recommended)</option>
              <option value="fast">fast (Better compression)</option>
              <option value="medium">medium (Maximum compression density, slower)</option>
            </select>
          </div>

        </div>

        {/* Optional Trimming Timeline */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setEnableTrim(!enableTrim)}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-purple-400" />
              <span>Trim Video Clip (Optional)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${enableTrim ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                {enableTrim ? 'Enabled' : 'Disabled'}
              </span>
            </button>
            {enableTrim && (
              <span className="text-xs text-cyan-400 font-mono">
                Duration: {Math.max(0, trimEnd - trimStart).toFixed(1)}s
              </span>
            )}
          </div>

          {enableTrim && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Start Time (seconds):</label>
                <input
                  type="number"
                  min={0}
                  max={metadata.duration || 1000}
                  step={0.5}
                  value={trimStart}
                  onChange={e => setTrimStart(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">End Time (seconds):</label>
                <input
                  type="number"
                  min={trimStart + 0.5}
                  max={metadata.duration || 1000}
                  step={0.5}
                  value={trimEnd}
                  onChange={e => setTrimEnd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Start Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START FFMPEG OPTIMIZATION</span>
        </button>
      </div>

    </div>
  );
};
