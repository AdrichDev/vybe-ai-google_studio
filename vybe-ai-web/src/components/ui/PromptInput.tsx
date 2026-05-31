import React, { useRef, useState } from 'react';
import { Mic, MicOff, AlertTriangle, Loader2 } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  provider: 'google' | 'openai' | 'huggingface';
  hasApiKey: boolean;
  onLoadTestPrompt: () => Promise<void> | void;
  isLoadingTestPrompt?: boolean;
  idPrefix?: string;
  onNavigateSettings?: () => void;
  theme?: string;
}

const SpeechRecognitionAPI =
  (typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

export default function PromptInput({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  provider,
  hasApiKey,
  onLoadTestPrompt,
  isLoadingTestPrompt = false,
  idPrefix = 'prompt',
  onNavigateSettings,
  theme = 'dark',
}: PromptInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const generatingText =
    provider === 'google'
      ? 'Procesando vía Google AI...'
      : provider === 'openai'
        ? 'Procesando vía OpenAI...'
        : 'Procesando vía FLUX.1 (HF)...';

  const handleMicClick = () => {
    setMicError(null);

    if (!SpeechRecognitionAPI) {
      setMicError('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      const msg =
        event.error === 'not-allowed'
          ? 'Permiso de micrófono denegado. Habilitalo en la configuración del navegador.'
          : event.error === 'no-speech'
            ? 'No se detectó audio. Intentá hablar más cerca del micrófono.'
            : event.error === 'network'
              ? 'Error de red: Web Speech API requiere conexión a internet y Chrome. Si usás una IP local, abrí la app desde localhost.'
              : event.error === 'aborted'
                ? null // cierre manual, no es error
                : `Error de voz: ${event.error}`;
      if (msg) setMicError(msg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="mt-4" id={`${idPrefix}-prompt-panel`}>
      <div
        className={`relative flex items-center ${
          theme === 'light'
            ? 'bg-zinc-50 border-zinc-200 focus-within:border-zinc-300'
            : 'bg-zinc-900/60 border-zinc-800/85 focus-within:border-zinc-700'
        } border p-1 rounded-xl transition-all duration-300`}
      >
        {/* Micrófono — Web Speech API real */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isGenerating}
          className={`p-3.5 rounded-lg transition-all duration-300 flex items-center justify-center relative select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-xl animate-pulse'
              : !SpeechRecognitionAPI
                ? theme === 'light' ? 'text-zinc-300' : 'text-zinc-700'
                : theme === 'light'
                  ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
          title={
            !SpeechRecognitionAPI
              ? 'Tu navegador no soporta reconocimiento de voz'
              : isListening
                ? 'Detener escucha'
                : 'Activar micrófono'
          }
          id={`${idPrefix}-voice-trigger`}
        >
          {!SpeechRecognitionAPI ? <MicOff size={15} /> : <Mic size={15} className={isListening ? 'scale-110' : ''} />}
          {isListening && (
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] animate-ping opacity-25 z-[-1]" />
          )}
        </button>

        <input
          type="text"
          value={isListening ? 'Escuchando...' : prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            provider === 'google'
              ? 'Describí lo que querés que Google AI cree o edite...'
              : provider === 'openai'
                ? 'Describí lo que querés que OpenAI cree o edite...'
                : 'Describí lo que querés que Hugging Face genere...'
          }
          disabled={isGenerating || isListening}
          className={`flex-1 bg-transparent text-xs ${
            theme === 'light' ? 'text-zinc-900 placeholder-zinc-400' : 'text-zinc-200 placeholder-zinc-500'
          } py-3.5 px-4 focus:outline-none disabled:opacity-60 font-sans`}
          id={`${idPrefix}-prompt-input`}
          onKeyDown={(e) => { if (e.key === 'Enter') onGenerate(); }}
        />

        {isListening ? (
          <div className="flex items-center gap-1 px-4 text-xs font-mono text-[#00D2FF]">
            <span className="w-1 bg-[#00D2FF] h-4 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-[#9B51E0] h-6 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-[#00D2FF] h-3 rounded animate-bounce" style={{ animationDelay: '0.5s' }} />
            <span className="text-[10px] ml-1 tracking-widest">Escuchando...</span>
          </div>
        ) : isGenerating ? (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
            theme === 'light' ? 'bg-zinc-200 text-zinc-650' : 'bg-zinc-800 text-zinc-400'
          } text-xs font-semibold whitespace-nowrap`}>
            <div className={`w-3 h-3 rounded-full border-2 ${theme === 'light' ? 'border-zinc-350' : 'border-zinc-600'} border-t-[#00D2FF] animate-spin`} />
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
            <span>Configurá API Key</span>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center px-1.5 mt-2">
        {micError ? (
          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <AlertTriangle size={10} /> {micError}
          </span>
        ) : (
          <span className={`text-[10px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'} font-mono`}>
            {isGenerating
              ? `${provider === 'google' ? '● Google AI Studio' : provider === 'openai' ? '● OpenAI API' : '● Hugging Face (FLUX)'} — procesando`
              : isListening
                ? '● Micrófono activo — hablá ahora'
                : 'Ingresá un prompt o cargá uno de prueba'}
          </span>
        )}

        <button
          type="button"
          disabled={isLoadingTestPrompt || isGenerating}
          onClick={() => onLoadTestPrompt()}
          className={`text-[10px] font-mono transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            theme === 'light' ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'
          }`}
          id={`${idPrefix}-load-test-prompt-btn`}
        >
          {isLoadingTestPrompt && <Loader2 size={10} className="animate-spin" />}
          Cargar prompt de prueba
        </button>
      </div>
    </div>
  );
}
