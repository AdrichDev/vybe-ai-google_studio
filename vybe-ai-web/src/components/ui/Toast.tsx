import React from 'react';
import { motion } from 'motion/react';

interface ToastProps {
  message: string;
  id?: string;
}

export default function Toast({ message, id }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      className="fixed bottom-16 right-6 z-50 bg-zinc-900/90 border border-[#00D2FF]/40 text-[#00D2FF] text-xs px-4.5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-mono"
      id={id}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping" />
      <span>{message}</span>
    </motion.div>
  );
}
