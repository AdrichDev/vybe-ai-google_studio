/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, Sparkles, Film, 
  ArrowRight, Eye, Music, Tv, Upload, Trash2, Mic 
} from 'lucide-react';
import { Project } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface VideoStudioViewProps {
  onAddProject: (project: Project) => void;
  onOpenExportModal: (project: Project) => void;
}

export default function VideoStudioView({ onAddProject, onOpenExportModal }: VideoStudioViewProps) {
  // Cinematic Timeline values
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(2.4);
  const totalDuration = 8.0;
  const currentFrame = Math.floor(currentTime * 30); // 30fps

  // Generation Prompt, status, and outcomes URL tracker
  const [prompt, setPrompt] = useState('Anamorphic drone pass over a sleek chrome Porsche gliding through neon wet streets of Shinjuku, rain particles flying towards the lens, slow motion 120fps');
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderStep, setRenderStep] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoPreviewImage, setVideoPreviewImage] = useState('https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=800&q=80');

  // Input Dropzones uploading files state
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');

  // Microphone and Interactive voice state
  const [isListening, setIsListening] = useState(false);

  // File Reference Inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Playback timers refs
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Speech to text simulator logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isListening) {
      timer = setTimeout(() => {
        setIsListening(false);
        setPrompt('Cinematic vertical glide following a luxury model dressed in gold satin, glowing warm studio spotlights, slow pan motion, 240fps macro focus.');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isListening]);

  // Video playback timing simulator
  useEffect(() => {
    if (isPlaying) {
      const updateFrame = (now: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime(prev => {
          let nextTime = prev + delta;
          if (nextTime >= totalDuration) {
            nextTime = 0; // wrap loop
          }
          return parseFloat(nextTime.toFixed(1));
        });

        animationFrameRef.current = requestAnimationFrame(updateFrame);
      };

      animationFrameRef.current = requestAnimationFrame(updateFrame);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Upload handlers
  const handleUploadedFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'video') {
        setVideoFile(result);
        setVideoFileName(file.name);
        setVideoPreviewImage(result); // Feed base preview
      } else {
        setAudioFile(result);
        setAudioFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Main Render Action trigger
  const handleRenderVideo = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setRenderProgress(0);
    setIsPlaying(false);

    const steps = [
      'Extracting key-frame vector anchors...',
      'Synthesizing temporal video frames...',
      'Mapping deep motion tracking vectors...',
      'Cloning voiceover parameters with guide track...',
      'Stitching auto-captions onto safe-area margins...'
    ];

    let stepIndex = 0;
    setRenderStep(steps[0]);

    // Animate rendering percents progress bar
    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }

        // update dynamic messages
        const wordIndex = Math.floor((next / 100) * steps.length);
        if (wordIndex !== stepIndex && wordIndex < steps.length) {
          stepIndex = wordIndex;
          setRenderStep(steps[wordIndex]);
        }
        return next;
      });
    }, 150);

    setTimeout(() => {
      setIsGenerating(false);
      setRenderStep('');

      // Finished rendering beautiful new car focus
      setVideoPreviewImage('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80');

      const newProj: Project = {
        id: `p-video-${Date.now()}`,
        title: 'Cinematic Motion Sequence - Master',
        timestamp: 'Just now',
        format: 'Video',
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
        status: 'Ready',
        prompt: prompt
      };

      onAddProject(newProj);
    }, 3200);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full" id="video-studio-workspace">
      
      {/* Parameters Panel - Replaced with pristine Dropzones */}
      <div className="w-full lg:w-[320px] bg-[#121212] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto" id="video-channels-panel">
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Film size={15} className="text-[#9B51E0]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Multimedia Inputs</h3>
          </div>

          {/* Hidden reference upload triggers */}
          <input 
            type="file" 
            ref={videoInputRef} 
            onChange={(e) => handleUploadedFile(e, 'video')} 
            accept="image/*,video/*"
            className="hidden" 
          />
          <input 
            type="file" 
            ref={audioInputRef} 
            onChange={(e) => handleUploadedFile(e, 'audio')} 
            accept="audio/*" 
            className="hidden" 
          />

          {/* DROPZONE 1: Core Base multimedia to transform */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">1. Media Base Image/Video</span>
            {videoFile ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <img 
                  src={videoFile} 
                  alt="Video template thumbnail" 
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{videoFileName || 'Base Media'}</p>
                  <span className="text-[9px] font-mono text-emerald-400 opacity-90">Ready to transform</span>
                </div>
                <button 
                  onClick={() => { setVideoFile(null); setVideoFileName(''); }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="group border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2"
                id="dropzone-media-base"
              >
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-[#00D2FF]/10 transition-colors">
                  <Upload size={14} className="text-zinc-400 group-hover:text-[#00D2FF]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-white">Upload Base Media</h4>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Video clip or starter frame</p>
                </div>
              </div>
            )}
          </div>

          {/* DROPZONE 2: Voice or Audio reference to synthesize */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">2. Voice / Audio Reference</span>
            {audioFile ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <div className="p-2 bg-[#9B51E0]/14 rounded-lg border border-[#9B51E0]/20 text-[#9B51E0]">
                  <Music size={14} className="animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{audioFileName || 'Reference Voice'}</p>
                  <span className="text-[9px] font-mono text-[#9B51E0]">Cloning target active</span>
                </div>
                <button 
                  onClick={() => { setAudioFile(null); setAudioFileName(''); }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => audioInputRef.current?.click()}
                className="group border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2"
                id="dropzone-voice-base"
              >
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-[#9B51E0]/10 transition-colors">
                  <Music size={14} className="text-zinc-400 group-hover:text-[#9B51E0]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-white">Reference Voice/Audio</h4>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Audio file for cloning layers</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info tag */}
        <div className="border-t border-zinc-900/80 pt-4 mt-6">
          <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
            Temporal render sequence processes vector points at 30fps natively. Captions clip seamlessly across vertical canvas structures.
          </p>
        </div>
      </div>

      {/* Main Video play space (Right Block) */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 min-h-0" id="video-preview-workspace">
        
        {/* Workspace head bar */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Tv size={15} className="text-[#00D2FF]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              {isGenerating ? "Synthesizing Motion sequence..." : "Video Workspace"}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {!isGenerating && (
              <button
                onClick={() => onOpenExportModal({
                  id: 'p-video-reel',
                  title: 'Aesthetic Generation Reel',
                  timestamp: 'Just now',
                  format: 'Video',
                  image: videoPreviewImage,
                  status: 'Ready',
                  prompt: prompt
                })}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-all"
                id="video-suite-export-btn"
              >
                <span>Export Reel</span>
                <ArrowRight size={13} className="text-[#00D2FF]" />
              </button>
            )}
            <span className="text-[9px] font-mono text-[#9B51E0] bg-[#9B51E0]/10 border border-[#9B51E0]/20 px-2.5 py-0.5 rounded-full select-none uppercase tracking-wider">
              9:16 Vertical Render
            </span>
          </div>
        </div>

        {/* Central Display box (status Ready to render etc) */}
        <div className="flex-1 flex items-center justify-center p-3 bg-zinc-950/80 rounded-xl border border-zinc-900/60 relative overflow-hidden" id="video-canvas-display">
          
          {/* Invisible system status tags based on states */}
          <div className="absolute top-4 left-4 z-20 bg-black/85 border border-zinc-800/80 rounded px-2.5 py-1 text-[9px] tracking-widest text-[#9B51E0] uppercase font-mono shadow-md">
            {isGenerating ? "Preparing your video..." : "Ready to render"}
          </div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-sm px-6 text-center"
                id="video-rendering-overlay"
              >
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#9B51E0]/20 border-t-[#9B51E0] animate-spin" />
                  <Film size={18} className="absolute inset-0 m-auto text-[#00D2FF] animate-pulse" />
                </div>
                
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono animate-pulse">
                  Rendering Multi-Frame Sequence
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {renderStep || 'Initializing vectors...'}
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-36 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] transition-all duration-300 animate-pulse"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#00D2FF] font-black">{renderProgress}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Responsive Vertical Player Mockup viewport */}
          <div className="relative aspect-[9/16] h-[340px] md:h-[400px] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-black">
            <img
              src={videoPreviewImage}
              alt="Motion landscape preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Simulated Live subtitle Overlay */}
            <div className="absolute inset-x-4 bottom-14 z-10 text-center pointer-events-none">
              <span className="bg-black/85 backdrop-blur-md px-3 py-1.5 border border-zinc-800/85 text-[10px] font-sans font-bold text-white shadow-xl rounded-lg select-none">
                {isPlaying 
                  ? currentTime < 3 
                    ? "🎬 Synthesizing sequence: High Contrast Shinjuku" 
                    : "⚡ Master timeline output running smoothly..."
                  : "🎬 Ready to play cinematic masterpiece"
                }
              </span>
            </div>

            {/* Media HUD Overlay parameter tracks */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-start font-mono text-[9px] text-white/70 select-none bg-black/45 p-2 rounded backdrop-blur-sm border border-white/5">
              <div>
                <div>FPS: 30 / VEO 3.1</div>
                <div>FRAME: {isPlaying ? currentFrame : 72}</div>
              </div>
              <div className="text-right">
                <div>TIME: {isPlaying ? currentTime.toFixed(1) : "2.4"}s</div>
                <div className="text-[#00D2FF]">SYS_OK</div>
              </div>
            </div>

            {/* Level meter animation track */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/45 px-2 py-1 rounded backdrop-blur-sm border border-white/5 text-[9px] text-zinc-300 font-mono">
              <Volume2 size={11} className="text-[#00D2FF]" />
              <div className="flex gap-0.5 items-end h-2.5 w-6">
                {[3, 7, 2, 6, 4].map((h, i) => (
                  <span
                    key={i}
                    className={`bg-[#00D2FF] w-[1.5px] rounded-full transition-all duration-200 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{ height: isPlaying ? `${Math.random() * 8 + 2}px` : `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Play indicator when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlayback}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/80 hover:bg-black/90 text-white flex items-center justify-center border border-zinc-800/60 shadow-2xl duration-200 cursor-pointer hover:scale-105"
              >
                <Play size={16} fill="white" className="ml-0.5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Media Player Scrubber bar Controls */}
        <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl flex items-center justify-between mt-4" id="media-controller-bar">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayback}
              type="button"
              className="p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white cursor-pointer rounded-lg hover:scale-105 transition-transform"
              id="controller-play-toggle"
            >
              {isPlaying ? <Pause size={13} fill="white" /> : <Play size={13} fill="white" />}
            </button>
            <button
              onClick={resetPlayback}
              type="button"
              className="p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer rounded-lg transition-colors"
              id="controller-reset"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="flex-1 mx-5 flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">
              {isPlaying ? currentTime.toFixed(1) : "2.4"}s
            </span>
            <div className="flex-1 h-1 bg-zinc-950 rounded-full relative cursor-pointer group">
              <div 
                className="h-full bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] rounded-full"
                style={{ width: `${((isPlaying ? currentTime : 2.4) / totalDuration) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500">8.0s</span>
          </div>

          <div className="hidden sm:inline-flex items-center text-[9px] font-mono text-zinc-500">
            PRORES STANDBY
          </div>
        </div>

        {/* Console generation dual input keyboard / Microphone */}
        <div className="mt-4" id="video-prompt-panel">
          <div className="relative flex items-center bg-zinc-900/60 border border-zinc-800/85 p-1 rounded-xl focus-within:border-zinc-700 transition-all duration-300">
            
            {/* Listening mic simulation */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-3.5 rounded-lg transition-all duration-300 flex items-center justify-center relative select-none cursor-pointer ${
                isListening 
                  ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-xl animate-pulse' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
              title="Voice Guide"
              id="video-voice-trigger"
            >
              <Mic size={15} className={isListening ? 'scale-110' : ''} />
              {isListening && (
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-ping opacity-25 z-[-1]" />
              )}
            </button>

            <input
              type="text"
              value={isListening ? "Listening..." : prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create..."
              disabled={isGenerating || isListening}
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 py-3.5 px-4 focus:outline-none disabled:opacity-60"
              id="video-prompt-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenderVideo();
              }}
            />

            {/* Listening wave indicators */}
            {isListening ? (
              <div className="flex items-center gap-1 px-4 text-xs font-mono text-[#00D2FF]">
                <span className="w-1 bg-[#00D2FF] h-4 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#9B51E0] h-6 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-[#00D2FF] h-3 rounded animate-bounce" style={{ animationDelay: '0.5s' }} />
                <span className="text-[10px] ml-1 tracking-widest">Listening...</span>
              </div>
            ) : (
              <button
                onClick={handleRenderVideo}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer whitespace-nowrap"
                id="render-reel-btn"
              >
                Render Video
              </button>
            )}
          </div>

          <p className="text-[10px] text-zinc-600 font-mono mt-2 px-2">
            Multi-model intelligence processes scripts, dynamic clips and guide voices in absolute silence.
          </p>
        </div>

      </div>
    </div>
  );
}
