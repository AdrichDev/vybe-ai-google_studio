import React, { useRef } from 'react';
import { LucideIcon, Upload } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  title: string;
  subtitle: string;
  accept?: string;
  icon?: LucideIcon;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  id?: string;
  innerId?: string;
  theme?: string;
}

export default function UploadDropzone({
  onFileSelect,
  title,
  subtitle,
  accept = 'image/*',
  icon: Icon = Upload,
  isDragging,
  setIsDragging,
  id,
  innerId,
  theme = 'dark',
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-2" id={id}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2 ${
          isDragging
            ? 'border-[#00D2FF] bg-[#00D2FF]/5 shadow-[0_0_15px_rgba(0,210,255,0.1)]'
            : theme === 'light'
              ? 'border-[#C8C8D0] bg-[#E2E2EA] hover:border-[#AEAEBB] hover:bg-[#DCDCE4]'
              : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-600'
        }`}
        id={innerId}
      >
        <div className={`p-2 rounded-lg transition-colors group-hover:bg-[#00D2FF]/10 ${
          theme === 'light' ? 'bg-[#D4D4DC]' : 'bg-zinc-900'
        }`}>
          <Icon size={14} className="text-zinc-400 group-hover:text-[#00D2FF]" />
        </div>
        <div>
          <h4 className={`text-[11px] font-semibold ${theme === 'light' ? 'text-zinc-700' : 'text-white'}`}>{title}</h4>
          <p className="text-[9px] text-zinc-500 font-mono mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
