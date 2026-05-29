/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  FolderLock,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Layers,
  Search,
  Download,
  Trash2,
  Upload,
  Sparkles,
} from "lucide-react";
import { Asset, Project, ActiveSection } from "../types";
import { AnimatePresence, motion } from "motion/react";
import { useFeedback } from "../hooks/useFeedBack";
import Toast from "../components/ui/Toast";
import AssetCard from "../components/ui/AssetCard";

interface AssetsViewProps {
  assets: Asset[];
  onToggleFavorite: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onOpenExportModal: (project: Project) => void;
  onNavigate: (section: ActiveSection) => void;
  onAddAsset: (asset: Asset) => void;
}

type TabType = "image" | "video" | "audio" | "template" | "export";

export default function AssetsView({
  assets,
  onToggleFavorite,
  onDeleteAsset,
  onOpenExportModal,
  onNavigate,
  onAddAsset,
}: AssetsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("image");
  const [searchTerm, setSearchTerm] = useState("");
  const { feedback, triggerFeedback } = useFeedback();
  const [selectedPreviewAsset, setSelectedPreviewAsset] =
    useState<Asset | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Filter assets matching tab and search parameters
  const filteredAssets = assets.filter((asset) => {
    // Normalise exports or templates mapping
    const category =
      asset.type === "image"
        ? "image"
        : asset.type === "video"
          ? "video"
          : asset.type === "audio"
            ? "audio"
            : asset.type === "template"
              ? "template"
              : "export";
    const matchesTab = activeTab === category;
    const matchesSearch = asset.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Upload simulation or native file upload integration
  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileBytes = file.size;
      const sizeStr = (fileBytes / (1024 * 1024)).toFixed(1) + " MB";

      const newAsset: Asset = {
        id: `a-upload-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
        type: activeTab === "export" ? "image" : activeTab,
        url: dataUrl,
        ratio: activeTab === "video" ? "9:16" : "1:1",
        size: sizeStr,
        isFavorite: false,
        duration:
          activeTab === "video"
            ? "0:12"
            : activeTab === "audio"
              ? "0:30"
              : undefined,
      };

      const folderName =
        activeTab === "image"
          ? "Imágenes"
          : activeTab === "video"
            ? "Videos"
            : activeTab === "audio"
              ? "Audio"
              : activeTab === "template"
                ? "Plantillas"
                : "Exportaciones";
      onAddAsset(newAsset);
      triggerFeedback(
        `¡"${file.name}" subido a la biblioteca de ${folderName}!`,
      );
    };
    reader.readAsDataURL(file);
  };

  const simulateDownload = (e: React.MouseEvent | any, asset: Asset) => {
    if (e && e.stopPropagation) e.stopPropagation();
    triggerFeedback(`Compilando la descarga de origen sin comprimir...`);
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = asset.url;
      link.setAttribute(
        "download",
        `${asset.title.toLowerCase().replace(/\s+/g, "_")}_vybe_master.jpg`,
      );
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerFeedback(`¡Archivo descargado con éxito!`);
    }, 1200);
  };

  return (
    <div
      className="p-6 space-y-6 h-full overflow-y-auto w-full"
      id="assets-workspace"
    >
      {/* File input controller */}
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileUploaded}
        className="hidden"
        accept={
          activeTab === "image"
            ? "image/*"
            : activeTab === "video"
              ? "video/*"
              : activeTab === "audio"
                ? "audio/*"
                : "*"
        }
      />

      {/* Header bar: Tab and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] border border-zinc-900 rounded-2xl p-4">
        {/* Five Interactive Tabs */}
        <div className="flex flex-wrap gap-1.5" id="asset-tabs-row">
          {[
            { id: "image", label: "Imágenes", icon: ImageIcon },
            { id: "video", label: "Videos", icon: VideoIcon },
            { id: "audio", label: "Audio", icon: Music },
            { id: "template", label: "Plantillas", icon: Layers },
            { id: "export", label: "Exportaciones", icon: FolderLock },
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg shadow-[#00D2FF]/5"
                    : "bg-zinc-950 border border-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-800"
                }`}
                id={`asset-tab-${tab.id}`}
              >
                <IconComp size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action controls: File search & Direct Upload trigger */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-[220px]\">
            <Search
              size={14}
              className="absolute left-3.5 top-3 text-zinc-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar recursos..."
              className="w-full text-xs text-zinc-200 placeholder-zinc-500 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-[#00D2FF]/10"
              id="asset-search"
            />
          </div>

          <button
            onClick={handleUploadClick}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-colors cursor-pointer select-none"
            id="assets-upload-trigger"
          >
            <Upload size={13} className="text-[#00D2FF]" />
            <span>
              Subir a{" "}
              {activeTab === "image"
                ? "Imágenes"
                : activeTab === "video"
                  ? "Videos"
                  : activeTab === "audio"
                    ? "Audio"
                    : activeTab === "template"
                      ? "Plantillas"
                      : "Exportaciones"}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive feedback toast overlay */}
      <AnimatePresence>
        {feedback && <Toast message={feedback} id="toast-assets" />}
      </AnimatePresence>

      {/* Asset elements grid */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-[#121212]/30 border border-zinc-900/60 rounded-2xl">
          <FolderLock size={36} className="text-zinc-600 mb-2.5" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Categoría de{" "}
            {activeTab === "image"
              ? "Imágenes"
              : activeTab === "video"
                ? "Videos"
                : activeTab === "audio"
                  ? "Audio"
                  : activeTab === "template"
                    ? "Plantillas"
                    : "Exportaciones"}{" "}
            Vacía
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-normal">
            No se encontraron recursos en este directorio. Utilice el botón
            "Subir" superior o genere secuencias cinemáticas premium en las
            pestañas de Studio.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          id="asset-scaffold-grid"
        >
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onNavigate={onNavigate}
              onPreview={setSelectedPreviewAsset}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeleteAsset}
              onDownload={simulateDownload}
              showFeedback={triggerFeedback}
            />
          ))}
        </div>
      )}

      {/* Guide notice footer panel */}
      <div className="bg-zinc-900/25 border border-zinc-900 p-4.5 rounded-xl flex items-start gap-3">
        <Sparkles size={15} className="text-[#00D2FF] mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest text-[10px]">
            Sincronización de Almacenamiento Activa
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
            Los recursos subidos dinámicamente dentro de la carpeta elegida se
            replican localmente por completo y se preparan con enlaces directos
            de proxy multi-nodo. Cualquier clic inicia el pipeline de revisión
            "human-in-the-loop".
          </p>
        </div>
      </div>

      {/* 4. PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPreviewAsset && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setSelectedPreviewAsset(null)}
            id="asset-preview-modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
              id="asset-preview-modal-dialog"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 rounded bg-zinc-900 text-[10px] font-mono text-[#00D2FF] uppercase border border-zinc-800">
                    {selectedPreviewAsset.type === "image"
                      ? "Imagen"
                      : selectedPreviewAsset.type === "video"
                        ? "Video"
                        : selectedPreviewAsset.type === "audio"
                          ? "Audio"
                          : selectedPreviewAsset.type === "template"
                            ? "Plantilla"
                            : "Exportación"}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate max-w-[280px]">
                    {selectedPreviewAsset.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPreviewAsset(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Preview Body */}
              <div className="p-6 flex items-center justify-center bg-zinc-950/40 relative aspect-video">
                {selectedPreviewAsset.type === "audio" ? (
                  <div className="flex flex-col items-center gap-3">
                    <Music size={64} className="text-[#9B51E0] animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                      Transmisión de Audio Interactiva
                    </span>
                    <audio
                      src={selectedPreviewAsset.url}
                      controls
                      className="w-80 mt-2 filter invert opacity-90"
                    />
                  </div>
                ) : (
                  <img
                    src={selectedPreviewAsset.url}
                    alt={selectedPreviewAsset.title}
                    className="max-h-[380px] w-full object-contain rounded-lg border border-zinc-955/60 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center p-4 border-t border-zinc-900 bg-zinc-900/10">
                <span className="text-xs font-mono text-zinc-500">
                  Tamaño: {selectedPreviewAsset.size}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      simulateDownload(e, selectedPreviewAsset);
                    }}
                    className="bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-xs text-white px-4 py-2 rounded-xl font-semibold cursor-pointer shadow-lg hover:shadow-[#00D2FF]/10 transition-all flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Descargar</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteAsset(selectedPreviewAsset.id);
                      setSelectedPreviewAsset(null);
                      triggerFeedback("Se eliminó el archivo de recurso");
                    }}
                    className="bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:text-red-500 duration-200 text-xs text-zinc-400 px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
