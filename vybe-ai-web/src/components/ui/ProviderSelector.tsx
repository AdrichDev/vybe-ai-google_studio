import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface ProviderSelectorProps {
  provider: 'google' | 'openai' | 'huggingface';
  onChange: (provider: 'google' | 'openai' | 'huggingface') => void;
  idPrefix?: string;
  apiKeys?: { google: string; openai: string; huggingface: string };
}

export default function ProviderSelector({
  provider,
  onChange,
  idPrefix = 'provider',
  apiKeys
}: ProviderSelectorProps) {
  const googleHasKey = apiKeys ? Boolean(apiKeys.google) : true;
  const openaiHasKey = apiKeys ? Boolean(apiKeys.openai) : true;
  const hfHasKey = apiKeys ? Boolean(apiKeys.huggingface) : true;

  return (
    <div className="space-y-2 select-none" id={`${idPrefix}-engine-selector-container`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">PROVEEDOR DE MOTOR DE IA</span>
      <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/60 w-full" id={`${idPrefix}-selector`}>
        <button
          type="button"
          onClick={() => onChange('google')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-in-out text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            provider === 'google'
              ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
          }`}
          id={`${idPrefix}-google`}
        >
          <span>Google AI</span>
          {provider === 'google' && (
            googleHasKey
              ? <Check size={11} className="text-emerald-300" />
              : <AlertTriangle size={11} className="text-amber-300" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange('openai')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-in-out text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            provider === 'openai'
              ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
          }`}
          id={`${idPrefix}-openai`}
        >
          <span>OpenAI</span>
          {provider === 'openai' && (
            openaiHasKey
              ? <Check size={11} className="text-emerald-300" />
              : <AlertTriangle size={11} className="text-amber-300" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange('huggingface')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-in-out text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            provider === 'huggingface'
              ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
          }`}
          id={`${idPrefix}-huggingface`}
        >
          <span>FLUX.1</span>
          {provider === 'huggingface' && (
            hfHasKey
              ? <Check size={11} className="text-emerald-300" />
              : <AlertTriangle size={11} className="text-amber-300" />
          )}
        </button>
      </div>
    </div>
  );
}
