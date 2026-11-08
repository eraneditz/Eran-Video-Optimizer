import React, { useEffect, useState } from 'react';
import {
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  FileCheck,
  Share2,
  HardDrive,
  Maximize2,
  Gauge,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OptimizationJob } from '../types/video';

interface ResultComparisonProps {
  job: OptimizationJob;
  onReset: () => void;
  onReconfigure: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  job,
  onReset,
  onReconfigure
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<'sideBySide' | 'splitSlider'>('sideBySide');

  useEffect(() => {
    // Fire confetti burst upon mounting results
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#38bdf8', '#ec4899', '#34d399']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const origMeta = job.sourceMetadata;
  const optMeta = job.outputMetadata;
  const savingsPct = job.savedPercentage || 0;

  const downloadUrl = `/api/download/${job.id}`;
  const optimizedStreamUrl = `/api/media/output/${job.id}`;

  const exportReport = () => {
    const report = {
      app: 'ERAN VIDEO OPTIMIZER',
      jobId: job.id,
      timestamp: new Date().toISOString(),
      original: {
        filename: origMeta.filename,
        filesize: origMeta.filesizeFormatted,
        resolution: origMeta.resolution,
        fps: origMeta.fpsFormatted,
        codec: origMeta.videoCodec,
        bitrate: origMeta.videoBitrateFormatted
      },
      optimized: {
        filename: optMeta?.filename,
        filesize: optMeta?.filesizeFormatted,
        resolution: optMeta?.resolution,
        fps: optMeta?.fpsFormatted,
        codec: optMeta?.videoCodec,
        bitrate: optMeta?.videoBitrateFormatted,
        savings: `${savingsPct}%`
      },
      settingsApplied: job.settings
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eran-optimization-report-${job.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      
      {/* Top Completion Hero Card */}
      <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-[#0f0f1c] to-[#0a0a14] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimization Complete &amp; Verified</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Video Successfully <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Optimized!</span>
            </h2>

            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              File size reduced by <span className="text-emerald-400 font-bold font-mono">{savingsPct}%</span> from{' '}
              <span className="text-slate-200 font-semibold">{origMeta.filesizeFormatted}</span> down to{' '}
              <span className="text-purple-300 font-semibold font-mono">{optMeta?.filesizeFormatted || 'Optimized'}</span> while preserving visual fidelity.
            </p>
          </div>

          {/* Savings Badge */}
          <div className="flex items-center space-x-4 shrink-0 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Storage Savings</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {savingsPct > 0 ? `-${savingsPct}%` : 'Lossless'}
              </div>
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-slate-800/80 relative z-10">
          <a
            href={downloadUrl}
            download={optMeta?.filename || 'optimized-video.mp4'}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Optimized Video</span>
          </a>

          <button
            type="button"
            onClick={exportReport}
            className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Spec</span>
          </button>

          <button
            type="button"
            onClick={onReconfigure}
            className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>Adjust Settings</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ml-auto"
          >
            <span>Process New Video</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Comparison View Tabs & Player */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0f0f1c]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Interactive Visual Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verify visual fidelity, compression quality, and fluid motion playback.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('sideBySide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'sideBySide'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('splitSlider')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'splitSlider'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split-Screen Slider
            </button>
          </div>
        </div>

        {/* Side-by-Side Mode */}
        {activeTab === 'sideBySide' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Original Source Video</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {origMeta.filesizeFormatted} &bull; {origMeta.resolution}
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                <video
                  src={origMeta.url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Optimized */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  <span>Optimized ERAN Video</span>
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {optMeta?.filesizeFormatted} &bull; {optMeta?.resolution} (-{savingsPct}%)
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 bg-black aspect-video flex items-center justify-center">
                <video
                  src={optimizedStreamUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

          </div>
        ) : (
          /* Split Slider Mode */
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-black select-none">
              
              {/* Optimized video as background */}
              <video
                src={optimizedStreamUrl}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Slider overlay bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-white to-cyan-400 pointer-events-none z-20 shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-2xl border-2 border-purple-500">
                  &#x21D4;
                </div>
              </div>

              {/* Badges on top */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-slate-300 pointer-events-none">
                Original ({origMeta.filesizeFormatted})
              </div>
              <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 backdrop-blur-md text-[11px] font-bold text-purple-200 pointer-events-none">
                Optimized ({optMeta?.filesizeFormatted})
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-xs text-slate-400">Drag to compare:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={e => setSliderPos(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-mono text-purple-300 font-bold w-12 text-right">{sliderPos}%</span>
            </div>
          </div>
        )}

        {/* Detailed Metrics Comparison Table */}
        <div className="pt-6 border-t border-slate-800/80">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Technical Specification Comparison
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Attribute</th>
                  <th className="p-3">Original Source</th>
                  <th className="p-3">Optimized Output</th>
                  <th className="p-3 rounded-r-xl">Delta / Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">File Size</td>
                  <td className="p-3">{origMeta.filesizeFormatted}</td>
                  <td className="p-3 text-purple-300 font-bold">{optMeta?.filesizeFormatted}</td>
                  <td className="p-3 text-emerald-400 font-bold">-{savingsPct}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">Resolution</td>
                  <td className="p-3">{origMeta.resolution}</td>
                  <td className="p-3 text-cyan-300">{optMeta?.resolution}</td>
                  <td className="p-3 text-slate-400">
                    {origMeta.resolution === optMeta?.resolution ? 'Preserved' : 'Transcaled'}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">Frame Rate</td>
                  <td className="p-3">{origMeta.fpsFormatted}</td>
                  <td className="p-3 text-yellow-300">{optMeta?.fpsFormatted}</td>
                  <td className="p-3 text-slate-400">
                    {origMeta.fps === optMeta?.fps ? 'Preserved' : `${optMeta?.fps} FPS`}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">Video Codec</td>
                  <td className="p-3">{origMeta.videoCodec}</td>
                  <td className="p-3 text-purple-300">{optMeta?.videoCodec}</td>
                  <td className="p-3 text-slate-400">{job.settings.videoCodec}</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">Video Bitrate</td>
                  <td className="p-3">{origMeta.videoBitrateFormatted}</td>
                  <td className="p-3 text-cyan-300">{optMeta?.videoBitrateFormatted}</td>
                  <td className="p-3 text-emerald-400 font-bold">Optimized</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-medium text-slate-400">Audio Codec &amp; Bitrate</td>
                  <td className="p-3">{origMeta.audioCodec} @ {origMeta.audioBitrateFormatted}</td>
                  <td className="p-3 text-slate-200">{optMeta?.audioCodec} @ {optMeta?.audioBitrateFormatted}</td>
                  <td className="p-3 text-slate-400">Synced</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
