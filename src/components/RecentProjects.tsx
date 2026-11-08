import React from 'react';
import { Layers, Download, CheckCircle2, Clock, Trash2, ArrowUpRight, Film, X } from 'lucide-react';
import { OptimizationJob } from '../types/video';

interface RecentProjectsProps {
  recentJobs: OptimizationJob[];
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (job: OptimizationJob) => void;
  onClearHistory?: () => void;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  recentJobs,
  isOpen,
  onClose,
  onSelectJob
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-900/60 bg-[#0f0f1c] shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recently Processed Videos</h3>
              <p className="text-xs text-slate-400">Revisit, download, or review previous compression runs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {recentJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Film className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <span>No recently processed videos yet. Optimize a video to see it here!</span>
            </div>
          ) : (
            recentJobs.map(job => {
              const orig = job.sourceMetadata;
              const opt = job.outputMetadata;
              const savings = job.savedPercentage || 0;
              const dateStr = job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : 'Recently';

              return (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors font-mono truncate max-w-xs sm:max-w-sm">
                        {opt?.filename || orig.filename}
                      </span>
                      {savings > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          -{savings}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>{orig.resolution}</span>
                      <span>&bull;</span>
                      <span>{orig.fpsFormatted}</span>
                      <span>&bull;</span>
                      <span className="text-slate-300 font-mono">
                        {orig.filesizeFormatted} &rarr; <span className="text-purple-300 font-semibold">{opt?.filesizeFormatted || 'Optimized'}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-500">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectJob(job);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`/api/download/${job.id}`}
                      download={opt?.filename || 'optimized.mp4'}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
