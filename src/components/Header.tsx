import React from 'react';
import { Smartphone, Monitor, Apple, Sparkles, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenPlatformGuide: () => void;
  onOpenRecent: () => void;
  recentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPlatformGuide,
  onOpenRecent,
  recentCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-900/30 bg-[#08080c]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
            <img
              src="/assets/aistudio/IMG_20260702_082647_06152785.jpg"
              alt="ERAN EDITZ Logo"
              className="relative w-12 h-12 rounded-xl object-cover border border-purple-400/40 shadow-lg"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                ERAN <span className="text-purple-400 font-black">VIDEO OPTIMIZER</span>
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                PRO FFmpeg V7
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              High FPS &bull; 8K/4K UHD &bull; Cross-Platform Video Compression Studio
            </p>
          </div>
        </div>

        {/* Action badges & Platform status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Platform badges */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Ready for:</span>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
              <Smartphone className="w-3 h-3" />
              <span>Android</span>
            </span>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
              <Apple className="w-3 h-3" />
              <span>iOS</span>
            </span>
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">
              <Monitor className="w-3 h-3" />
              <span>Windows PC</span>
            </span>
          </div>

          {/* Recent projects button */}
          <button
            onClick={onOpenRecent}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
            title="View Recently Processed Videos"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Recent</span>
            {recentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                {recentCount}
              </span>
            )}
          </button>

          {/* Architecture / Platform Guide Modal Trigger */}
          <button
            onClick={onOpenPlatformGuide}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture &amp; SDK</span>
          </button>
        </div>

      </div>
    </header>
  );
};
