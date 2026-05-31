/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Eye,
  ArrowRight,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronDown,
  Instagram,
  Youtube,
  Tv,
} from "lucide-react";
import { Project, Asset, ActiveSection } from "../types";
import { PHOTO_PRESETS_BY_PLATFORM, DEFAULT_PHOTO_PRESET, SocialPreset } from "../content/socialPresets";
import { motion, AnimatePresence } from "motion/react";
import ProviderSelector from "../components/ui/ProviderSelector";
import UploadDropzone from "../components/ui/UploadDropzone";
import PromptInput from "../components/ui/PromptInput";
import Toast from "../components/ui/Toast";
import { useFeedback } from "../hooks/useFeedBack";

interface PhotoStudioViewProps {
  onAddProject: (project: Project) => void;
  onOpenExportModal: (project: Project) => void;
  photoProvider: "google" | "openai" | "huggingface";
  setPhotoProvider: (p: "google" | "openai" | "huggingface") => void;
  apiKeys: { google: string; openai: string; huggingface: string };
  onNavigate: (section: ActiveSection) => void;
  onAddAsset: (asset: Asset) => void;
  theme?: string;
}

const PHOTO_MODELS: Record<"google" | "openai" | "huggingface", { value: string; label: string }[]> = {
  google: [
    { value: "gemini-2.0-flash-preview-image-generation", label: "Gemini 2.0 Flash (Imagen)" },
    { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash (Edición)" },
  ],
  openai: [
    { value: "gpt-image-1-mini", label: "GPT Image-1 Mini (Testing)" },
    { value: "gpt-image-2", label: "GPT Image-2 (Máxima Calidad)" },
  ],
  huggingface: [
    { value: "flux-schnell", label: "FLUX.1-schnell (Gratuito, HF Inference)" },
  ],
};

// Helper utility to convert base64 data URL to a binary Blob
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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

function getOpenAiPhotoSize(preset: SocialPreset): string {
  if (preset.width > preset.height) return '1792x1024';
  if (preset.width < preset.height) return '1024x1792';
  return '1024x1024';
}

export default function PhotoStudioView({
  onAddProject,
  onOpenExportModal,
  photoProvider,
  setPhotoProvider,
  apiKeys,
  onNavigate,
  onAddAsset,
  theme = "dark",
}: PhotoStudioViewProps) {
  const [aiPreferences, setAiPreferences] = useState({
    model: PHOTO_MODELS[photoProvider][0].value,
    quality: "pro",
  });

  // Resetear modelo al primer opción del proveedor al cambiar
  useEffect(() => {
    setAiPreferences((prev) => ({ ...prev, model: PHOTO_MODELS[photoProvider][0].value }));
  }, [photoProvider]);
  const [prompt, setPrompt] = useState("");
  const [isLoadingTestPrompt, setIsLoadingTestPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const { feedback: toastMessage, triggerFeedback } = useFeedback();

  const hasPhotoProviderKey = Boolean(
    apiKeys[photoProvider as keyof typeof apiKeys]
  );

  // Dropzone files states
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [baseFileName, setBaseFileName] = useState<string>("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refFileName, setRefFileName] = useState<string>("");

  // Drag states
  const [isDraggingBase, setIsDraggingBase] = useState(false);
  const [isDraggingRef, setIsDraggingRef] = useState(false);

  // Before / After View toggle state
  const [activeTab, setActiveTab] = useState<"after" | "before">("before");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Socials conectados desde Settings (localStorage)
  const [connectedSocials] = useState<Record<Platform, boolean>>(() => {
    try {
      const saved = localStorage.getItem("vybe_socials");
      return saved ? JSON.parse(saved) : { instagram: false, tiktok: false, youtube: false };
    } catch { return { instagram: false, tiktok: false, youtube: false }; }
  });

  // Ref para liberar object URLs de FLUX y evitar fugas de memoria
  const fluxBlobUrlRef = useRef<string | null>(null);

  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<SocialPreset>(DEFAULT_PHOTO_PRESET);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Al cambiar plataforma, seleccionar el primer preset de esa plataforma
  useEffect(() => {
    const presets = PHOTO_PRESETS_BY_PLATFORM[activePlatform];
    if (presets.length > 0) setActivePreset(presets[0]);
  }, [activePlatform]);

  // Liberar object URLs de FLUX al desmontar el componente
  useEffect(() => {
    return () => {
      if (fluxBlobUrlRef.current) URL.revokeObjectURL(fluxBlobUrlRef.current);
    };
  }, []);


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

  // File loading helper
  const processUploadedFile = (file: File, target: "base" | "ref") => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

      if (target === "base") {
        setBaseImage(result);
        setBaseFileName(file.name);
        setActiveTab("before"); // Automatically switch to view the raw uploaded image
      } else {
        setRefImage(result);
        setRefFileName(file.name);
      }

      // Add to global Assets automatically!
      const newAsset = {
        id: `a-${target}-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
        type: "image" as const,
        url: result,
        ratio: activePreset.aspectRatio,
        size: sizeStr,
        isFavorite: false,
      };
      onAddAsset(newAsset);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClick = () => {
    if (!prompt.trim() || isGenerating) return;
    const op = baseImage ? "Editando" : "Generando";
    triggerFeedback(`${op} con ${photoProvider === "google" ? "Google AI" : photoProvider === "openai" ? `OpenAI (${aiPreferences.model})` : `Hugging Face (${aiPreferences.model})`}...`);
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);

    const steps = [
      "Descomprimiendo variables de peso del modelo base...",
      "Mapeando superposiciones de iluminación de referencia visual...",
      "Inyectando cuadrículas de ruido latente en el lienzo activo...",
      "Escalando filtros de mejora neuronal...",
      "Finalizando micro-texturas de alta fidelidad...",
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

    let realGeneratedImage = "";
    let apiErrorOccurred = false;
    let lastApiError = "";

    const callApi = async () => {
      try {
        const commonParams = {
          model: aiPreferences.model,
          quality: aiPreferences.quality,
          aspectRatio: activePreset.aspectRatio,
        };

        // ── GOOGLE ──────────────────────────────────────────────────────────
        if (photoProvider === "google") {
          let fetchInit: RequestInit;

          if (baseImage) {
            const form = new FormData();
            form.append("prompt", prompt);
            if (apiKeys.google) form.append("googleKey", apiKeys.google);
            Object.entries(commonParams).forEach(([k, v]) => form.append(k, String(v)));
            form.append("image", dataURLtoBlob(baseImage), baseFileName || "base_image.png");
            fetchInit = { method: "POST", body: form };
          } else {
            fetchInit = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, googleKey: apiKeys.google || undefined, ...commonParams }),
            };
          }

          const response = await fetch("http://localhost:8080/api/generar-imagen", fetchInit);
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (!data.imageUrl) throw new Error("No se recibió imagen del backend (Google).");
          realGeneratedImage = data.imageUrl;

        // ── OPENAI ─────��────────────────────────────────────────────────────
        } else if (photoProvider === "openai") {
          const size = getOpenAiPhotoSize(activePreset);

          if (baseImage) {
            // Edición real con imagen base → multipart
            const form = new FormData();
            form.append("prompt", prompt);
            if (apiKeys.openai) form.append("openaiKey", apiKeys.openai);
            form.append("size", size);
            Object.entries(commonParams).forEach(([k, v]) => form.append(k, String(v)));
            form.append("image", dataURLtoBlob(baseImage), baseFileName || "base_image.png");

            const response = await fetch("http://localhost:8080/api/editar-imagen-openai", {
              method: "POST",
              body: form,
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData?.error || `Error HTTP ${response.status}`);
            }
            const data = await response.json();
            if (!data.imageUrl) throw new Error("No se recibió imagen del backend (OpenAI edit).");
            realGeneratedImage = data.imageUrl;

          } else {
            // Generación desde texto
            const response = await fetch("http://localhost:8080/api/generar-imagen-openai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, size, openaiKey: apiKeys.openai || undefined, ...commonParams }),
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData?.error || `Error HTTP ${response.status}`);
            }
            const data = await response.json();
            if (!data.imageUrl) throw new Error("No se recibió imagen del backend (OpenAI).");
            realGeneratedImage = data.imageUrl;
          }

        // ── HUGGING FACE — siempre por backend ──────────────────────────────
        } else if (photoProvider === "huggingface") {
          const form = new FormData();
          form.append("prompt", prompt);
          if (apiKeys.huggingface) form.append("hfToken", apiKeys.huggingface);
          Object.entries(commonParams).forEach(([k, v]) => form.append(k, String(v)));
          if (baseImage) {
            form.append("image", dataURLtoBlob(baseImage), baseFileName || "base_image.png");
          }

          const response = await fetch("http://localhost:8080/api/generar-imagen-hf", {
            method: "POST",
            body: form,
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (!data.imageUrl) throw new Error("No se recibió imagen del backend (Hugging Face).");
          realGeneratedImage = data.imageUrl;
        }
      } catch (err: any) {
        console.error("API Error:", err);
        apiErrorOccurred = true;
        lastApiError = err.message || "Error desconocido";
      }
    };

    await callApi();
    clearInterval(stepInterval);
    setIsGenerating(false);
      setSimulatedStep("");

      if (apiErrorOccurred || !realGeneratedImage) {
        setIsGenerating(false);
        triggerFeedback(`Error: ${lastApiError || 'No se pudo generar la imagen.'}`);
        return;
      }

      setIsGenerating(false);
      setActiveTab("after");
      setAfterImage(realGeneratedImage);

      const newProj: Project = {
        id: `p-gen-${Date.now()}`,
        title: prompt.substring(0, 35) + "...",
        timestamp: "Ahora mismo",
        format: "Image",
        image: realGeneratedImage,
        status: "Ready",
        prompt: prompt,
        ratio: activePreset.aspectRatio,
      };

      onAddProject(newProj);
  };

  const handleLoadTestPrompt = async () => {
    setIsLoadingTestPrompt(true);
    try {
      const response = await fetch("http://localhost:8080/api/generar-prompt-prueba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "photo",
          platform: activePlatform,
          aspectRatio: activePreset.aspectRatio,
          provider: photoProvider,
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

  const previewSrc: string | null =
    activeTab === "before" ? (baseImage || null) : (afterImage || null);

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full"
      id="photo-studio-workspace"
    >
      {/* 2 Dropzones on Left Panel */}
      <div
        className={`w-full lg:w-[320px] ${
          theme === 'light'
            ? 'bg-[#EAEAEF] border-[#CECED8] shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-zinc-900'
            : 'bg-[#121212] border-zinc-900 text-white'
        } border rounded-2xl p-5 flex flex-col justify-between overflow-y-auto`}
        id="multimodal-reference-panel"
      >
        <div className="space-y-6">
          <div className={`flex items-center gap-2 border-b ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900'} pb-3`}>
            <Layers size={15} className="text-[#00D2FF]" />
            <h3 className={`text-xs font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} uppercase tracking-wider`}>
              CANALES DE ENTRADA
            </h3>
          </div>

          {/* AI Engine Provider Selector */}
          <ProviderSelector
            provider={photoProvider}
            onChange={setPhotoProvider}
            idPrefix="photo"
            apiKeys={apiKeys}
            theme={theme}
          />

          {/* AI Engine Model & Resolution Preferences */}
          <div className={`space-y-4 pt-4 border-t ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900/60'}`}>
            <div className="space-y-2">
              <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block`}>
                Motor de Imagen
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
                id="select-photo-engine"
              >
                {PHOTO_MODELS[photoProvider].map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* DROPZONE 1: Base Image */}
          <div className="space-y-2 pt-4 border-t border-zinc-900/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              1. Imagen Base
            </span>
            {baseImage ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <img
                  src={baseImage}
                  alt="Base reference upload"
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {baseFileName || "Base subida"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00FF87] px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Listo
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBaseImage(null);
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
                title="Subir Imagen Base"
                subtitle="Arrastra y suelta o pulsa aquí"
                accept="image/*"
                isDragging={isDraggingBase}
                setIsDragging={setIsDraggingBase}
                id="container-base"
                innerId="dropzone-base"
                theme={theme}
              />
            )}
          </div>

          {/* DROPZONE 2: Reference Images */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                2. Estilos de Referencia
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 uppercase tracking-wider">
                Próximamente
              </span>
            </div>
            {refImage ? (
              <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center gap-3">
                <img
                  src={refImage}
                  alt="Style reference upload"
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {refFileName || "Estilo subido"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#00FF87] px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Listo
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRefImage(null);
                    setRefFileName("");
                  }}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors pointer-events-auto cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <UploadDropzone
                onFileSelect={(file) => processUploadedFile(file, "ref")}
                title="Referencia de Estilo"
                subtitle="Ancla el aspecto visual de cámara"
                accept="image/*"
                icon={Layers}
                isDragging={isDraggingRef}
                setIsDragging={setIsDraggingRef}
                id="container-style"
                innerId="dropzone-style"
                theme={theme}
              />
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className={`border-t pt-4 mt-6 ${theme === 'light' ? 'border-zinc-200' : 'border-zinc-900/80'}`}>
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
            El modelo de refinamiento procesa parámetros base de forma recursiva
            en cada solicitud. Superposición de matriz raw multi-nodo activa.
          </p>
        </div>
      </div>

      {/* Main Preview Workspace (Right block) */}
      <div
        className={`flex-1 flex flex-col justify-between ${
          theme === 'light'
            ? 'bg-[#EAEAEF] border-[#CECED8] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            : 'bg-zinc-950/40 border-zinc-900'
        } border rounded-2xl p-5 min-h-0`}
        id="photo-canvas-workspace"
      >
        {/* Workspace head bar */}
        <div className={`flex justify-between items-center border-b ${theme === 'light' ? 'border-zinc-100' : 'border-zinc-900'} pb-3 mb-4`}>
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[#9B51E0]" />
            <h4 className={`text-xs font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} uppercase tracking-wider`}>
              {isGenerating ? (photoProvider === 'google' ? "Sintetizando vía Google AI..." : photoProvider === 'openai' ? "Sintetizando vía OpenAI..." : "Sintetizando vía FLUX.1...") : "Área de Trabajo"}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* 1. Red social — primero */}
            <div className="relative" ref={platformDropdownRef} id="photo-platform-select">
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
                <div className={`absolute top-full left-0 mt-1 z-50 border rounded-xl overflow-hidden shadow-2xl w-[180px] ${theme === 'light' ? 'bg-[#E8E8EE] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800'}`}>
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
                            : platform === activePlatform
                              ? theme === 'light' ? 'bg-zinc-100 cursor-pointer' : 'bg-zinc-800/80 cursor-pointer'
                              : theme === 'light' ? 'hover:bg-zinc-50 cursor-pointer' : 'hover:bg-zinc-900 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: connected ? color : undefined }} className={connected ? '' : 'text-zinc-600'} />
                          <span className={`text-[11px] font-bold ${connected ? (theme === 'light' ? 'text-zinc-800' : 'text-white') : 'text-zinc-500'}`}>{label}</span>
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
            <div className="relative" ref={presetDropdownRef} id="photo-format-preset-select">
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
                <div className={`absolute top-full left-0 mt-1 z-50 border rounded-xl overflow-hidden shadow-2xl w-[230px] ${theme === 'light' ? 'bg-[#E8E8EE] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800'}`}>
                  {PHOTO_PRESETS_BY_PLATFORM[activePlatform].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setActivePreset(p); setIsPresetOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        p.id === activePreset.id
                          ? theme === 'light' ? 'bg-zinc-100 text-[#9B51E0]' : 'bg-zinc-800/80 text-[#00D2FF]'
                          : theme === 'light' ? 'text-zinc-700 hover:bg-zinc-50' : 'text-zinc-300 hover:bg-zinc-900'
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

            {/* Before/After display tabs */}
            <div className={`flex rounded-lg p-0.5 border ${theme === 'light' ? 'bg-[#E2E2EA] border-[#CECED8]' : 'bg-zinc-900 border-zinc-800'}`}>
              <button
                onClick={() => setActiveTab("before")}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === "before"
                    ? theme === 'light' ? "bg-white text-zinc-900 font-semibold shadow-sm" : "bg-zinc-800 text-white font-semibold"
                    : theme === 'light' ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Antes
              </button>
              <button
                onClick={() => setActiveTab("after")}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === "after"
                    ? "bg-[#00D2FF]/10 text-[#00D2FF] font-semibold"
                    : theme === 'light' ? "text-zinc-500 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Después
              </button>
            </div>

            {/* Direct Zoom level togglers */}
            <div className={`flex items-center rounded-lg p-0.5 border gap-1.5 px-2 ${theme === 'light' ? 'bg-[#E2E2EA] border-[#CECED8]' : 'bg-zinc-900 border-zinc-800'}`}>
              <button
                onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.25))}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[9px] font-mono text-zinc-400 w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.25))}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {hasGenerated && !isGenerating && (
              <button
                onClick={() =>
                  onOpenExportModal({
                    id: "p-temp",
                    title: "Exportación del Estudio de Fotos",
                    timestamp: "Ahora mismo",
                    format: "Image",
                    image: previewSrc,
                    status: "Ready",
                    prompt: prompt,
                  })
                }
                className={`border text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer flex items-center gap-1 transition-all ${
                  theme === 'light'
                    ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white'
                }`}
                id="studio-export-btn"
              >
                <span>Exportar Máster</span>
                <ArrowRight size={13} className="text-[#00D2FF]" />
              </button>
            )}
          </div>
        </div>

        {/* Central visual screen (zoom + comparisons state) */}
        <div
          className={`flex-1 flex items-center justify-center p-4 rounded-xl border relative overflow-hidden ${
            theme === 'light'
              ? 'bg-[#E2E2EA] border-[#CECED8]'
              : 'bg-zinc-950/80 border-zinc-900/60'
          }`}
          id="photo-canvas-display"
        >
          {/* Status Display badge */}
          <div className={`absolute top-4 left-4 z-20 rounded px-2.5 py-1 text-[9px] tracking-widest text-[#00D2FF] uppercase font-mono shadow-md border ${
            theme === 'light'
              ? 'bg-[#E8E8EE]/95 border-[#CECED8]'
              : 'bg-black/85 border-zinc-800/80'
          }`}>
             {isGenerating
              ? (photoProvider === 'google' ? 'Procesando con Google AI...' : photoProvider === 'openai' ? 'Procesando con OpenAI...' : 'Procesando con Hugging Face...')
              : activeTab === "before"
                ? "Listo para editar"
                : "Vista previa"}
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
                  <Sparkles
                    size={18}
                    className="absolute inset-0 m-auto text-[#9B51E0] animate-pulse"
                  />
                </div>

                <h4 className="text-xs font-semibold text-white tracking-tight animate-pulse uppercase font-mono">
                  Sintetizando Matriz Maestra
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {simulatedStep || "Refinando anclajes vectoriales..."}
                </p>

                <div className="w-40 h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-flow-width" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Viewport — ratio dinámico, lienzo vacío si no hay imagen */}
          <div
            className="relative h-[340px] md:h-[400px] overflow-hidden rounded-xl border border-zinc-800/80 shadow-2xl transition-all duration-300"
            style={{ aspectRatio: `${activePreset.width}/${activePreset.height}` }}
          >
            {previewSrc ? (
              <>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl gap-3 ${
                theme === 'light' ? 'bg-[#E8E8EE] border-[#CECED8]' : 'bg-zinc-950 border-zinc-800/60'
              }`}>
                <div className={theme === 'light' ? 'text-zinc-400' : 'text-zinc-700'}>
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

        {/* Input de prompt con micrófono real y carga de prompt de prueba */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateClick}
          isGenerating={isGenerating}
          provider={photoProvider}
          hasApiKey={hasPhotoProviderKey}
          onLoadTestPrompt={handleLoadTestPrompt}
          isLoadingTestPrompt={isLoadingTestPrompt}
          idPrefix="photo"
          onNavigateSettings={() => onNavigate("settings")}
          theme={theme}
        />
      </div>

      {/* Interactive feedback toast overlay for API requirement */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} id="toast-error" />}
      </AnimatePresence>
    </div>
  );
}
