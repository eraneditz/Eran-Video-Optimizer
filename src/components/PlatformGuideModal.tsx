import React, { useState } from 'react';
import { X, Smartphone, Apple, Monitor, Code2, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'android' | 'ios' | 'windows'>('flutter');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const flutterCodeSnippet = `// ERAN VIDEO OPTIMIZER - Flutter & Dart Integration Engine
// Compatible with Android, iOS, and Windows Desktop
import 'package:ffmpeg_kit_flutter/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter/return_code.dart';
import 'package:ffmpeg_kit_flutter/session.dart';

class EranVideoOptimizer {
  /// Executes hardware-accelerated video compression
  static Future<void> optimizeVideo({
    required String inputPath,
    required String outputPath,
    String resolution = '1920:1080',
    int targetFps = 60,
    int crf = 23,
    String audioBitrate = '192k',
    Function(double progress)? onProgress,
  }) async {
    // Exact FFmpeg CLI argument pipeline matching the Eran Engine
    final command = '-y -i "$inputPath" '
        '-vf "scale=$resolution:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,fps=$targetFps" '
        '-c:v libx264 -crf $crf -preset faster -pix_fmt yuv420p '
        '-c:a aac -b:a $audioBitrate -movflags +faststart "$outputPath"';

    await FFmpegKit.executeAsync(
      command,
      (Session session) async {
        final returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          print("ERAN Optimization Succeeded: $outputPath");
        } else {
          print("Optimization failed with code: $returnCode");
        }
      },
      (log) => print(log.getMessage()),
      (statistics) {
        if (onProgress != null && statistics.getTime() > 0) {
          onProgress(statistics.getTime() / 1000.0);
        }
      },
    );
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(flutterCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl border border-purple-900/60 bg-[#0f0f1c] shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-[#0a0a14] rounded-[10px] flex items-center justify-center text-cyan-400">
                <Code2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Cross-Platform Architecture</h3>
              <p className="text-xs text-slate-400">Android &bull; iOS &bull; Windows PC Native FFmpeg Integration Specs</p>
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

        {/* Platform tabs */}
        <div className="flex items-center space-x-2 pt-4 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'flutter'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <span>Flutter &amp; Dart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Native</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'ios'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS Native</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'windows'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows PC</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          
          {activeTab === 'flutter' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dart / Flutter FFmpegKit Service Implementation</span>
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Dart Code'}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-black/90 p-4 border border-slate-800 overflow-x-auto text-[11px] font-mono text-purple-200">
                <pre>{flutterCodeSnippet}</pre>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white">Android NDK &amp; MediaCodec Architecture</h4>
              <p>
                For pure native Android APK releases, the ERAN optimizer commands can be compiled into Android JNI
                libraries via <code>ffmpeg-kit-android</code> or Android MediaCodec hardware encoder.
              </p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hardware Acceleration: Qualcomm Adreno / MediaTek / Mali</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Supports up to 120 FPS high refresh gaming screen capture</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>H.264 &amp; H.265 (HEVC) hardware encoding support</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white">iOS VideoToolbox &amp; Swift Architecture</h4>
              <p>
                On iOS, Apple's <code>VideoToolbox.framework</code> hardware acceleration is used alongside FFmpeg to achieve
                blazing fast transcode speeds with minimal battery impact on iPhones and iPads.
              </p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apple Silicon A-Series &amp; M-Series Hardware Media Engine</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Full support for ProRAW, ProRes &amp; HDR 10-bit Dolby Vision</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white">Windows PC Desktop Architecture</h4>
              <p>
                On Windows 10 &amp; 11 (64-bit), the application interfaces directly with <code>ffmpeg.exe</code> and GPU
                acceleration profiles: NVIDIA NVENC (<code>h264_nvenc</code>), AMD AMF (<code>h264_amf</code>), and Intel QuickSync (<code>h264_qsv</code>).
              </p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>NVIDIA GeForce NVENC / AMD Radeon AMF GPU offload</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Full 8K 60FPS and 4K 120FPS ultra-high bandwidth pipeline</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
