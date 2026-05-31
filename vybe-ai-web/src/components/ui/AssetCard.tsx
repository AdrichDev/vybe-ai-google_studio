import React, { useRef, useState } from 'react';
import { Asset, ActiveSection } from '../../types';
import { Music, Heart, Download, Trash2, Play, Pause, Volume2, Scissors } from 'lucide-react';

interface AssetCardProps {
  key?: string | number;
  asset: Asset;
  onNavigate: (section: ActiveSection) => void;
  onPreview: (asset: Asset) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (e: React.MouseEvent, asset: Asset) => void;
  showFeedback: (msg: string) => void;
  theme?: string;
}

async function extractAudioFromVideo(asset: Asset, showFeedback: (msg: string) => void) {
  try {
    showFeedback("Extrayendo audio del video...");

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();

    // Fetch el video como ArrayBuffer
    const res = await fetch(asset.url);
    const arrayBuffer = await res.arrayBuffer();

    // Decodificar el audio del video
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Renderizar a un OfflineAudioContext para exportar
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    // Convertir a WAV
    const wavBlob = audioBufferToWav(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset.title || "audio_extraido"}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback("¡Audio extraído y descargado!");
    audioCtx.close();
  } catch (err: any) {
    showFeedback(`Error al extraer audio: ${err.message}`);
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = buffer.length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export default function AssetCard({
  asset,
  onNavigate,
  onPreview,
  onToggleFavorite,
  onDelete,
  onDownload,
  showFeedback,
  theme = 'dark',
}: AssetCardProps) {
  const isLight = theme === 'light';
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration || duration;
    if (!dur || isNaN(dur)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * dur;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    if (!duration) setDuration(dur);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    const media = asset.type === 'video' ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleEnded = () => setIsPlaying(false);

  return (
    <div
      className={`group relative border duration-300 rounded-xl overflow-hidden transition-all hover:shadow-xl flex flex-col justify-between ${
        isLight
          ? 'bg-[#EAEAEF] border-[#CECED8] hover:border-[#AEAEBB]'
          : 'bg-[#121212] border-zinc-900 hover:border-zinc-800'
      }`}
      id={`asset-card-${asset.id}`}
    >
      {/* ── MEDIA THUMBNAIL ── */}
      <div className={`relative aspect-square w-full flex items-center justify-center overflow-hidden ${isLight ? 'bg-[#E2E2EA]' : 'bg-zinc-950'}`}>

        {/* VIDEO */}
        {asset.type === 'video' && (
          <>
            <video
              ref={videoRef}
              src={asset.url}
              className="w-full h-full object-cover"
              loop
              playsInline
              onEnded={handleEnded}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            {/* Play/Pause overlay */}
            <button
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isPlaying ? 'bg-transparent opacity-0 hover:opacity-100 hover:bg-black/30' : 'bg-black/40 hover:bg-black/55'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg">
                {isPlaying
                  ? <Pause size={18} className="fill-white text-white" />
                  : <Play size={18} className="fill-white text-white translate-x-0.5" />
                }
              </div>
            </button>
          </>
        )}

        {/* AUDIO */}
        {asset.type === 'audio' && (
          <>
            <audio
              ref={audioRef}
              src={asset.url}
              preload="metadata"
              onEnded={handleEnded}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
              onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
            />
            <div className="flex flex-col items-center gap-3 select-none w-full px-4">
              {/* Waveform visual */}
              <div className="flex items-end gap-0.5 h-10">
                {Array.from({ length: 24 }).map((_, i) => {
                  const baseH = 8 + Math.sin(i * 0.8) * 8 + Math.cos(i * 0.4) * 5;
                  const peakH = baseH + 10 + Math.sin(i * 1.3) * 8;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full ${isPlaying ? 'bg-[#9B51E0]' : 'bg-[#9B51E0]/40'}`}
                      style={{
                        height: `${baseH}px`,
                        animation: isPlaying
                          ? `waveBar 0.6s ease-in-out ${(i * 35) % 500}ms infinite alternate`
                          : 'none',
                        ['--peak' as any]: `${peakH}px`,
                        ['--base' as any]: `${baseH}px`,
                      }}
                    />
                  );
                })}
              </div>
              <style>{`
                @keyframes waveBar {
                  from { height: var(--base); opacity: 0.7; }
                  to   { height: var(--peak); opacity: 1; }
                }
              `}</style>
              {/* Play button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#9B51E0] hover:bg-[#8040C0] flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                {isPlaying
                  ? <Pause size={16} className="fill-white text-white" />
                  : <Play size={16} className="fill-white text-white translate-x-0.5" />
                }
              </button>
              {/* Progress bar */}
              <div className="w-full space-y-1 px-1">
                <div
                  className="w-full h-1.5 bg-zinc-700/50 rounded-full cursor-pointer relative group/bar"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#9B51E0] to-[#00D2FF] rounded-full transition-none"
                    style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity -ml-1.5"
                    style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                <Volume2 size={9} />
                <span className="uppercase tracking-widest">{isPlaying ? 'Reproduciendo...' : 'Audio'}</span>
              </div>
            </div>
          </>
        )}

        {/* IMAGE */}
        {asset.type !== 'video' && asset.type !== 'audio' && (
          <img
            src={asset.url}
            alt={asset.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Hover actions overlay — solo para imágenes */}
        {asset.type !== 'video' && asset.type !== 'audio' && (
          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3.5 backdrop-blur-[2px]">
            <div className="flex justify-between items-start text-[9px] font-mono select-none">
              <span className="bg-black/65 border border-white/10 px-2 py-0.5 rounded text-zinc-300 uppercase">{asset.ratio}</span>
              {asset.duration && (
                <span className="bg-[#9B51E0] leading-none px-2 py-1 rounded font-bold text-white">{asset.duration}</span>
              )}
            </div>
            <div className="space-y-1.5 px-1">
              <button
                onClick={() => { onNavigate('photo'); showFeedback('Ancla de base cargada en Photo Studio'); }}
                className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-white font-medium select-none cursor-pointer transition-all whitespace-nowrap"
              >
                Usar en Photo Studio
              </button>
              <button
                onClick={() => { onNavigate('video'); showFeedback('Ancla de base cargada en Video Studio'); }}
                className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-white font-medium select-none cursor-pointer transition-all whitespace-nowrap"
              >
                Usar en Video Studio
              </button>
              <button
                type="button"
                onClick={() => onPreview(asset)}
                className="w-full text-center py-1.5 bg-gradient-to-r from-[#00D2FF]/10 to-[#9B51E0]/10 hover:from-[#00D2FF]/20 hover:to-[#9B51E0]/20 border border-zinc-700 rounded text-[10px] text-white font-medium select-none cursor-pointer transition-all whitespace-nowrap"
              >
                Vista Previa Al Instante
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => { onToggleFavorite(asset.id); showFeedback(asset.isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos'); }}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${asset.isFavorite ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' : 'bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:text-white'}`}
              >
                <Heart size={12} fill={asset.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button type="button" onClick={(e) => onDownload(e, asset)} className="p-1.5 rounded bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white cursor-pointer transition-colors">
                <Download size={12} />
              </button>
              <button type="button" onClick={() => { onDelete(asset.id); showFeedback('Archivo eliminado'); }} className="p-1.5 rounded bg-zinc-900/90 border border-zinc-700 hover:border-rose-500 hover:text-rose-500 text-zinc-400 cursor-pointer transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Acciones compactas para video/audio */}
        {(asset.type === 'video' || asset.type === 'audio') && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {asset.type === 'video' && (
              <button
                type="button"
                title="Extraer audio"
                onClick={(e) => { e.stopPropagation(); extractAudioFromVideo(asset, showFeedback); }}
                className="p-1.5 rounded-lg bg-black/70 border border-white/10 text-[#9B51E0] hover:text-white cursor-pointer transition-colors backdrop-blur-sm"
              >
                <Scissors size={11} />
              </button>
            )}
            <button type="button" onClick={(e) => onDownload(e, asset)} className="p-1.5 rounded-lg bg-black/70 border border-white/10 text-zinc-300 hover:text-white cursor-pointer transition-colors backdrop-blur-sm">
              <Download size={11} />
            </button>
            <button type="button" onClick={() => { onDelete(asset.id); showFeedback('Archivo eliminado'); }} className="p-1.5 rounded-lg bg-black/70 border border-white/10 text-zinc-300 hover:text-rose-400 cursor-pointer transition-colors backdrop-blur-sm">
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* ── INFO FOOTER ── */}
      <div
        className={`p-3 border-t cursor-pointer transition-colors duration-200 ${
          isLight
            ? 'bg-[#E2E2EA] border-[#CECED8] group-hover:bg-[#D8D8E0]'
            : 'bg-zinc-900/35 border-zinc-900/80 group-hover:bg-[#161616]'
        }`}
        onClick={() => asset.type !== 'video' && asset.type !== 'audio' && onPreview(asset)}
      >
        <h4 className={`text-[11px] font-semibold line-clamp-1 transition-colors ${isLight ? 'text-zinc-700 group-hover:text-zinc-900' : 'text-zinc-300 group-hover:text-white'}`}>
          {asset.title}
        </h4>
        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-1">
          <span className="uppercase">
            {asset.type === 'image' ? 'imagen' : asset.type === 'video' ? 'video' : asset.type === 'audio' ? 'audio' : asset.type === 'template' ? 'plantilla' : 'exportación'}
          </span>
          <span>{asset.size}</span>
        </div>
      </div>
    </div>
  );
}
