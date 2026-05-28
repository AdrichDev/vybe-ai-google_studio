/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Share2, Calendar, Globe, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetTitle?: string;
  assetType?: 'Image' | 'Video' | 'AI Agent-Generated' | 'image' | 'video' | 'audio' | 'template';
  imageUrl?: string;
  defaultPrompt?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  assetTitle = 'Cyberpunk Vanguard - Editorial Noir',
  assetType = 'Image',
  imageUrl = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  defaultPrompt = ''
}: ExportModalProps) {
  const [caption, setCaption] = useState(
    `Uncompromised aesthetics engineered by VYBE AI. 🎬✨ Celebrating the transition into futuristic editorial storytelling. Produced with Veo 3.1 & GPT-5.5. \n\n#Vanguard #AIArt #CinematicProduction #VybeAI`
  );
  const [scheduleDate, setScheduleDate] = useState('2026-05-29');
  const [scheduleTime, setScheduleTime] = useState('18:00');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram', 'tiktok']);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      // Trigger user native download notification simulation
      const element = document.createElement('a');
      element.setAttribute('href', imageUrl);
      element.setAttribute('download', `${assetTitle.toLowerCase().replace(/\s+/g, '_')}_${format}.jpg`);
      element.style.display = 'none';
      document.body.appendChild(element);
      // Simply trigger alert visually in modal state or state check
    }, 1500);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChannels.length === 0) return;
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        onClose();
      }, 3000);
    }, 2800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md"
          id="export-modal-backdrop"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-4xl bg-[#121212] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]"
          id="export-modal-panel"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800/30 transition-all z-20 cursor-pointer"
            id="close-modal-btn"
          >
            <X size={18} />
          </button>

          {/* Left Column: Asset Preview & Heavy Local Downloads */}
          <div className="w-full md:w-[42%] bg-zinc-950/40 p-6 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-mono tracking-widest text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded-full border border-[#00D2FF]/20 uppercase">
                  {assetType}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Master Asset Ready</span>
              </div>

              {/* Title and prompt overview */}
              <h3 className="text-lg font-medium text-white mb-2 tracking-tight" id="export-asset-title">
                {assetTitle}
              </h3>
              {defaultPrompt && (
                <p className="text-xs text-zinc-500 line-clamp-2 bg-zinc-900/40 p-2 rounded border border-zinc-800/30 font-mono mb-4">
                  "{defaultPrompt}"
                </p>
              )}

              {/* Image Preview Card */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800/70 mb-6 bg-zinc-900">
                <img
                  src={imageUrl}
                  alt={assetTitle}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex justify-between items-end">
                  <span className="text-[10px] font-mono text-zinc-400">8K Resolve Mode</span>
                  <span className="text-[10px] font-mono text-[#9B51E0] font-bold">RAW-PRO</span>
                </div>
              </div>
            </div>

            {/* Premium Download Targets */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">Premium Native Exports</h4>
              
              {/* ProRes / RAW */}
              <button
                onClick={() => handleDownload('raw')}
                disabled={downloadingFormat !== null}
                className="w-full relative flex items-center justify-between p-3.5 bg-zinc-900/60 hover:bg-zinc-800/50 border border-zinc-800/80 rounded-xl text-left transition-all hover:border-zinc-700/60 disabled:opacity-50 cursor-pointer"
                id="download-raw-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#9B51E0]/10 border border-[#9B51E0]/20 text-[#9B51E0]">
                    <Download size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Download Original</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Uncompressed Master • ~124.5 MB</div>
                  </div>
                </div>
                {downloadingFormat === 'raw' ? (
                  <span className="text-[10px] font-mono text-[#9B51E0] animate-pulse">Compiling Output...</span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500 font-bold text-[#00D2FF]">RAW PRO</span>
                )}
              </button>

              {/* Mobile MP4 */}
              <button
                onClick={() => handleDownload('optimized')}
                disabled={downloadingFormat !== null}
                className="w-full relative flex items-center justify-between p-3.5 bg-zinc-900/60 hover:bg-zinc-800/50 border border-zinc-800/80 rounded-xl text-left transition-all hover:border-zinc-700/60 disabled:opacity-50 cursor-pointer"
                id="download-optimized-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF]">
                    <Download size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Download Compressed</div>
                    <div className="text-[10px] text-zinc-500 font-mono">H.264 Fast Start • Web Ready • ~8.2 MB</div>
                  </div>
                </div>
                {downloadingFormat === 'optimized' ? (
                  <span className="text-[10px] font-mono text-[#00D2FF] animate-pulse font-bold">Compiling...</span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">OPTIMIZED</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Social Pipelines Form / Human-in-The-Loop */}
          <form
            onSubmit={handlePublish}
            className="flex-1 p-6 flex flex-col justify-between overflow-y-auto"
            id="publishing-pipeline-form"
          >
            {publishSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                  <CheckCircle2 size={32} />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Social Pipeline Approved</h3>
                <p className="text-zinc-400 text-sm max-w-sm">
                  The human-in-the-loop review was validated successfully. Assets have been queued and dispatched to target Instagram, TikTok and YouTube Graph APIs.
                </p>
                <span className="mt-6 text-xs text-zinc-600 font-mono">Transaction ID: TX_VYBE_98952_OK</span>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Share2 size={16} className="text-[#00D2FF]" />
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Social Orchestration</h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      OAUTH ACTIVE
                    </span>
                  </div>

                  {/* Channel Selectors */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Target Pipelines (Select Multi-Channel)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleChannel('instagram')}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedChannels.includes('instagram')
                            ? 'bg-[#9B51E0]/15 border-[#9B51E0]/50 text-white'
                            : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                        id="target-pipeline-instagram"
                      >
                        <span className="truncate">Instagram Reels</span>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ml-1.5 ${
                            selectedChannels.includes('instagram') ? 'bg-[#9B51E0]' : 'bg-transparent border border-zinc-600'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleChannel('tiktok')}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedChannels.includes('tiktok')
                            ? 'bg-[#00D2FF]/15 border-[#00D2FF]/50 text-white'
                            : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                        id="target-pipeline-tiktok"
                      >
                        <span className="truncate">TikTok</span>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ml-1.5 ${
                            selectedChannels.includes('tiktok') ? 'bg-[#00D2FF]' : 'bg-transparent border border-zinc-600'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleChannel('youtube')}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedChannels.includes('youtube')
                            ? 'bg-red-500/15 border-red-500/30 text-white'
                            : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                        id="target-pipeline-youtube"
                      >
                        <span className="truncate">YouTube Shorts</span>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ml-1.5 ${
                            selectedChannels.includes('youtube') ? 'bg-red-500' : 'bg-transparent border border-zinc-600'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Caption box */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        AI Generated Caption & Meta Tags
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCaption(
                            `Engineered with mathematical precision. 🦾✨ Cyberpunk Vanguard campaign drops tonight. Powered by VYBE AI multi-model workflows. \n\n#CreativeAgency #DesignAutomation #VybeAI #TokyoNeon`
                          );
                        }}
                        className="text-[10px] text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Sparkles size={10} /> Regenerate Copy
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full text-xs text-zinc-300 bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 focus:outline-none focus:border-zinc-700 font-sans resize-none placeholder-zinc-600 focus:ring-1 focus:ring-[#00D2FF]/30"
                      placeholder="Write your custom creative caption..."
                      id="export-caption-textarea"
                    />
                  </div>

                  {/* Scheduler inputs */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Schedule Distribution (Local Pipeline Time)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Calendar size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full text-xs text-zinc-300 bg-zinc-950/60 border border-zinc-800/80 rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:border-zinc-700 font-mono"
                        />
                      </div>
                      <div className="relative w-[130px]">
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full text-xs text-zinc-300 bg-zinc-950/60 border border-zinc-800/80 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit actions */}
                <div>
                  <div className="flex items-center gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/40 mb-4">
                    <AlertCircle size={14} className="text-[#00D2FF] flex-shrink-0" />
                    <span className="text-[10px] text-zinc-400 leading-normal font-mono">
                      Human Approval Required: Pressing validation confirms quality check & deploys metadata to Graph.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-800/80 rounded-xl text-xs py-3 transition-all cursor-pointer font-medium"
                      id="export-back-btn"
                    >
                      Dismiss View
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishing || selectedChannels.length === 0}
                      className="flex-1 relative bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white rounded-xl text-xs py-3 font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
                      id="export-publish-btn"
                    >
                      {isPublishing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing Cloud Nodes...</span>
                        </>
                      ) : (
                        <>
                          <Globe size={13} />
                          <span>Publish Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
