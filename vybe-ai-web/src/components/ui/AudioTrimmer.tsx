import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Scissors } from "lucide-react";

interface AudioTrimmerProps {
  audioUrl: string;
  onTrimChange: (start: number, end: number) => void;
  theme?: string;
}

const BAR_COUNT = 80;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}

type DragTarget = "start" | "end" | "region" | "playhead" | null;

export default function AudioTrimmer({ audioUrl, onTrimChange, theme = "dark" }: AudioTrimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [waveform, setWaveform] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [startRatio, setStartRatio] = useState(0);
  const [endRatio, setEndRatio] = useState(1);
  const [playheadRatio, setPlayheadRatio] = useState(0);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRatios, setDragStartRatios] = useState({ start: 0, end: 1, playhead: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDecoding, setIsDecoding] = useState(true);

  // Decode audio and build waveform
  useEffect(() => {
    setIsDecoding(true);
    setStartRatio(0);
    setEndRatio(1);
    setPlayheadRatio(0);
    setIsPlaying(false);

    const ctx = new AudioContext();
    fetch(audioUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        setDuration(decoded.duration);
        const data = decoded.getChannelData(0);
        const step = Math.floor(data.length / BAR_COUNT);
        const bars: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          let max = 0;
          for (let j = 0; j < step; j++) {
            const v = Math.abs(data[i * step + j] ?? 0);
            if (v > max) max = v;
          }
          bars.push(max);
        }
        const peak = Math.max(...bars, 0.001);
        setWaveform(bars.map((b) => b / peak));
        setIsDecoding(false);
        onTrimChange(0, decoded.duration);
      })
      .catch(() => {
        const bars = Array.from({ length: BAR_COUNT }, () => 0.2 + Math.random() * 0.8);
        setWaveform(bars);
        setIsDecoding(false);
      })
      .finally(() => ctx.close());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Notify parent when trim changes
  useEffect(() => {
    if (duration > 0) {
      onTrimChange(startRatio * duration, endRatio * duration);
    }
  }, [startRatio, endRatio, duration, onTrimChange]);

  // Sync playhead from audio timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (duration > 0) setPlayheadRatio(audio.currentTime / duration);
      // Stop when reaching end of region
      if (audio.currentTime >= endRatio * duration) {
        audio.pause();
        setIsPlaying(false);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [endRatio, duration]);

  // Draw waveform + region + playhead
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isDark = theme !== "light";

    ctx.clearRect(0, 0, W, H);

    const barW = W / BAR_COUNT;
    const gap = Math.max(1, barW * 0.25);
    const actualBarW = barW - gap;

    // Draw bars
    for (let i = 0; i < waveform.length; i++) {
      const x = i * barW;
      const barH = Math.max(2, waveform[i] * (H - 4));
      const y = (H - barH) / 2;
      const ratio = i / BAR_COUNT;
      const inRegion = ratio >= startRatio && ratio < endRatio;

      if (inRegion) {
        ctx.fillStyle = "#00D2FF";
      } else {
        ctx.fillStyle = isDark ? "#3f3f46" : "#d4d4d8";
      }
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y, actualBarW, barH, 2);
      ctx.fill();
    }

    // Region tint
    const startX = startRatio * W;
    const endX = endRatio * W;
    ctx.fillStyle = "rgba(0, 210, 255, 0.06)";
    ctx.fillRect(startX, 0, endX - startX, H);

    // Playhead line
    if (duration > 0) {
      const px = playheadRatio * W;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(px, 2);
      ctx.lineTo(px, H - 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Playhead knob
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, H / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [waveform, startRatio, endRatio, playheadRatio, duration, theme]);

  const getRatioFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Determine what's being grabbed based on click position
  const getHitTarget = useCallback(
    (ratio: number): DragTarget => {
      const HANDLE_TOL = 0.025;
      if (Math.abs(ratio - startRatio) < HANDLE_TOL) return "start";
      if (Math.abs(ratio - endRatio) < HANDLE_TOL) return "end";
      if (Math.abs(ratio - playheadRatio) < HANDLE_TOL) return "playhead";
      if (ratio > startRatio && ratio < endRatio) return "region";
      return null;
    },
    [startRatio, endRatio, playheadRatio]
  );

  const seekAudio = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || duration === 0) return;
      const clamped = Math.max(startRatio, Math.min(endRatio, ratio));
      audio.currentTime = clamped * duration;
      setPlayheadRatio(clamped);
    },
    [duration, startRatio, endRatio]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const ratio = getRatioFromClientX(e.clientX);
      const target = getHitTarget(ratio);

      if (!target) {
        // Click on empty area — move nearest handle
        const distStart = Math.abs(ratio - startRatio);
        const distEnd = Math.abs(ratio - endRatio);
        if (distStart < distEnd) {
          setStartRatio(Math.min(ratio, endRatio - 0.02));
        } else {
          setEndRatio(Math.max(ratio, startRatio + 0.02));
        }
        return;
      }

      setDragging(target);
      setDragStartX(e.clientX);
      setDragStartRatios({ start: startRatio, end: endRatio, playhead: playheadRatio });
    },
    [getRatioFromClientX, getHitTarget, startRatio, endRatio, playheadRatio]
  );

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const delta = (e.clientX - dragStartX) / rect.width;

      if (dragging === "start") {
        const newStart = Math.max(0, Math.min(dragStartRatios.start + delta, dragStartRatios.end - 0.02));
        setStartRatio(newStart);
      } else if (dragging === "end") {
        const newEnd = Math.max(dragStartRatios.start + 0.02, Math.min(1, dragStartRatios.end + delta));
        setEndRatio(newEnd);
      } else if (dragging === "region") {
        const regionLen = dragStartRatios.end - dragStartRatios.start;
        const newStart = Math.max(0, Math.min(1 - regionLen, dragStartRatios.start + delta));
        setStartRatio(newStart);
        setEndRatio(newStart + regionLen);
      } else if (dragging === "playhead") {
        const newRatio = Math.max(0, Math.min(1, dragStartRatios.playhead + delta));
        setPlayheadRatio(newRatio);
        // Live seek while dragging
        const audio = audioRef.current;
        if (audio && duration > 0) {
          audio.currentTime = newRatio * duration;
        }
      }
    };

    const onUp = () => setDragging(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, dragStartX, dragStartRatios, duration]);

  // Playback toggle — starts from current playhead position
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // If playhead is at/past end, reset to start
      const currentPos = audio.currentTime;
      if (currentPos >= endRatio * duration || currentPos < startRatio * duration) {
        audio.currentTime = startRatio * duration;
        setPlayheadRatio(startRatio);
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  const isDark = theme !== "light";
  const startSecs = startRatio * duration;
  const endSecs = endRatio * duration;
  const trimSecs = endSecs - startSecs;
  const playheadSecs = playheadRatio * duration;

  return (
    <div className={`space-y-2 rounded-xl border p-3 ${isDark ? "border-zinc-800 bg-zinc-950" : "border-[#CECED8] bg-[#E8E8EE]"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scissors size={11} className="text-[#00D2FF]" />
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Recorte de Audio
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#00D2FF] font-black">
          {formatTime(trimSecs)}s seleccionados
        </span>
      </div>

      {isDecoding ? (
        <div className={`h-14 rounded-lg flex items-center justify-center ${isDark ? "bg-zinc-900" : "bg-[#DCDCE4]"}`}>
          <span className={`text-[9px] font-mono animate-pulse ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            Analizando audio...
          </span>
        </div>
      ) : (
        <>
          {/* Waveform — handles + playhead scrubable */}
          <div
            ref={containerRef}
            className={`relative h-14 select-none ${dragging === "playhead" ? "cursor-grabbing" : "cursor-pointer"}`}
            onMouseDown={handleMouseDown}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={56}
              className="w-full h-full rounded-lg"
            />

            {/* Start handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#00D2FF] cursor-ew-resize z-10 rounded-full"
              style={{ left: `calc(${startRatio * 100}% - 2px)` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00D2FF] border-2 border-white shadow-md pointer-events-none" />
            </div>

            {/* End handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#00D2FF] cursor-ew-resize z-10 rounded-full"
              style={{ left: `calc(${endRatio * 100}% - 2px)` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00D2FF] border-2 border-white shadow-md pointer-events-none" />
            </div>
          </div>

          {/* Time labels + play preview */}
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-mono tabular-nums ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              {formatTime(startSecs)} — {formatTime(endSecs)}
            </span>

            <button
              onClick={togglePlay}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-colors ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                  : "bg-[#DCDCE4] hover:bg-[#D0D0D8] border border-[#C8C8D0] text-zinc-700"
              } cursor-pointer`}
            >
              {isPlaying ? <Pause size={9} /> : <Play size={9} />}
              {formatTime(playheadSecs)}
            </button>

            <span className={`text-[9px] font-mono tabular-nums ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              {formatTime(duration)}
            </span>
          </div>
        </>
      )}

      <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />
    </div>
  );
}
