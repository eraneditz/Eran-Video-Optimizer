import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { VideoInfoPanel } from './components/VideoInfoPanel';
import { OptimizationControls } from './components/OptimizationControls';
import { ProcessingView } from './components/ProcessingView';
import { ResultComparison } from './components/ResultComparison';
import { RecentProjects } from './components/RecentProjects';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { OptimizationJob, OptimizationSettings, VideoMetadata } from './types/video';
import { AlertCircle, Film, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function App() {
  // Step state
  const [currentStep, setCurrentStep] = useState<'upload' | 'info' | 'settings' | 'processing' | 'results'>('upload');
  
  // Video and job state
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [currentJob, setCurrentJob] = useState<OptimizationJob | null>(null);
  const [recentJobs, setRecentJobs] = useState<OptimizationJob[]>([]);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showRecentModal, setShowRecentModal] = useState<boolean>(false);
  const [showPlatformGuide, setShowPlatformGuide] = useState<boolean>(false);

  // Fetch recent projects on mount
  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const res = await fetch('/api/recent');
      if (res.ok) {
        const data = await res.json();
        if (data.recent) {
          setRecentJobs(data.recent);
        }
      }
    } catch (e) {
      console.error('Error fetching recent jobs:', e);
    }
  };

  // Handle video upload or selection
  const handleVideoSelected = (metadata: VideoMetadata) => {
    setSelectedVideo(metadata);
    setCurrentStep('info');
    setErrorMessage(null);
  };

  // Handle loading demo sample video (1080p or 4k)
  const handleLoadSample = async (preset: '1080p' | '4k') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/sample/${preset}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load sample clip');
      }
      setSelectedVideo(data.metadata);
      setCurrentStep('info');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not load sample video');
    } finally {
      setIsLoading(false);
    }
  };

  // Start FFmpeg Optimization
  const handleStartOptimization = async (settings: OptimizationSettings) => {
    if (!selectedVideo) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStep('processing');

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: selectedVideo.id,
          settings
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate optimization');
      }

      const jobId = data.jobId;
      setCurrentJob(data.job);

      // Listen via Server-Sent Events (SSE) for real-time progress
      const eventSource = new EventSource(`/api/jobs/${jobId}/events`);

      eventSource.onmessage = (event) => {
        try {
          const updatedJob: OptimizationJob = JSON.parse(event.data);
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'completed') {
            eventSource.close();
            setCurrentStep('results');
            fetchRecentJobs();
          } else if (updatedJob.status === 'failed') {
            eventSource.close();
            setErrorMessage(updatedJob.error || 'Video optimization failed in FFmpeg');
            setCurrentStep('settings');
          }
        } catch (e) {
          console.error('Error parsing SSE job update:', e);
        }
      };

      eventSource.onerror = () => {
        // Fallback to polling if SSE has an issue
        eventSource.close();
        pollJobStatus(jobId);
      };

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Optimization request failed');
      setCurrentStep('settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback Polling
  const pollJobStatus = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.job) {
          setCurrentJob(data.job);
          if (data.job.status === 'completed') {
            clearInterval(pollInterval);
            setCurrentStep('results');
            fetchRecentJobs();
          } else if (data.job.status === 'failed') {
            clearInterval(pollInterval);
            setErrorMessage(data.job.error || 'Optimization failed');
            setCurrentStep('settings');
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 500);
  };

  // Reset to initial upload state
  const handleReset = () => {
    setSelectedVideo(null);
    setCurrentJob(null);
    setCurrentStep('upload');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Header */}
      <Header
        onOpenPlatformGuide={() => setShowPlatformGuide(true)}
        onOpenRecent={() => setShowRecentModal(true)}
        recentCount={recentJobs.length}
      />

      {/* Main container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Breadcrumb Stepper */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 text-xs font-semibold whitespace-nowrap">
            <button
              onClick={() => setCurrentStep('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentStep === 'upload'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              1. Upload Video
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            <button
              disabled={!selectedVideo}
              onClick={() => selectedVideo && setCurrentStep('info')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !selectedVideo
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500'
                  : currentStep === 'info'
                  ? 'bg-purple-600 text-white font-bold cursor-pointer'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              2. Technical Metadata
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            <button
              disabled={!selectedVideo}
              onClick={() => selectedVideo && setCurrentStep('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !selectedVideo
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500'
                  : currentStep === 'settings'
                  ? 'bg-purple-600 text-white font-bold cursor-pointer'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              3. Resolution &amp; FPS Config
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            <span
              className={`px-3 py-1.5 rounded-lg ${
                currentStep === 'processing'
                  ? 'bg-cyan-600 text-white font-bold'
                  : currentStep === 'results'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-900/40 text-slate-600'
              }`}
            >
              4. Transcode &amp; Results
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-red-200 font-bold underline cursor-pointer ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step Views */}
        {currentStep === 'upload' && (
          <VideoUploader
            onVideoSelected={handleVideoSelected}
            isLoading={isLoading}
            onLoadSample={handleLoadSample}
          />
        )}

        {currentStep === 'info' && selectedVideo && (
          <VideoInfoPanel
            metadata={selectedVideo}
            onChangeVideo={handleReset}
            onProceedToOptimize={() => setCurrentStep('settings')}
          />
        )}

        {currentStep === 'settings' && selectedVideo && (
          <OptimizationControls
            metadata={selectedVideo}
            onStartOptimization={handleStartOptimization}
            isProcessing={isLoading}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingView job={currentJob} />
        )}

        {currentStep === 'results' && currentJob && (
          <ResultComparison
            job={currentJob}
            onReset={handleReset}
            onReconfigure={() => setCurrentStep('settings')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#060609] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">ERAN VIDEO OPTIMIZER</span>
            <span>&bull;</span>
            <span>High Performance Native FFmpeg Processing Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Preserves 120 FPS &amp; 4K UHD</span>
            <span>&bull;</span>
            <span>Full Android, iOS &amp; Windows Ready</span>
          </div>
        </div>
      </footer>

      {/* Recent Projects Modal */}
      <RecentProjects
        isOpen={showRecentModal}
        onClose={() => setShowRecentModal(false)}
        recentJobs={recentJobs}
        onSelectJob={(job) => {
          setCurrentJob(job);
          setSelectedVideo(job.sourceMetadata);
          setCurrentStep('results');
        }}
      />

      {/* Platform & Architecture Guide Modal */}
      <PlatformGuideModal
        isOpen={showPlatformGuide}
        onClose={() => setShowPlatformGuide(false)}
      />

    </div>
  );
}
