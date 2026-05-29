import React, { useEffect, useState } from 'react';
import { Mic, AlertTriangle } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  provider: 'google' | 'openai' | 'huggingface';
  hasApiKey: boolean;
  onMicText: string;
  idPrefix?: string;
  presetPromptText?: string;
  presetLabel?: string;
  onNavigateSettings?: () => void;
}

export default function PromptInput({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  provider,
  hasApiKey,
  onMicText,
  idPrefix = 'prompt',
  presetPromptText = 'Extreme macro shot of high-fashion luxury sunglasses reflecting neon purple billboards, cinematic anamorphic look, 8k RAW master.',
  presetLabel = 'Cargar preset premium',
  onNavigateSettings
}: PromptInputProps) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isListening) {
      timer = setTimeout(() => {
        setIsListening(false);
        setPrompt(onMicText);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isListening, onMicText, setPrompt]);

  const generatingText = provider === 'google'
    ? 'Procesando vía Google AI...'
    : provider === 'openai' 
      ? 'Procesando vía OpenAI...'
      : 'Procesando vía FLUX.1 (HF)...';

  return (
    <div className="mt-4" id={`${idPrefix}-prompt-panel`}>
      <div className="relative flex items-center bg-zinc-900/60 border border-zinc-800/85 p-1 rounded-xl focus-within:border-zinc-700 transition-all duration-300">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`p-3.5 rounded-lg transition-all duration-300 flex items-center justify-center relative select-none cursor-pointer ${
            isListening 
              ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-xl animate-pulse' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
          title="Guía por Voz"
          id={`${idPrefix}-voice-activation-trigger`}
        >
          <Mic size={15} className={isListening ? 'scale-110' : ''} />
          {isListening && (
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-ping opacity-25 z-[-1]" />
          )}
        </button>

        <input
          type="text"
          value={isListening ? "Escuchando..." : prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={provider === 'google' ? "Describe lo que quieras que Google AI cree o edite..." : "Describe lo que quieras que OpenAI cree o edite..."}
          disabled={isGenerating || isListening}
          className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 py-3.5 px-4 focus:outline-none disabled:opacity-60 font-sans"
          id={`${idPrefix}-prompt-input`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onGenerate();
          }}
        />

        {isListening ? (
          <div className="flex items-center gap-1 px-4 text-xs font-mono text-[#00D2FF]">
            <span className="w-1 bg-[#00D2FF] h-4 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-[#9B51E0] h-6 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-[#00D2FF] h-3 rounded animate-bounce" style={{ animationDelay: '0.5s' }} />
            <span className="text-[10px] ml-1 tracking-widest">Escuchando...</span>
          </div>
        ) : isGenerating ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold whitespace-nowrap">
            <div className="w-3 h-3 rounded-full border-2 border-zinc-600 border-t-[#00D2FF] animate-spin" />
            <span>{generatingText}</span>
          </div>
        ) : hasApiKey ? (
          <button
            type="button"
            onClick={onGenerate}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 active:scale-95 whitespace-nowrap bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white cursor-pointer"
            id={`${idPrefix}-generate-btn`}
          >
            Generar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigateSettings?.()}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 active:scale-95 whitespace-nowrap bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 cursor-pointer flex items-center gap-1.5"
            id={`${idPrefix}-configure-key-btn`}
          >
            <AlertTriangle size={12} />
            <span>Configura API Key</span>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center px-1.5 mt-2">
        <span className="text-[10px] text-zinc-600 font-mono">
          {isGenerating
            ? `${provider === 'google' ? '● Google AI Studio' : provider === 'openai' ? '● OpenAI API' : '● Hugging Face (FLUX)'} — Motor de inferencia activo`
            : 'Canal de inferencia activo • Las ondas sonoras se procesan en segundo plano'}
        </span>
        <button
          onClick={() => setPrompt(presetPromptText)}
          className="text-[10px] text-zinc-500 hover:text-white cursor-pointer font-mono transition-colors"
        >
          {presetLabel}
        </button>
      </div>
    </div>
  );
}

