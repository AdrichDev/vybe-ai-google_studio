/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Film,
  ArrowRight,
  Tv,
  Trash2,
  Music,
} from "lucide-react";
import { Project } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ProviderSelector from "../components/ui/ProviderSelector";
import UploadDropzone from "../components/ui/UploadDropzone";
import PromptInput from "../components/ui/PromptInput";
import Toast from "../components/ui/Toast";
import { useFeedback } from "../hooks/useFeedBack";

interface VideoStudioViewProps {
  onAddProject: (project: Project) => void;
  onOpenExportModal: (project: Project) => void;
  videoProvider: "google" | "openai";
  setVideoProvider: (p: "google" | "openai") => void;
  apiKeys: { google: string; openai: string };
  onNavigate: (section: any) => void;
  onAddAsset: (asset: any) => void;
}

const PREMIUM_VIDEO_MOCKS = [
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80",
];

export default function VideoStudioView({
  onAddProject,
  onOpenExportModal,
  videoProvider,
  setVideoProvider,
  apiKeys,
  onNavigate,
  onAddAsset,
}: VideoStudioViewProps) {
  const [prompt, setPrompt] = useState(
    "Toma panorámica cinemática de contrapicado de un elegante superdeportivo negro mate a toda velocidad por las calles iluminadas con luces de neón de Shinjuku a medianoche, dejando estelas de luz cibernética cyberpunk, capturado en ultra alta velocidad 8k.",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const { feedback: toastMessage, triggerFeedback } = useFeedback();

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(5.0); // 5 seconds movie
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const [generatedVideoFrame, setGeneratedVideoFrame] = useState<string | null>(
    null,
  );

  const hasVideoProviderKey = Boolean(
    apiKeys[videoProvider as keyof typeof apiKeys]
  );// Multimodal file upload states
  const [baseFile, setBaseFile] = useState<string | null>(null);
  const [baseFileName, setBaseFileName] = useState<string>("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");

  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);

  // File loading helper
  const processUploadedFile = (file: File, target: "base" | "audio") => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

      if (target === "base") {
        setBaseFile(result);
        setBaseFileName(file.name);
      } else {
        setAudioFile(result);
        setAudioFileName(file.name);
      }

      const newAsset = {
        id: `a-vid-${target}-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
        type: target === "base" ? ("video" as const) : ("audio" as const),
        url: result,
        ratio: "9:16",
        size: sizeStr,
        isFavorite: false,
      };
      onAddAsset(newAsset);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClick = () => {
    if (!prompt.trim() || isGenerating) return;
    triggerFeedback(
      `Generando secuencia cinemática vía ${videoProvider === "google" ? "Google AI (Gemini)" : videoProvider === "openai" ? "OpenAI (DALL-E 3)" : "Hugging Face (FLUX.1)"}...`,
    );
    handleRenderVideo();
  };

  const handleRenderVideo = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);
    setIsPlaying(false);
    setCurrentTime(0);

    const steps = [
      "Initializing spatial network configuration grids...",
      "Mapping volumetric lighting variables...",
      "Injecting hyper-resolution keyframe vector weights...",
      "Interpolating continuous motion vectors...",
      "Compressing temporal raw H.264 video bytes...",
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
    }, 600);

    let realGeneratedVisual = "";
    let apiErrorOccurred = false;
    let lastApiError = "";

    // Direct Integration using Google and OpenAI Keyframes as active movie backgrounds
    const callApi = async () => {
      try {
        if (videoProvider === "google") {
          const response = await fetch("http://localhost:8080/api/generar-imagen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: `Cinematic movie frame, high slow-motion quality: ${prompt}` }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedVisual = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend local.");
          }
        } else if (videoProvider === "openai") {
          // OpenAI
          const response = await fetch("http://localhost:8080/api/generar-imagen-openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: `Cinematic high quality action movie frame, 9:16 tall vertical aspect ratio: ${prompt}`,
              size: "1024x1792"
            }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedVisual = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend (OpenAI).");
          }
        } else if (videoProvider === "huggingface") {
          // Hugging Face
          const response = await fetch("http://localhost:8080/api/generar-imagen-hf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: `Cinematic high quality action movie frame, 9:16 tall vertical aspect ratio: ${prompt}`
            }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedVisual = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend (Hugging Face).");
          }
        }
      } catch (err: any) {
        console.error("Video Keyframe API Error:", err);
        apiErrorOccurred = true;
        lastApiError = err.message || "Error de conexión";
      }
    };

    await callApi();

    clearInterval(stepInterval);
      setIsGenerating(false);
      setSimulatedStep("");

      const targetVideoImage =
        !apiErrorOccurred && realGeneratedVisual
          ? realGeneratedVisual
          : PREMIUM_VIDEO_MOCKS[
              Math.floor(Math.random() * PREMIUM_VIDEO_MOCKS.length)
            ];

      if (!realGeneratedVisual && apiErrorOccurred) {
        triggerFeedback(
          `Error de API: ${lastApiError}. Usando vista previa.`
        );
      }

      setGeneratedVideoFrame(targetVideoImage);

      // Add to projects list
      const newProj: Project = {
        id: `p-vid-${Date.now()}`,
        title: prompt.substring(0, 35) + "...",
        timestamp: "Just now",
        format: "Video",
        image: targetVideoImage,
        status: "Ready",
        prompt: prompt,
      };

      onAddProject(newProj);
      setIsPlaying(true); // Automatically play after generating
  };

  // Playback ticker loop simulation
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return 0; // Loop around
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [isPlaying, duration]);

  const defaultMockVideoFrame =
    generatedVideoFrame ||
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=700&q=80";

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full"
      id="video-studio-workspace"
    >
      {/* 2 Dropzones on Left Panel */}
      <div
        className="w-full lg:w-[320px] bg-[#121212] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto"
        id="video-multimodal-panel"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Film size={15} className="text-[#9B51E0]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              CANALES MULTIMODALES
            </h3>
          </div>

          <ProviderSelector
            provider={videoProvider}
            onChange={setVideoProvider}
            idPrefix="video"
            apiKeys={apiKeys}
          />

          {/* DROPZONE 1: Base Clip */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              1. Video o Imagen Base
            </span>
            {baseFile ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 overflow-hidden text-center text-[10px] text-[#9B51E0]">
                  Video
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {baseFileName || "Uploaded Video"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#9B51E0] px-1.5 py-0.5 rounded bg-[#9B51E0]/15 border border-[#9B51E0]/30">
                    Sincronizado
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBaseFile(null);
                    setBaseFileName("");
                  }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <UploadDropzone
                onFileSelect={(file) => processUploadedFile(file, "base")}
                title="Sincronizar Clip Base"
                subtitle="Arrastra y suelta tu metraje"
                accept="video/*,image/*"
                isDragging={isDraggingVideo}
                setIsDragging={setIsDraggingVideo}
                id="container-vid-base"
                innerId="dropzone-vid-base"
              />
            )}
          </div>

          {/* DROPZONE 2: Reference Audio Vocal Track */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              2. Enlace de Audio / Clonador
            </span>
            {audioFile ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-[#00D2FF]">
                  <Music size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {audioFileName || "Voice Track"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Activo
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAudioFile(null);
                    setAudioFileName("");
                  }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <UploadDropzone
                onFileSelect={(file) => processUploadedFile(file, "audio")}
                title="Clonador de Voz AI"
                subtitle="Inserte pista de referencia (.mp3)"
                accept="audio/*"
                icon={Music}
                isDragging={isDraggingAudio}
                setIsDragging={setIsDraggingAudio}
                id="container-vid-audio"
                innerId="dropzone-vid-audio"
              />
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="border-t border-zinc-900/80 pt-4 mt-6">
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
            Temporal render buffer is cleared automatically on project close.
            Model parameters bind directly to modern standard LLM formats.
          </p>
        </div>
      </div>

      {/* Main Preview Video Timeline Workspace (Right) */}
      <div
        className="flex-1 flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 min-h-0"
        id="video-canvas-workspace"
      >
        {/* Workspace head bar */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Tv size={15} className="text-[#00D2FF]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              {isGenerating
                ? (videoProvider === 'google' ? "Sintetizando vía Google AI..." : videoProvider === 'openai' ? "Sintetizando vía OpenAI..." : "Sintetizando vía FLUX.1...")
                : "Visor Cinemático"}
            </h4>
          </div>

          <div className="flex items-center gap-3">
            {hasGenerated && !isGenerating && (
              <button
                onClick={() =>
                  onOpenExportModal({
                    id: "p-temp-vid",
                    title: "Custom Cinematic Studio Export",
                    timestamp: "Just now",
                    format: "Video",
                    image: defaultMockVideoFrame,
                    status: "Ready",
                    prompt: prompt,
                  })
                }
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1.5 transition-all"
                id="video-studio-export-btn"
              >
                <span>Exportar ProRes</span>
                <ArrowRight size={13} className="text-[#9B51E0]" />
              </button>
            )}
          </div>
        </div>

        {/* Central Vertical Video Player Display */}
        <div
          className="flex-1 flex items-center justify-center p-4 bg-zinc-950/80 rounded-xl border border-zinc-900/60 relative overflow-hidden"
          id="video-canvas-display"
        >
          {/* Status Display badge */}
          <div className="absolute top-4 left-4 z-20 bg-black/85 border border-zinc-800/80 rounded px-2.5 py-1 text-[9px] tracking-widest text-[#9B51E0] uppercase font-mono shadow-md">
            {isGenerating
              ? (videoProvider === 'google' ? 'Procesando con Google AI...' : videoProvider === 'openai' ? 'Procesando con OpenAI...' : 'Procesando con Hugging Face...')
              : isPlaying
                ? "Live Playback (Looped)"
                : "Static Preview"}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm px-6 text-center"
                id="video-generating-overlay"
              >
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full border-2 border-[#9B51E0]/20 border-t-[#9B51E0] animate-spin" />
                  <Film
                    size={18}
                    className="absolute inset-0 m-auto text-[#00D2FF] animate-pulse"
                  />
                </div>

                <h4 className="text-xs font-semibold text-white tracking-tight animate-pulse uppercase font-mono">
                  Synthesizing Temporal Latent Pixels
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {simulatedStep || "Compiling spatial frames..."}
                </p>

                <div className="w-40 h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#9B51E0] to-[#00D2FF] animate-flow-width" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Vertical Video Viewport with custom camera pan simulation */}
          <div className="relative aspect-[9/16] h-[340px] md:h-[400px] overflow-hidden rounded-xl border border-zinc-800/80 shadow-2xl bg-black">
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={defaultMockVideoFrame}
                alt="VYBE Dynamic Motion Loop Frame"
                className={`w-full h-full object-cover transition-transform duration-[5000ms] ease-linear ${
                  isPlaying
                    ? "scale-110 translate-x-1.5 translate-y-1"
                    : "scale-100 translate-x-0 translate-y-0"
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

              {/* Playback action hover overlay */}
              {!isGenerating && !isPlaying && (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-800 flex items-center justify-center text-white scale-95 group-hover:scale-100 transition-all shadow-md">
                    <Play size={20} className="fill-white translate-x-0.5" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Player Timeline Controller */}
        <div
          className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-3 mb-4"
          id="timeline-controls"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause size={14} className="fill-white" />
                ) : (
                  <Play size={14} className="fill-white translate-x-0.5" />
                )}
              </button>

              <button
                onClick={resetPlayback}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title="Reset"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Simulated audio volume badge */}
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
              <Volume2 size={13} />
              <span>STEREO MATRIX REELS</span>
            </div>
          </div>

          {/* Time track scrub rail */}
          <div className="space-y-1">
            <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#00D2FF] transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500">
              <span>0:{currentTime.toFixed(1)}s</span>
              <span>0:{duration.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Text Input Block using reusable UI Component */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateClick}
          isGenerating={isGenerating}
          provider={videoProvider}
          hasApiKey={hasVideoProviderKey}
          onMicText="Toma de seguimiento cinemática con dron de un asesino futurista con armadura de marfil parado sobre la cornisa mojada de un rascacielos iluminado con neón mirando hacia un paisaje urbano ciberpunk virtual..."
          idPrefix="video"
          presetPromptText="Toma continua con dron a 120 fps volando bajo a través de arcos arquitectónicos de una villa brutalista minimalista de alta densidad durante el crepúsculo dorado."
          presetLabel="Preset cinemático"
          onNavigateSettings={() => onNavigate("settings" as any)}
        />
      </div>

      {/* Toast Feedback popup */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} id="toast-error" />}
      </AnimatePresence>
    </div>
  );
}
