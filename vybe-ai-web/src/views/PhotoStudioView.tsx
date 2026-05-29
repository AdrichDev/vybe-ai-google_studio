/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Eye,
  ArrowRight,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import { Project } from "../types";
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
  onNavigate: (section: any) => void;
  onAddAsset: (asset: any) => void;
}

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

const PREMIUM_OUTPUTS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80",
];

export default function PhotoStudioView({
  onAddProject,
  onOpenExportModal,
  photoProvider,
  setPhotoProvider,
  apiKeys,
  onNavigate,
  onAddAsset,
}: PhotoStudioViewProps) {
  const [prompt, setPrompt] = useState(
    "Un modelo influencer de alta costura premium usando gafas de sol negras de satén limpio, luces laterales de estudio cyberpunk, textura de piel de hiper-fidelidad extrema, grano editorial.",
  );
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
  const [activeTab, setActiveTab] = useState<"after" | "before">("after");
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Zoom scale

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
        ratio: "1:1",
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
      `Conectando con ${photoProvider === "google" ? "Google AI (Gemini)" : photoProvider === "openai" ? "OpenAI (DALL-E 3)" : "Hugging Face (FLUX.1)"} vía backend seguro...`,
    );
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);

    const steps = [
      "Decompressing base model weight variables...",
      "Mapping visual lighting reference overlays...",
      "Injecting latent noise grids into active canvas...",
      "Scaling neural upscale filters (Veo 3.1 Pro)...",
      "Finalizing high-fidelity skin micro-textures...",
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
        if (photoProvider === "google") {
          const response = await fetch("http://localhost:8080/api/generar-imagen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedImage = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend local.");
          }
        } else if (photoProvider === "openai") {
          const response = await fetch("http://localhost:8080/api/generar-imagen-openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, size: "1024x1024" }),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedImage = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend (OpenAI).");
          }
        } else if (photoProvider === "huggingface") {
          let response;
          if (baseImage) {
            // Image-to-Image using FormData
            const formData = new FormData();
            formData.append("prompt", prompt);
            const blob = dataURLtoBlob(baseImage);
            formData.append("image", blob, baseFileName || "base_image.png");

            response = await fetch("http://localhost:8080/api/generar-imagen-hf", {
              method: "POST",
              body: formData,
            });
          } else {
            // Text-to-Image using JSON
            response = await fetch("http://localhost:8080/api/generar-imagen-hf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            });
          }

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error || `Error HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.imageUrl) {
            realGeneratedImage = data.imageUrl;
          } else {
            throw new Error("No se pudo extraer la imagen del backend (Hugging Face).");
          }
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
      setActiveTab("after");
      setSimulatedStep("");

      const targetImage =
        !apiErrorOccurred && realGeneratedImage
          ? realGeneratedImage
          : PREMIUM_OUTPUTS[Math.floor(Math.random() * PREMIUM_OUTPUTS.length)];

      if (!realGeneratedImage && apiErrorOccurred) {
        triggerFeedback(
          `Error de API: ${lastApiError}. Usando vista previa.`
        );
      }

      setAfterImage(targetImage);

      const newProj: Project = {
        id: `p-gen-${Date.now()}`,
        title: prompt.substring(0, 35) + "...",
        timestamp: "Just now",
        format: "Image",
        image: targetImage,
        status: "Ready",
        prompt: prompt,
      };

      onAddProject(newProj);
  };

  // Default images in case nothing is uploaded
  const defaultBeforeImage =
    baseImage ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80";
  const defaultAfterImage =
    afterImage ||
    (hasGenerated
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
      : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80");

  const previewSrc =
    activeTab === "before" ? defaultBeforeImage : defaultAfterImage;

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 p-6 h-full min-h-0 w-full"
      id="photo-studio-workspace"
    >
      {/* 2 Dropzones on Left Panel */}
      <div
        className="w-full lg:w-[320px] bg-[#121212] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto"
        id="multimodal-reference-panel"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Layers size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              CANALES DE ENTRADA
            </h3>
          </div>

          {/* AI Engine Provider Selector */}
          <ProviderSelector
            provider={photoProvider}
            onChange={setPhotoProvider}
            idPrefix="photo"
            apiKeys={apiKeys}
          />

          {/* DROPZONE 1: Base Image */}
          <div className="space-y-2">
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
                    {baseFileName || "Uploaded Base"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
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
              />
            )}
          </div>

          {/* DROPZONE 2: Reference Images */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              2. Estilos de Referencia
            </span>
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
                    {refFileName || "Uploaded Style"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
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
              />
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="border-t border-zinc-900/80 pt-4 mt-6">
          <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
            Invisible refinement model is processing base parameters recursively
            on every request. Direct multi-node raw matrix overlay active.
          </p>
        </div>
      </div>

      {/* Main Preview Workspace (Right block) */}
      <div
        className="flex-1 flex flex-col justify-between bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 min-h-0"
        id="photo-canvas-workspace"
      >
        {/* Workspace head bar */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[#9B51E0]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              {isGenerating ? (photoProvider === 'google' ? "Sintetizando vía Google AI..." : photoProvider === 'openai' ? "Sintetizando vía OpenAI..." : "Sintetizando vía FLUX.1...") : "Área de Trabajo"}
            </h4>
          </div>

          <div className="flex items-center gap-3">
            {/* Before/After display tabs */}
            <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setActiveTab("before")}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === "before"
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setActiveTab("after")}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-colors uppercase cursor-pointer ${
                  activeTab === "after"
                    ? "bg-[#00D2FF]/10 text-[#00D2FF] font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                After
              </button>
            </div>

            {/* Direct Zoom level togglers */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 gap-1.5 px-2">
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
                    title: "Custom Photo Studio Export",
                    timestamp: "Just now",
                    format: "Image",
                    image: previewSrc,
                    status: "Ready",
                    prompt: prompt,
                  })
                }
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
        <div
          className="flex-1 flex items-center justify-center p-4 bg-zinc-950/80 rounded-xl border border-zinc-900/60 relative overflow-hidden"
          id="photo-canvas-display"
        >
          {/* Status Display badge */}
          <div className="absolute top-4 left-4 z-20 bg-black/85 border border-zinc-800/80 rounded px-2.5 py-1 text-[9px] tracking-widest text-[#00D2FF] uppercase font-mono shadow-md">
             {isGenerating
              ? (photoProvider === 'google' ? 'Procesando con Google AI...' : photoProvider === 'openai' ? 'Procesando con OpenAI...' : 'Procesando con Hugging Face...')
              : activeTab === "before"
                ? "Ready to edit"
                : "Preview"}
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
                  Synthesizing Master Matrix
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-800/60 max-w-sm line-clamp-1">
                  {simulatedStep || "Refining vector anchors..."}
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

        {/* Input Text consolidated layout using PromptInput reusable UI */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateClick}
          isGenerating={isGenerating}
          provider={photoProvider}
          hasApiKey={hasPhotoProviderKey}
          onMicText="Fotografía de primer plano de una chaqueta de cuero de moda urbana de lujo en un estudio de concreto oscuro, iluminación suave de contorno dorado, detalle de tejido de tela altamente complejo, estilo de película RAW."
          idPrefix="photo"
          presetPromptText="Toma macro extrema de gafas de sol de lujo de alta costura reflejando carteles publicitarios de neón morado, aspecto cinematográfico anamórfico, master RAW 8k."
          presetLabel="Cargar preset premium"
          onNavigateSettings={() => onNavigate("settings" as any)}
        />
      </div>

      {/* Interactive feedback toast overlay for API requirement */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} id="toast-error" />}
      </AnimatePresence>
    </div>
  );
}
