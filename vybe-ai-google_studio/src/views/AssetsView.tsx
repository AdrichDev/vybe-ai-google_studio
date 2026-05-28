/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FolderLock, Image as ImageIcon, Video as VideoIcon, Music, 
  Layers, Search, Download, Heart, Trash2, ArrowRight, Upload, Sparkles 
} from 'lucide-react';
import { Asset, Project, ActiveSection } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AssetsViewProps {
  assets: Asset[];
  onToggleFavorite: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onOpenExportModal: (project: Project) => void;
  onNavigate: (section: ActiveSection) => void;
  onAddAsset: (asset: Asset) => void;
}

type TabType = 'image' | 'video' | 'audio' | 'template' | 'export';

export default function AssetsView({
  assets,
  onToggleFavorite,
  onDeleteAsset,
  onOpenExportModal,
  onNavigate,
  onAddAsset
}: AssetsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('image');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Filter assets matching tab and search parameters
  const filteredAssets = assets.filter((asset) => {
    // Normalise exports or templates mapping
    const category = asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : asset.type === 'audio' ? 'audio' : asset.type === 'template' ? 'template' : 'export';
    const matchesTab = activeTab === category;
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

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
      const sizeStr = (fileBytes / (1024 * 1024)).toFixed(1) + ' MB';

      const newAsset: Asset = {
        id: `a-upload-${Date.now()}`,
        title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        type: activeTab === 'export' ? 'image' : activeTab,
        url: dataUrl,
        ratio: activeTab === 'video' ? '9:16' : '1:1',
        size: sizeStr,
        isFavorite: false,
        duration: activeTab === 'video' ? '0:12' : activeTab === 'audio' ? '0:30' : undefined
      };

      onAddAsset(newAsset);
      showFeedback(`Uploaded "${file.name}" to ${activeTab.toUpperCase()} library!`);
    };
    reader.readAsDataURL(file);
  };

  const simulateDownload = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    showFeedback(`Compiling uncompressed source download...`);
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = asset.url;
      link.setAttribute('download', `${asset.title.toLowerCase().replace(/\s+/g, '_')}_vybe_master.jpg`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showFeedback(`File successfully downloaded!`);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto w-full" id="assets-workspace">
      
      {/* File input controller */}
      <input 
        type="file" 
        ref={uploadInputRef} 
        onChange={handleFileUploaded} 
        className="hidden" 
        accept={
          activeTab === 'image' ? 'image/*' : 
          activeTab === 'video' ? 'video/*' : 
          activeTab === 'audio' ? 'audio/*' : '*'
        }
      />

      {/* Header bar: Tab and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] border border-zinc-900 rounded-2xl p-4">
        
        {/* Five Interactive Tabs */}
        <div className="flex flex-wrap gap-1.5" id="asset-tabs-row">
          {[
            { id: 'image', label: 'Images', icon: ImageIcon },
            { id: 'video', label: 'Videos', icon: VideoIcon },
            { id: 'audio', label: 'Audio', icon: Music },
            { id: 'template', label: 'Templates', icon: Layers },
            { id: 'export', label: 'Exports', icon: FolderLock }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg shadow-[#00D2FF]/5'
                    : 'bg-zinc-950 border border-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-800'
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
          <div className="relative flex-1 sm:w-[220px]">
            <Search size={14} className="absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets..."
              className="w-full text-xs text-zinc-200 placeholder-zinc-500 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-[#00D2FF]/10"
              id="asset-search"
            />
          </div>

          <button
            onClick={handleUploadClick}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer select-none"
            id="assets-upload-trigger"
          >
            <Upload size={13} className="text-[#00D2FF]" />
            <span>Upload to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </button>
        </div>

      </div>

      {/* Interactive feedback toast overlay */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className="fixed bottom-16 right-6 z-50 bg-zinc-900/90 border border-[#00D2FF]/40 text-[#00D2FF] text-xs px-4.5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-mono"
            id="toast-assets"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset elements grid */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-[#121212]/30 border border-zinc-900/60 rounded-2xl">
          <FolderLock size={36} className="text-zinc-600 mb-2.5" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Empty {activeTab.toUpperCase()} Category</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-normal">
            No assets found in this folder. Use the "Upload" button above or generate premium cinematic sequences in the Studio tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" id="asset-scaffold-grid">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-[#121212] border border-zinc-900 duration-300 rounded-xl overflow-hidden hover:border-zinc-800 transition-all hover:shadow-2xl flex flex-col justify-between"
              id={`asset-card-${asset.id}`}
            >
              {/* Media Preview Aspect Frame */}
              <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {asset.type === 'audio' ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-zinc-400 select-none">
                    <Music size={42} className="text-[#9B51E0] animate-pulse" />
                    <span className="text-[9px] font-mono tracking-widest uppercase">AUDIO SYNTH</span>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Overlays on Hover containing: Use in Photo, Use in Video, Download, Favorite, Delete */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3.5 backdrop-blur-[2px]">
                  
                  {/* Top: Metadata tags */}
                  <div className="flex justify-between items-start text-[9px] font-mono select-none">
                    <span className="bg-black/65 border border-white/10 px-2 py-0.5 rounded text-zinc-300 uppercase">
                      {asset.ratio}
                    </span>
                    {asset.duration && (
                      <span className="bg-[#9B51E0] leading-none px-2 py-1 rounded font-bold text-white">
                        {asset.duration}
                      </span>
                    )}
                  </div>

                  {/* Center: Workspace quick actions */}
                  <div className="space-y-1.5 px-1">
                    <button
                      onClick={() => {
                        onNavigate('photo');
                        showFeedback(`Loaded base anchor in Photo Studio`);
                      }}
                      className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-white font-medium select-none cursor-pointer hover:border-zinc-700 transition-all whitespace-nowrap"
                    >
                      Use in Photo Studio
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('video');
                        showFeedback(`Loaded base anchor in Video Studio`);
                      }}
                      className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-white font-medium select-none cursor-pointer hover:border-zinc-700 transition-all whitespace-nowrap"
                    >
                      Use in Video Studio
                    </button>
                  </div>

                  {/* Bottom Panel: Download, Favorite, Delete */}
                  <div className="flex items-center justify-center gap-1.5">
                    
                    {/* Favorite toggler */}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleFavorite(asset.id);
                        showFeedback(asset.isFavorite ? 'Removed favorite status' : 'Added to premium favorites');
                      }}
                      className={`p-1.5 rounded border transition-colors cursor-pointer ${
                        asset.isFavorite 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                          : 'bg-zinc-900/90 border-zinc-850 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart size={12} fill={asset.isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {/* Compile Download */}
                    <button
                      type="button"
                      onClick={(e) => simulateDownload(e, asset)}
                      className="p-1.5 rounded bg-zinc-900/90 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <Download size={12} />
                    </button>

                    {/* Delete asset */}
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAsset(asset.id);
                        showFeedback('Removed asset file');
                      }}
                      className="p-1.5 rounded bg-zinc-900/90 border border-zinc-850 hover:border-rose-500 hover:text-rose-500 text-zinc-400 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                </div>
              </div>

              {/* Asset title details info block */}
              <div className="p-3 bg-zinc-900/35 group-hover:bg-[#161616] duration-200 border-t border-zinc-900/80">
                <h4 className="text-[11px] font-semibold text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
                  {asset.title}
                </h4>
                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-1">
                  <span className="uppercase">{asset.type}</span>
                  <span>{asset.size}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Guide notice footer panel */}
      <div className="bg-zinc-900/25 border border-zinc-900 p-4.5 rounded-xl flex items-start gap-3">
        <Sparkles size={15} className="text-[#00D2FF] mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest text-[10px]">Active Storage Synchronization</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
            Assets uploaded dynamically inside whichever folder is chosen are fully mirrored locally and prepared with direct multi-node proxy links. Any click launches the human-in-the-loop review pipeline.
          </p>
        </div>
      </div>

    </div>
  );
}
