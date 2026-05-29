import React from 'react';
import { Asset, ActiveSection } from '../../types';
import { Music, Heart, Download, Trash2 } from 'lucide-react';

interface AssetCardProps {
  key?: string | number;
  asset: Asset;
  onNavigate: (section: ActiveSection) => void;
  onPreview: (asset: Asset) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (e: React.MouseEvent, asset: Asset) => void;
  showFeedback: (msg: string) => void;
}

export default function AssetCard({
  asset,
  onNavigate,
  onPreview,
  onToggleFavorite,
  onDelete,
  onDownload,
  showFeedback
}: AssetCardProps) {
  return (
    <div
      className="group relative bg-[#121212] border border-zinc-900 duration-300 rounded-xl overflow-hidden hover:border-zinc-800 transition-all hover:shadow-2xl flex flex-col justify-between"
      id={`asset-card-${asset.id}`}
    >
      <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        {asset.type === 'audio' ? (
          <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-zinc-400 select-none">
            <Music size={42} className="text-[#9B51E0] animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest uppercase">SINTETIZADOR AUDIO</span>
          </div>
        ) : (
          <img
            src={asset.url}
            alt={asset.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />
        )}

        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3.5 backdrop-blur-[2px]\">
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

          <div className="space-y-1.5 px-1">
            <button
              onClick={() => {
                onNavigate('photo');
                showFeedback(`Ancla de base cargada en Photo Studio`);
              }}
              className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-white font-medium select-none cursor-pointer hover:border-zinc-700 transition-all whitespace-nowrap"
            >
              Usar en Photo Studio
            </button>
            <button
              onClick={() => {
                onNavigate('video');
                showFeedback(`Ancla de base cargada en Video Studio`);
              }}
              className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded text-[10px] text-white font-medium select-none cursor-pointer hover:border-zinc-700 transition-all whitespace-nowrap"
            >
              Usar en Video Studio
            </button>
            <button
              type="button"
              onClick={() => onPreview(asset)}
              className="w-full text-center py-1.5 bg-gradient-to-r from-[#00D2FF]/10 to-[#9B51E0]/10 hover:from-[#00D2FF]/20 hover:to-[#9B51E0]/20 border border-zinc-800 rounded text-[10px] text-white font-medium select-none cursor-pointer transition-all whitespace-nowrap"
            >
              Vista Previa Al Instante
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 font-sans">
            <button
              type="button"
              onClick={() => {
                onToggleFavorite(asset.id);
                showFeedback(asset.isFavorite ? 'Se eliminó el estado de favorito' : 'Añadido a favoritos premium');
              }}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                asset.isFavorite 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                  : 'bg-zinc-900/90 border-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart size={12} fill={asset.isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={(e) => onDownload(e, asset)}
              className="p-1.5 rounded bg-zinc-900/90 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              <Download size={12} />
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(asset.id);
                showFeedback('Removed asset file');
              }}
              className="p-1.5 rounded bg-zinc-900/90 border border-zinc-850 hover:border-rose-500 hover:text-rose-500 text-zinc-400 cursor-pointer transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      <div 
        className="p-3 bg-zinc-900/35 group-hover:bg-[#161616] duration-200 border-t border-zinc-900/80 cursor-pointer"
        onClick={() => onPreview(asset)}
      >
        <h4 className="text-[11px] font-semibold text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
          {asset.title}
        </h4>
        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-1">
          <span className="uppercase">{asset.type === 'image' ? 'imagen' : asset.type === 'video' ? 'video' : asset.type === 'audio' ? 'audio' : asset.type === 'template' ? 'plantilla' : 'exportación'}</span>
          <span>{asset.size}</span>
        </div>
      </div>
    </div>
  );
}
