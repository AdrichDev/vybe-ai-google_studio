import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface ProviderSelectorProps {
  provider: 'google' | 'openai' | 'huggingface';
  onChange: (provider: 'google' | 'openai' | 'huggingface') => void;
  idPrefix?: string;
  apiKeys?: { google: string; openai: string; huggingface: string };
  theme?: string;
}

export default function ProviderSelector({
  provider,
  onChange,
  idPrefix = 'provider',
  apiKeys,
  theme = 'dark',
}: ProviderSelectorProps) {
  const googleHasKey = apiKeys ? Boolean(apiKeys.google) : true;
  const openaiHasKey = apiKeys ? Boolean(apiKeys.openai) : true;
  const hfHasKey = apiKeys ? Boolean(apiKeys.huggingface) : true;

  const inactiveClass = theme === 'light'
    ? 'text-zinc-500 hover:text-zinc-700 hover:bg-[#D4D4DC]'
    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60';

  return (
    <div className="space-y-2 select-none" id={`${idPrefix}-engine-selector-container`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">PROVEEDOR DE MOTOR DE IA</span>
      <div
        className={`flex p-1 rounded-xl border w-full ${theme === 'light' ? 'bg-[#D4D4DC] border-[#C0C0CC]' : 'bg-zinc-900/80 border-zinc-800/60'}`}
        id={`${idPrefix}-selector`}
      >
        {[
          { id: 'google', label: 'Google AI', hasKey: googleHasKey },
          { id: 'openai', label: 'OpenAI', hasKey: openaiHasKey },
          { id: 'huggingface', label: 'FLUX.1', hasKey: hfHasKey },
        ].map(({ id, label, hasKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as 'google' | 'openai' | 'huggingface')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-in-out text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              provider === id
                ? 'bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white shadow-lg'
                : inactiveClass
            }`}
            id={`${idPrefix}-${id}`}
          >
            <span>{label}</span>
            {provider === id && (
              hasKey
                ? <Check size={11} className="text-emerald-300" />
                : <AlertTriangle size={11} className="text-amber-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
