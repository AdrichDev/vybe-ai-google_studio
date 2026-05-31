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
  ChevronDown,
  Instagram,
  Youtube,
} from "lucide-react";
import { Project, Asset, ActiveSection } from "../types";
import { VIDEO_PRESETS_BY_PLATFORM, DEFAULT_VIDEO_PRESET, SocialPreset } from "../content/socialPresets";
import { motion, AnimatePresence } from "motion/react";
import ProviderSelector from "../components/ui/ProviderSelector";
import UploadDropzone from "../components/ui/UploadDropzone";
import PromptInput from "../components/ui/PromptInput";
import Toast from "../components/ui/Toast";
import AudioTrimmer from "../components/ui/AudioTrimmer";
import { mergeAudioIntoVideo, buildTrimmedAudioStream } from "../utils/mediaUtils";
import { useFeedback } from "../hooks/useFeedBack";

interface VideoStudioViewProps {
  onAddProject: (project: Project) => void;
  onOpenExportModal: (project: Project) => void;
  videoProvider: "google" | "openai" | "huggingface";
  setVideoProvider: (p: "google" | "openai" | "huggingface") => void;
  apiKeys: { google: string; openai: string; huggingface: string };
  onNavigate: (section: ActiveSection) => void;
  onAddAsset: (asset: Asset) => void;
  theme?: string;
}

const VIDEO_MODELS: Record<"google" | "openai" | "huggingface", { value: string; label: string }[]> = {
  google: [
    { value: "veo-3.1-lite-generate-preview", label: "Veo 3.1 Lite (Rápido)" },
  ],
  openai: [
    { value: "sora-turbo", label: "Sora Turbo (Rápido, Tier 5)" },
    { value: "sora", label: "Sora Pro (Alta Calidad, Tier 5)" },
  ],
  huggingface: [
    { value: "flux-schnell", label: "FLUX.1-schnell (Frame Cinemático)" },
  ],
};

const RESOLUTION_OPTIONS: Record<"google" | "openai" | "huggingface", { value: string; label: string }[] | null> = {
  google: [
    { value: "",      label: "Por defecto (720p)" },
    { value: "720p",  label: "720p HD" },
    { value: "1080p", label: "1080p Full HD" },
  ],
  openai: [
    { value: "",     label: "Por defecto (según modelo)" },
    { value: "high", label: "Alta resolución" },
    { value: "low",  label: "Baja resolución (más rápido)" },
  ],
  huggingface: null, // imagen estática — no aplica
};


type Platform = 'instagram' | 'tiktok' | 'youtube';

const PLATFORM_META: Record<Platform, { label: string; Icon: React.ElementType; color: string }> = {
  instagram: { label: 'Instagram', Icon: Instagram, color: '#E1306C' },
  tiktok:    { label: 'TikTok',    Icon: Tv,        color: '#69C9D0' },
  youtube:   { label: 'YouTube',   Icon: Youtube,   color: '#FF0000' },
};

function FormatShape({ preset, size }: { preset: SocialPreset; size: number }) {
  const ratio = preset.width / preset.height;
  const rw = ratio >= 1 ? size : Math.round(size * ratio);
  const rh = ratio <= 1 ? size : Math.round(size / ratio);
  const rx = Math.round((size - rw) / 2);
  const ry = Math.round((size - rh) / 2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect x={rx} y={ry} width={rw} height={rh} rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

function getOpenAiVideoSize(preset: SocialPreset): string {
  if (preset.width > preset.height) return '1792x1024';
  if (preset.width < preset.height) return '1024x1792';
  return '1024x1024';
}

export default function VideoStudioView({
  onAddProject,
  onOpenExportModal,
  videoProvider,
  setVideoProvider,
  apiKeys,
  onNavigate,
  onAddAsset,
  theme = "dark",
}: VideoStudioViewProps) {
  const [aiPreferences, setAiPreferences] = useState({
    model: VIDEO_MODELS[videoProvider][0].value,
    resolution: "",
  });

  // Resetear modelo y resolución al cambiar de provider
  useEffect(() => {
    setAiPreferences({ model: VIDEO_MODELS[videoProvider][0].value, resolution: "" });
  }, [videoProvider]);
  const [prompt, setPrompt] = useState("");
  const [isLoadingTestPrompt, setIsLoadingTestPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activePreset, setActivePreset] = useState<SocialPreset>(DEFAULT_VIDEO_PRESET);
  const [connectedSocials] = useState<Record<Platform, boolean>>(() => {
    try {
      const saved = localStorage.getItem("vybe_socials");
      return saved ? JSON.parse(saved) : { instagram: false, tiktok: false, youtube: false };
    } catch { return { instagram: false, tiktok: false, youtube: false }; }
  });
  const [activePlatform, setActivePlatform] = useState<Platform>('youtube');
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const presets = VIDEO_PRESETS_BY_PLATFORM[activePlatform];
    if (presets.length > 0) setActivePreset(presets[0]);
  }, [activePlatform]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
        setIsPresetOpen(false);
      }
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target as Node)) {
        setIsPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { feedback: toastMessage, triggerFeedback } = useFeedback();

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5.0);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const [generatedVideoFrame, setGeneratedVideoFrame] = useState<string | null>(null);
  const [isRealVideo, setIsRealVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBlobUrlRef = useRef<string | null>(null);

  const hasVideoProviderKey = Boolean(
    apiKeys[videoProvider as keyof typeof apiKeys]
  );// Multimodal file upload states
  const [baseFile, setBaseFile] = useState<string | null>(null);
  const [baseFileName, setBaseFileName] = useState<string>("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [audioTrimStart, setAudioTrimStart] = useState(0);
  const [audioTrimEnd, setAudioTrimEnd] = useState(0);

  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);

  // Montaje multi-foto
  const [montageImages, setMontageImages] = useState<{ url: string; name: string }[]>([]);
  const [montageSecsPerSlide, setMontageSecsPerSlide] = useState(3);
  const [isCreatingMontage, setIsCreatingMontage] = useState(false);
  const montageInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddMontageImages = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setMontageImages(prev => [...prev, { url, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const createMontage = async () => {
    if (montageImages.length < 2) { triggerFeedback("Necesitás al menos 2 fotos."); return; }
    setIsCreatingMontage(true);
    triggerFeedback("Creando montaje...");

    try {
      const W = activePreset.width > activePreset.height ? 1280 : 720;
      const H = activePreset.width > activePreset.height ? 720 : 1280;
      const FPS = 30;
      const transitionFrames = Math.round(FPS * 0.6); // 0.6s crossfade
      const slideFrames = Math.round(FPS * montageSecsPerSlide);

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Cargar todas las imágenes
      const imgs = await Promise.all(montageImages.map(({ url }) => new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = url;
      })));

      const drawFit = (img: HTMLImageElement, alpha: number) => {
        ctx.globalAlpha = alpha;
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
        ctx.globalAlpha = 1;
      };

      const stream = canvas.captureStream(FPS);

      // Inyectar audio recortado si hay pista cargada
      let audioHandle: Awaited<ReturnType<typeof buildTrimmedAudioStream>> | null = null;
      if (audioFile && audioTrimEnd > audioTrimStart) {
        try {
          audioHandle = await buildTrimmedAudioStream(audioFile, audioTrimStart, audioTrimEnd);
          audioHandle.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch (e) {
          console.warn("[Montage] Audio trim falló, continuando sin audio.", e);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.start(100);
      audioHandle?.start();

      for (let i = 0; i < imgs.length; i++) {
        const next = imgs[(i + 1) % imgs.length];

        // Slide fijo
        for (let f = 0; f < slideFrames - transitionFrames; f++) {
          ctx.clearRect(0, 0, W, H);
          drawFit(imgs[i], 1);
          // Añadir texto del prompt como overlay
          if (prompt.trim()) {
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(0, H - 52, W, 52);
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.round(W * 0.022)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(prompt.slice(0, 80), W / 2, H - 18);
          }
          await new Promise(r => setTimeout(r, 1000 / FPS));
        }

        // Crossfade al siguiente (excepto en el último si no hay loop)
        if (i < imgs.length - 1) {
          for (let f = 0; f < transitionFrames; f++) {
            const alpha = f / transitionFrames;
            ctx.clearRect(0, 0, W, H);
            drawFit(imgs[i], 1 - alpha);
            drawFit(next, alpha);
            await new Promise(r => setTimeout(r, 1000 / FPS));
          }
        }
      }

      recorder.stop();
      await new Promise(r => { recorder.onstop = r; });
      await audioHandle?.ctx.close().catch(() => {});

      const blob = new Blob(chunks, { type: mimeType });
      if (videoBlobUrlRef.current) URL.revokeObjectURL(videoBlobUrlRef.current);
      const blobUrl = URL.createObjectURL(blob);
      videoBlobUrlRef.current = blobUrl;
      setGeneratedVideoFrame(blobUrl);
      setIsRealVideo(true);
      setDuration(montageImages.length * montageSecsPerSlide);
      setHasGenerated(true);
      setActiveTab("after" as any);
      triggerFeedback(`¡Montaje listo! ${montageImages.length} fotos · ${montageImages.length * montageSecsPerSlide}s`);

      onAddProject({
        id: `p-montage-${Date.now()}`,
        title: `Montaje — ${montageImages.length} fotos`,
        timestamp: "Ahora mismo",
        format: "Video",
        image: montageImages[0].url,
        status: "Ready",
        prompt,
        ratio: activePreset.aspectRatio,
      });
    } catch (err: any) {
      triggerFeedback(`Error: ${err.message}`);
    } finally {
      setIsCreatingMontage(false);
    }
  };

  const handleGenerateClick = () => {
    if (isGenerating) return;
    if (!prompt.trim()) {
      triggerFeedback("Escribí un prompt antes de generar.");
      return;
    }
    triggerFeedback(
      `Generando${videoProvider === "openai" ? " video real con OpenAI Sora (puede tardar varios minutos)..." : ` secuencia cinemática vía ${videoProvider === "google" ? "Google AI (Gemini)" : "Hugging Face (FLUX.1)"}...`}`,
    );
    handleRenderVideo();
  };

  const handleRenderVideo = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setIsRealVideo(false);

    const steps = [
      "Inicializando cuadrículas de configuración de red espacial...",
      "Mapeando variables de iluminación volumétrica...",
      "Inyectando pesos vectoriales de keyframe de hiper-resolución...",
      "Interpolando vectores de movimiento continuo...",
      "Comprimiendo bytes de video raw H.264 temporal...",
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

    const callApi = async () => {
      try {
        // ── GOOGLE VEO ──────────────────────────────────────────────────────
        if (videoProvider === "google") {
          // 1. Iniciar generación — con imagen base si existe
          let startInit: RequestInit;
          if (baseFile) {
            const form = new FormData();
            form.append("prompt", prompt);
            if (apiKeys.google) form.append("googleKey", apiKeys.google);
            form.append("aspectRatio", activePreset.aspectRatio);
            if (aiPreferences.resolution) form.append("resolution", aiPreferences.resolution);
            const blob = dataURLtoBlob(baseFile);
            form.append("image", blob, baseFileName || "base_image.png");
            startInit = { method: "POST", body: form };
          } else {
            startInit = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                googleKey: apiKeys.google || undefined,
                aspectRatio: activePreset.aspectRatio,
                ...(aiPreferences.resolution ? { resolution: aiPreferences.resolution } : {}),
              }),
            };
          }
          const startRes = await fetch("http://localhost:8080/api/generar-video-google", startInit);
          if (!startRes.ok) {
            const err = await startRes.json().catch(() => ({}));
            throw new Error(err?.error || `Error HTTP ${startRes.status}`);
          }
          const { operationName } = await startRes.json();
          if (!operationName) throw new Error("No se recibió operationName de Veo.");

          // 2. Polling hasta que done: true (Veo tarda 1-3 minutos)
          let done = false;
          let videoUrl: string | undefined;
          let polls = 0;
          const MAX_POLLS = 24; // 24 × 8s = ~3 minutos

          while (!done && polls < MAX_POLLS) {
            await new Promise(r => setTimeout(r, 8000));
            polls++;

            const pollRes = await fetch("http://localhost:8080/api/generar-video-google/status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName, googleKey: apiKeys.google || undefined }),
            });
            if (!pollRes.ok) continue;
            const pollData = await pollRes.json();
            done = pollData.done;
            videoUrl = pollData.videoUrl;
          }

          if (!videoUrl) throw new Error("Veo no completó la generación en el tiempo esperado.");

          if (videoBlobUrlRef.current) URL.revokeObjectURL(videoBlobUrlRef.current);
          realGeneratedVisual = videoUrl;
          setIsRealVideo(true);

        // ── OPENAI SORA ─────────────────────────────────────────────────────
        } else if (videoProvider === "openai") {
          const response = await fetch("http://localhost:8080/api/generar-video-openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              openaiKey: apiKeys.openai || undefined,
              profile: aiPreferences.model,
              aspectRatio: activePreset.aspectRatio,
              ...(aiPreferences.resolution ? { resolution: aiPreferences.resolution } : {}),
            }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const blob = await response.blob();
          if (videoBlobUrlRef.current) URL.revokeObjectURL(videoBlobUrlRef.current);
          const blobUrl = URL.createObjectURL(blob);
          videoBlobUrlRef.current = blobUrl;
          realGeneratedVisual = blobUrl;
          setIsRealVideo(true);
          const secs = response.headers.get("X-Video-Seconds");
          if (secs) setDuration(Number(secs));

        // ── HUGGING FACE (frame cinemático) ─────────────────────────────────
        } else if (videoProvider === "huggingface") {
          const form = new FormData();
          form.append("prompt", `Cinematic movie frame, photorealistic, high quality: ${prompt}`);
          if (apiKeys.huggingface) form.append("hfToken", apiKeys.huggingface);
          form.append("model", "flux-schnell");
          form.append("quality", aiPreferences.quality);
          form.append("creativity", "0.8");
          form.append("aspectRatio", activePreset.aspectRatio);

          const response = await fetch("http://localhost:8080/api/generar-imagen-hf", {
            method: "POST",
            body: form,
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (!data.imageUrl) throw new Error("No se recibió imagen de Hugging Face.");
          realGeneratedVisual = data.imageUrl;
        }
      } catch (err: any) {
        console.error("Video API Error:", err);
        apiErrorOccurred = true;
        lastApiError = err.message || "Error de conexión";
      }
    };

    await callApi();

    clearInterval(stepInterval);
    setSimulatedStep("");

    if (apiErrorOccurred || !realGeneratedVisual) {
      setIsGenerating(false);
      triggerFeedback(`Error: ${lastApiError || 'No se pudo generar el video.'}`);
      return;
    }

    // ── MEZCLA DE AUDIO ─────────────────────────────────────────────────────
    // Solo para videos reales (Veo / Sora) — HF devuelve una imagen estática
    let finalVisual = realGeneratedVisual;
    if (audioFile && audioTrimEnd > audioTrimStart && isRealVideo) {
      try {
        setSimulatedStep("Mezclando audio seleccionado con el video...");
        const trimDur = audioTrimEnd - audioTrimStart;
        triggerFeedback(`Mezclando audio (${trimDur.toFixed(1)}s seleccionados)...`);
        const mergedUrl = await mergeAudioIntoVideo(
          realGeneratedVisual,
          audioFile,
          audioTrimStart,
          audioTrimEnd
        );
        // Liberar el URL anterior si era un blob
        if (videoBlobUrlRef.current && videoBlobUrlRef.current !== realGeneratedVisual) {
          URL.revokeObjectURL(videoBlobUrlRef.current);
        }
        videoBlobUrlRef.current = mergedUrl;
        finalVisual = mergedUrl;
      } catch (err: any) {
        console.warn("[AudioMerge] Error mezclando audio:", err.message);
        // No fatal — mostramos el video sin audio
      }
    }

    setIsGenerating(false);
    setSimulatedStep("");
    setGeneratedVideoFrame(finalVisual);

    const newProj: Project = {
      id: `p-vid-${Date.now()}`,
      title: prompt.substring(0, 35) + "...",
      timestamp: "Ahora mismo",
      format: "Video",
      image: finalVisual,
      status: "Ready",
      prompt: prompt,
      ratio: activePreset.aspectRatio,
    };

    onAddProject(newProj);
    setIsPlaying(true);
  };

  const handleLoadTestPrompt = async () => {
    setIsLoadingTestPrompt(true);
    try {
      const response = await fetch("http://localhost:8080/api/generar-prompt-prueba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "video",
          platform: activePlatform,
          aspectRatio: activePreset.aspectRatio,
          provider: videoProvider,
          googleKey: apiKeys.google || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      if (data.prompt) setPrompt(data.prompt);
    } catch (err: any) {
      triggerFeedback(`Error al cargar prompt: ${err.message}`);
    } finally {
      setIsLoadingTestPrompt(false);
    }
  };

  // Playback ticker loop simulation
  // Liberar blob URLs de video real al desmontar
  useEffect(() => {
    return () => {
      if (videoBlobUrlRef.current) URL.revokeObjectURL(videoBlobUrlRef.current);
    };
  }, []);

  // Conectar play/pause al elemento <video> real
  useEffect(() => {
    if (!isRealVideo || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isRealVideo]);

  useEffect(() => {
    if (isRealVideo) return; // El elemento <video> maneja su propio tiempo
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) return 0;
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, duration, isRealVideo]);

  const defaultMockVideoFrame = generatedVideoFrame || null;

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (isRealVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full"
      id="video-studio-workspace"
    >
      {/* 2 Dropzones on Left Panel */}
      <div
        className={`w-full lg:w-[320px] ${
          theme === 'light'
            ? 'bg-[#EAEAEF] border-[#CECED8] shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-zinc-900'
            : 'bg-[#121212] border-zinc-900 text-white'
        } border rounded-2xl p-5 flex flex-col justify-between overflow-y-auto`}
        id="video-multimodal-panel"
      >
        <div className="space-y-6">
          <div className={`flex items-center gap-2 border-b ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900'} pb-3`}>
            <Film size={15} className="text-[#9B51E0]" />
            <h3 className={`text-xs font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} uppercase tracking-wider`}>
              CANALES MULTIMODALES
            </h3>
          </div>

          <ProviderSelector
            provider={videoProvider}
            onChange={setVideoProvider}
            idPrefix="video"
            apiKeys={apiKeys}
            theme={theme}
          />

          {/* AI Engine Model & Resolution Preferences */}
          <div className={`space-y-4 pt-4 border-t ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900/60'}`}>
            <div className="space-y-2">
              <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block`}>
                Motor de Video
              </label>
              <select
                value={aiPreferences.model}
                onChange={(e) =>
                  setAiPreferences((prev) => ({
                    ...prev,
                    model: e.target.value,
                  }))
                }
                className={`w-full text-xs font-bold ${
                  theme === "light"
                    ? "text-zinc-900 bg-zinc-50 border-zinc-200 focus:border-zinc-400"
                    : "text-zinc-300 bg-zinc-950 border-zinc-900 focus:border-zinc-800"
                } border rounded-xl py-2 px-2.5 focus:outline-none transition-all duration-300`}
                id="select-video-engine"
              >
                {VIDEO_MODELS[videoProvider].map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {RESOLUTION_OPTIONS[videoProvider] && (
              <div className="space-y-2">
                <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block`}>
                  Resolución
                </label>
                <select
                  value={aiPreferences.resolution}
                  onChange={(e) =>
                    setAiPreferences((prev) => ({ ...prev, resolution: e.target.value }))
                  }
                  className={`w-full text-xs font-bold ${
                    theme === "light"
                      ? "text-zinc-900 bg-zinc-50 border-zinc-200 focus:border-zinc-400"
                      : "text-zinc-300 bg-zinc-950 border-zinc-900 focus:border-zinc-800"
                  } border rounded-xl py-2 px-2.5 focus:outline-none transition-all duration-300`}
                  id="select-video-resolution"
                >
                  {RESOLUTION_OPTIONS[videoProvider]!.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* DROPZONE 1: Base Clip */}
          <div className={`space-y-2 pt-4 border-t ${theme === 'light' ? 'border-[#CECED8]' : 'border-zinc-900/40'}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              1. Video o Imagen Base
            </span>
            {baseFile ? (
              <div className={`relative group rounded-xl border p-3 flex items-center gap-3 ${theme === 'light' ? 'border-[#CECED8] bg-[#E2E2EA]' : 'border-zinc-800 bg-zinc-950'}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border overflow-hidden text-center text-[10px] text-[#9B51E0] ${theme === 'light' ? 'bg-[#DCDCE4] border-[#C8C8D0]' : 'bg-zinc-900 border-zinc-800'}`}>
                  Video
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${theme === 'light' ? 'text-zinc-800' : 'text-white'}`}>
                    {baseFileName || "Video subido"}
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
                theme={theme}
              />
            )}
          </div>

          {/* DROPZONE 2: Reference Audio Vocal Track */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              2. Enlace de Audio / Clonador
            </span>
            {audioFile ? (
              <>
                <div className={`relative group rounded-xl border p-3 flex items-center gap-3 ${theme === 'light' ? 'border-[#CECED8] bg-[#E2E2EA]' : 'border-zinc-800 bg-zinc-950'}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border text-[#00D2FF] ${theme === 'light' ? 'bg-[#DCDCE4] border-[#C8C8D0]' : 'bg-zinc-900 border-zinc-800'}`}>
                    <Music size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${theme === 'light' ? 'text-zinc-800' : 'text-white'}`}>
                      {audioFileName || "Pista de voz"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00FF87] px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/25">
                      Activo
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAudioFile(null);
                      setAudioFileName("");
                      setAudioTrimStart(0);
                      setAudioTrimEnd(0);
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <AudioTrimmer
                  audioUrl={audioFile}
                  onTrimChange={(start, end) => {
                    setAudioTrimStart(start);
                    setAudioTrimEnd(end);
                  }}
                  theme={theme}
                />
              </>
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
                theme={theme}
              />
            )}
          </div>
        </div>

          {/* SECCIÓN MONTAJE MULTI-FOTO */}
          <div className={`space-y-3 pt-4 border-t ${theme === 'light' ? 'border-[#CECED8]' : 'border-zinc-900/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">3. Montaje de Fotos</span>
              {montageImages.length > 0 && (
                <button onClick={() => setMontageImages([])} className="text-[9px] text-zinc-500 hover:text-red-400 cursor-pointer transition-colors">Limpiar</button>
              )}
            </div>

            <input
              ref={montageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleAddMontageImages(e.target.files)}
            />

            <button
              onClick={() => montageInputRef.current?.click()}
              className={`w-full border border-dashed rounded-xl py-3 text-[11px] font-semibold cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-[#C8C8D0] bg-[#E2E2EA] hover:bg-[#DCDCE4] text-zinc-600'
                  : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 text-zinc-400'
              }`}
            >
              + Añadir fotos ({montageImages.length} seleccionadas)
            </button>

            {/* Thumbnails */}
            {montageImages.length > 0 && (
              <div className="grid grid-cols-4 gap-1">
                {montageImages.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setMontageImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer transition-opacity"
                    >✕</button>
                    <span className="absolute bottom-0 left-0 right-0 text-[7px] font-mono text-center bg-black/60 text-white py-0.5">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Duración por slide */}
            {montageImages.length >= 2 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>Segundos por foto</span>
                  <span className="text-[#00D2FF] font-black">{montageSecsPerSlide}s</span>
                </div>
                <input
                  type="range" min="1" max="8" step="1"
                  value={montageSecsPerSlide}
                  onChange={e => setMontageSecsPerSlide(Number(e.target.value))}
                  className="w-full accent-[#00D2FF] cursor-pointer h-1"
                />
                <div className="text-[8px] text-zinc-600 font-mono text-right">
                  Duración total: ~{montageImages.length * montageSecsPerSlide}s
                </div>
              </div>
            )}

            {montageImages.length >= 2 && (
              <button
                onClick={createMontage}
                disabled={isCreatingMontage}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#9B51E0] to-[#00D2FF] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#9B51E0]/20"
              >
                {isCreatingMontage ? "Creando montaje..." : `🎬 Crear Montaje (${montageImages.length} fotos)`}
              </button>
            )}
          </div>

          {/* Security Note */}
          <div className={`border-t pt-4 mt-6 ${theme === 'light' ? 'border-[#CECED8]' : 'border-zinc-900/80'}`}>
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
            El buffer de render temporal se limpia automáticamente al cerrar el proyecto.
            Los parámetros del modelo se vinculan directamente a los formatos LLM estándar.
          </p>
        </div>
      </div>

      {/* Main Preview Video Timeline Workspace (Right) */}
      <div
        className={`flex-1 flex flex-col justify-between ${
          theme === 'light'
            ? 'bg-[#EAEAEF] border-[#CECED8] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            : 'bg-zinc-950/40 border-zinc-900'
        } border rounded-2xl p-5 min-h-0`}
        id="video-canvas-workspace"
      >
        {/* Workspace head bar */}
        <div className={`flex justify-between items-center border-b ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900'} pb-3 mb-4`}>
          <div className="flex items-center gap-2">
            <Tv size={15} className="text-[#00D2FF]" />
            <h4 className={`text-xs font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} uppercase tracking-wider`}>
              {isGenerating
                ? (videoProvider === 'google' ? "Sintetizando vía Google AI..." : videoProvider === 'openai' ? "Sintetizando vía OpenAI..." : "Sintetizando vía FLUX.1...")
                : "Visor Cinemático"}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* 1. Red social — primero */}
            <div className="relative" ref={platformDropdownRef} id="video-platform-select">
              {(() => {
                const { label, Icon, color } = PLATFORM_META[activePlatform];
                const connected = connectedSocials[activePlatform];
                return (
                  <button
                    type="button"
                    onClick={() => setIsPlatformOpen((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-[#DCDCE4] border-[#C8C8D0] text-zinc-700 hover:border-[#AEAEBB]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon size={12} style={{ color: connected ? color : undefined }} className={connected ? '' : 'text-zinc-500'} />
                    <span className={connected ? '' : 'text-zinc-500'}>{label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${connected ? 'bg-[#00FF87]' : 'bg-zinc-700'}`} />
                    <ChevronDown size={10} className="text-zinc-500" />
                  </button>
                );
              })()}

              {isPlatformOpen && (
                <div className={`absolute top-full right-0 mt-1 z-50 border rounded-xl overflow-hidden shadow-2xl w-[180px] ${theme === 'light' ? 'bg-[#E8E8EE] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800'}`}>
                  {(Object.keys(PLATFORM_META) as Platform[]).map((platform) => {
                    const { label, Icon, color } = PLATFORM_META[platform];
                    const connected = connectedSocials[platform];
                    return (
                      <button
                        key={platform}
                        type="button"
                        disabled={!connected}
                        onClick={() => { setActivePlatform(platform); setIsPlatformOpen(false); }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors ${
                          !connected
                            ? 'cursor-not-allowed opacity-50'
                            : platform === activePlatform ? 'bg-zinc-800/80 cursor-pointer' : 'hover:bg-zinc-900 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: connected ? color : undefined }} className={connected ? '' : 'text-zinc-600'} />
                          <span className={`text-[11px] font-bold ${connected ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
                        </div>
                        <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${
                          connected ? 'text-[#00FF87] bg-[#00FF87]/10 border-[#00FF87]/25' : 'text-zinc-600 bg-zinc-900 border-zinc-800'
                        }`}>{connected ? 'ON' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Formato — filtrado por red social activa */}
            <div className="relative" ref={presetDropdownRef} id="video-format-preset-select">
              <button
                type="button"
                onClick={() => setIsPresetOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-[#DCDCE4] border-[#C8C8D0] text-zinc-700 hover:border-[#AEAEBB]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <FormatShape preset={activePreset} size={16} />
                <span>{activePreset.aspectRatio}</span>
                <ChevronDown size={10} className="text-zinc-500" />
              </button>

              {isPresetOpen && (
                <div className={`absolute top-full right-0 mt-1 z-50 border rounded-xl overflow-hidden shadow-2xl w-[230px] ${theme === 'light' ? 'bg-[#E8E8EE] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800'}`}>
                  {VIDEO_PRESETS_BY_PLATFORM[activePlatform].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setActivePreset(p); setIsPresetOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        p.id === activePreset.id ? 'bg-zinc-800/80 text-[#9B51E0]' : 'text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <FormatShape preset={p} size={22} />
                      <div>
                        <div className="text-[11px] font-bold">{p.aspectRatio} — {p.width}×{p.height}px</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">{p.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasGenerated && !isGenerating && (
              <button
                onClick={() =>
                  onOpenExportModal({
                    id: "p-temp-vid",
                    title: "Exportación del Estudio Cinemático",
                    timestamp: "Ahora mismo",
                    format: "Video",
                    image: defaultMockVideoFrame,
                    status: "Ready",
                    prompt: prompt,
                  })
                }
                className={`text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'bg-[#DCDCE4] hover:bg-[#D4D4DC] border-[#C8C8D0] text-zinc-900'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white'
                } border`}
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
          className={`flex-1 flex items-center justify-center p-4 ${
            theme === 'light'
              ? 'bg-[#E2E2EA] border-[#CECED8] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
              : 'bg-zinc-950/80 border-zinc-900/60'
          } rounded-xl border relative overflow-hidden`}
          id="video-canvas-display"
        >
          {/* Status Display badge */}
          <div className={`absolute top-4 left-4 z-20 ${
            theme === 'light'
              ? 'bg-[#E8E8EE]/95 border-[#CECED8] text-[#9B51E0] shadow-sm'
              : 'bg-black/85 border-zinc-800/80 text-[#9B51E0] shadow-md'
          } border rounded px-2.5 py-1 text-[9px] tracking-widest uppercase font-mono`}>
            {isGenerating
              ? (videoProvider === 'google' ? 'Procesando con Google AI...' : videoProvider === 'openai' ? 'Procesando con OpenAI...' : 'Procesando con Hugging Face...')
              : isPlaying
                ? "Reproducción en Vivo (Bucle)"
                : "Vista Previa Estática"}
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
                  Sintetizando Píxeles Latentes Temporales
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {simulatedStep || "Compilando fotogramas espaciales..."}
                </p>

                <div className="w-40 h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#9B51E0] to-[#00D2FF] animate-flow-width" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Video Viewport — ratio dinámico, lienzo vacío si no hay frame */}
          <div
            className="relative h-[340px] md:h-[400px] overflow-hidden rounded-xl border border-zinc-800/80 shadow-2xl bg-black transition-all duration-300"
            style={{ aspectRatio: `${activePreset.width}/${activePreset.height}` }}
          >
            {defaultMockVideoFrame ? (
            <div className="w-full h-full relative overflow-hidden">
              {isRealVideo ? (
                /* Video real de Sora — elemento nativo */
                <video
                  ref={videoRef}
                  src={defaultMockVideoFrame}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) setDuration(videoRef.current.duration);
                  }}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                /* Frame de imagen para Google/HuggingFace */
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
              )}

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
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl gap-3 ${theme === 'light' ? 'bg-[#E2E2EA] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800/60'}`}>
                <div className="text-zinc-700">
                  <FormatShape preset={activePreset} size={40} />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">{activePreset.aspectRatio} · {activePreset.label}</p>
                  <p className="text-[9px] font-mono text-zinc-700 mt-0.5">{activePreset.width} × {activePreset.height}px</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Timeline Controller */}
        <div
          className={`p-4 border rounded-xl space-y-3 mb-4 ${
            theme === 'light'
              ? 'bg-[#E2E2EA] border-[#CECED8] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
              : 'bg-zinc-950 border-zinc-900 text-white'
          }`}
          id="timeline-controls"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-8 h-8 rounded-lg ${
                  theme === 'light'
                    ? 'bg-[#E2E2EA] hover:bg-[#D8D8E0] border-[#CECED8] text-zinc-900'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white'
                } border flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-sm`}
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause size={14} className={theme === 'light' ? 'fill-zinc-900' : 'fill-white'} />
                ) : (
                  <Play size={14} className={`${theme === 'light' ? 'fill-zinc-900' : 'fill-white'} translate-x-0.5`} />
                )}
              </button>

              <button
                onClick={resetPlayback}
                className={`w-8 h-8 rounded-lg ${
                  theme === 'light'
                    ? 'bg-[#E2E2EA] hover:bg-[#D8D8E0] border-[#CECED8] text-zinc-500 hover:text-zinc-900'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                } border flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-sm`}
                title="Reset"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Simulated audio volume badge */}
            <div className={`flex items-center gap-2 ${theme === 'light' ? 'text-zinc-450' : 'text-zinc-500'} font-mono text-[10px]`}>
              <Volume2 size={13} />
              <span>REELS STEREO MATRIX</span>
            </div>
          </div>

          {/* Time track scrub rail */}
          <div className="space-y-1">
            <div className={`relative h-1.5 w-full ${
              theme === 'light' ? 'bg-zinc-250 border-zinc-200' : 'bg-zinc-900 border-zinc-800/50'
            } rounded-full overflow-hidden border`}>
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#00D2FF] transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className={`flex justify-between text-[9px] font-mono ${
              theme === 'light' ? 'text-zinc-400 font-bold' : 'text-zinc-500'
            }`}>
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
          onLoadTestPrompt={handleLoadTestPrompt}
          isLoadingTestPrompt={isLoadingTestPrompt}
          idPrefix="video"
          onNavigateSettings={() => onNavigate("settings")}
          theme={theme}
        />
      </div>

      {/* Toast Feedback popup */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} id="toast-error" />}
      </AnimatePresence>
    </div>
  );
}
