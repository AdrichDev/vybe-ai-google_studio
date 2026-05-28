/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Eye, ArrowRight, Download, Upload, Mic, Trash2, 
  ZoomIn, ZoomOut, HelpCircle, Layers, Split, Play 
} from 'lucide-react';
import { Project } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoStudioViewProps {
  onAddProject: (project: Project) => void;
  onOpenExportModal: (project: Project) => void;
}

const PREMIUM_OUTPUTS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80'
];

export default function PhotoStudioView({ onAddProject, onOpenExportModal }: PhotoStudioViewProps) {
  const [prompt, setPrompt] = useState('A premium high-fashion influencer model wearing clean satin black sunglasses, cyberpunk studio side-lights, extreme hyper-fidelity skin texture, editorial grain.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Dropzone files states
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [baseFileName, setBaseFileName] = useState<string>('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refFileName, setRefFileName] = useState<string>('');

  // Before / After View toggle state
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Zoom scale

  // Microphone active listening animation states
  const [isListening, setIsListening] = useState(false);

  // File Reference Inputs
  const baseInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  // Active listening auto typing trigger simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isListening) {
      timer = setTimeout(() => {
        setIsListening(false);
        setPrompt('Close-up photograph of luxury streetwear leather jacket in dark concrete studio, soft golden ambient rim-lighting, highly complex fabric weave detail, Raw film style.');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isListening]);

  // File loading helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'base' | 'ref') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'base') {
        setBaseImage(result);
        setBaseFileName(file.name);
        setActiveTab('before'); // Automatically switch to view the raw uploaded image
      } else {
        setRefImage(result);
        setRefFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);

    const steps = [
      'Decompressing base model weight variables...',
      'Mapping visual lighting reference overlays...',
      'Injecting latent noise grids into active canvas...',
      'Scaling neural upscale filters (Veo 3.1 Pro)...',
      'Finalizing high-fidelity skin micro-textures...'
    ];

    let currentStepIndex = 0;
    setSimulatedStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setSimulatedStep(steps[currentStepIndex]);
      } else {
        clearInterval(stepInterval);
      }
    }, 500);

    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab('after'); // Automatically set focus on the gorgeous final rendering
      setSimulatedStep('');

      // Pick random luxury outcome
      const targetImage = PREMIUM_OUTPUTS[Math.floor(Math.random() * PREMIUM_OUTPUTS.length)];

      const newProj: Project = {
        id: `p-gen-${Date.now()}`,
        title: prompt.substring(0, 35) + '...',
        timestamp: 'Just now',
        format: 'Image',
        image: targetImage,
        status: 'Ready',
        prompt: prompt
      };

      onAddProject(newProj);
    }, 3000);
  };

  // Default images in case nothing is uploaded
  const defaultBeforeImage = baseImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80';
  const defaultAfterImage = hasGenerated
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80';

  const previewSrc = activeTab === 'before' ? defaultBeforeImage : defaultAfterImage;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full" id="photo-studio-workspace">
      
      {/* 2 Dropzones on Left Panel */}
      <div className="w-full lg:w-[320px] bg-[#121212] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto" id="multimodal-reference-panel">
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Layers size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Input Channels</h3>
          </div>

          {/* Hidden Inputs */}
          <input 
            type="file" 
            ref={baseInputRef} 
            onChange={(e) => handleFileChange(e, 'base')} 
            accept="image/*" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={refInputRef} 
            onChange={(e) => handleFileChange(e, 'ref')} 
            accept="image/*" 
            className="hidden" 
          />

          {/* DROPZONE 1: Base Image */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">1. Base Image</span>
            {baseImage ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <img 
                  src={baseImage} 
                  alt="Base reference upload" 
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{baseFileName || 'Uploaded Base'}</p>
                  <span className="text-[9px] font-mono text-emerald-400">Connected</span>
                </div>
                <button 
                  onClick={() => { setBaseImage(null); setBaseFileName(''); }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => baseInputRef.current?.click()}
                className="group border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2"
                id="dropzone-base"
              >
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-[#00D2FF]/10 transition-colors">
                  <Upload size={14} className="text-zinc-400 group-hover:text-[#00D2FF]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-white">Upload Base Image</h4>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Drag & Drop or Tap here</p>
                </div>
              </div>
            )}
          </div>

          {/* DROPZONE 2: Reference Images */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">2. Reference Images</span>
            {refImage ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <img 
                  src={refImage} 
                  alt="Style reference upload" 
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800 animate-pulse" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{refFileName || 'Uploaded Style'}</p>
                  <span className="text-[9px] font-mono text-[#9B51E0]">Visual style anchor</span>
                </div>
                <button 
                  onClick={() => { setRefImage(null); setRefFileName(''); }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => refInputRef.current?.click()}
                className="group border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2"
                id="dropzone-style"
              >
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-[#9B51E0]/10 transition-colors">
                  <Layers size={14} className="text-zinc-400 group-hover:text-[#9B51E0]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-white">Style Reference</h4>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Anchor camera look & grade</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="border-t border-zinc-900/80 pt-4 mt-6">
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
            Invisible refinement model is processing base parameters recursively on every request. Direct multi-node raw matrix overlay active.
          </p>
        </div>
      </div>

      {/* Main Preview Workspace (Right block) */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 min-h-0" id="photo-canvas-workspace">
        
        {/* Workspace head bar */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[#9B51E0]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              {isGenerating ? "Synthesizing master look..." : "Canvas Workspace"}
            </h4>
          </div>

          <div className="flex items-center gap-3">
            {/* Before/After display tabs */}
            <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setActiveTab('before')}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === 'before' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setActiveTab('after')}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === 'after' ? 'bg-[#00D2FF]/10 text-[#00D2FF] font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                After
              </button>
            </div>

            {/* Direct Zoom level togglers */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 gap-1.5 px-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[9px] font-mono text-zinc-400 w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {hasGenerated && !isGenerating && (
              <button
                onClick={() => onOpenExportModal({
                  id: 'p-temp',
                  title: 'Custom Photo Studio Export',
                  timestamp: 'Just now',
                  format: 'Image',
                  image: previewSrc,
                  status: 'Ready',
                  prompt: prompt
                })}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-all"
                id="studio-export-btn"
              >
                <span>Export Master</span>
                <ArrowRight size={13} className="text-[#00D2FF]" />
              </button>
            )}
          </div>
        </div>

        {/* Central visual screen (zoom + comparisons state) */}
        <div className="flex-1 flex items-center justify-center p-4 bg-zinc-950/80 rounded-xl border border-zinc-900/60 relative overflow-hidden" id="photo-canvas-display">
          
          {/* Status Display badge */}
          <div className="absolute top-4 left-4 z-20 bg-black/85 border border-zinc-800/80 rounded px-2.5 py-1 text-[9px] tracking-widest text-[#00D2FF] uppercase font-mono shadow-md">
            {isGenerating ? "Processing your request..." : activeTab === 'before' ? "Ready to edit" : "Preview"}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm px-6 text-center"
                id="photo-generating-overlay"
              >
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#00D2FF]/20 border-t-[#00D2FF] animate-spin" />
                  <Sparkles size={18} className="absolute inset-0 m-auto text-[#9B51E0] animate-pulse" />
                </div>
                
                <h4 className="text-xs font-semibold text-white tracking-tight animate-pulse uppercase font-mono">
                  Synthesizing Master Matrix
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {simulatedStep || 'Refining vector anchors...'}
                </p>

                <div className="w-40 h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-flow-width" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Actual Viewport Canvas with direct mouse interactive Zoom scale parameter */}
          <div className="relative aspect-[9/16] h-[340px] md:h-[400px] overflow-hidden rounded-xl border border-zinc-800/80 shadow-2xl transition-all duration-300">
            <div 
              className="w-full h-full transition-transform duration-300 origin-center cursor-grab active:cursor-grabbing"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={previewSrc}
                alt="VYBE Studio Master Layout"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Simple gradient shading */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Input Text consolidated layout with Active Listening Microphone */}
        <div className="mt-4" id="photo-prompt-panel">
          <div className="relative flex items-center bg-zinc-900/60 border border-zinc-800/85 p-1 rounded-xl focus-within:border-zinc-700 transition-all duration-300">
            
            {/* Highly visual listening Microphone button */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-3.5 rounded-lg transition-all duration-300 flex items-center justify-center relative select-none cursor-pointer ${
                isListening 
                  ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-xl animate-pulse' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
              title="Voice Guide"
              id="voice-activation-trigger"
            >
              <Mic size={15} className={isListening ? 'scale-110' : ''} />
              
              {/* Voice pulse indicator lines */}
              {isListening && (
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-ping opacity-25 z-[-1]" />
              )}
            </button>

            <input
              type="text"
              value={isListening ? "Listening..." : prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to change..."
              disabled={isGenerating || isListening}
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 py-3.5 px-4 focus:outline-none disabled:opacity-60"
              id="photo-prompt-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />

            {/* Glowing listening wave indicator if microphone active */}
            {isListening ? (
              <div className="flex items-center gap-1 px-4 text-xs font-mono text-[#00D2FF]">
                <span className="w-1 bg-[#00D2FF] h-4 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#9B51E0] h-6 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-[#00D2FF] h-3 rounded animate-bounce" style={{ animationDelay: '0.5s' }} />
                <span className="text-[10px] ml-1 tracking-widest">Listening...</span>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer whitespace-nowrap"
                id="generate-photo-btn"
              >
                Synthesize Image
              </button>
            )}
          </div>

          <div className="flex justify-between items-center px-2 mt-2">
            <span className="text-[10px] text-zinc-600 font-mono">
              Inference channel active • Soundwaves process automatically in background
            </span>
            <button
              onClick={() => {
                setPrompt('Extreme macro shot of high-fashion luxury sunglasses reflecting neon purple billboards, cinematic anamorphic look, 8k RAW master.');
              }}
              className="text-[10px] text-zinc-500 hover:text-white cursor-pointer font-mono transition-colors"
            >
              Load premium prompt preset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
