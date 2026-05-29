import React from 'react';

interface StatusIndicatorProps {
  label: string;
  className?: string;
  id?: string;
}

export default function StatusIndicator({
  label,
  className = '',
  id
}: StatusIndicatorProps) {
  return (
    <div 
      className={`inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono text-emerald-400 animate-pulse bg-gradient-to-r from-emerald-500/5 ${className}`}
      id={id}
    >
      <span className="w-1 h-1 rounded-full bg-emerald-400" />
      <span>{label}</span>
    </div>
  );
}
