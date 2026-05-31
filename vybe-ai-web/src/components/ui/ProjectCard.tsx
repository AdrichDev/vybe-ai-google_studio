import React from 'react';
import { Project } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  key?: string | number;
  project: Project;
  onSelect: (project: Project) => void;
  theme?: string;
}

export default function ProjectCard({ project, onSelect, theme = "dark" }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project)}
      className={`group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.015] rounded-2xl border ${
        theme === 'light'
          ? 'bg-white/80 border-zinc-200/80 hover:border-zinc-350 hover:bg-white/95 hover:backdrop-blur-xl hover:shadow-[0_12px_35px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.015),0_20px_45px_rgba(0,0,0,0.05)]'
          : 'bg-[#121212]/90 border-zinc-800/40 hover:border-white/20 hover:bg-white/[0.03] hover:backdrop-blur-xl hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.75)]'
      }`}
      id={`project-card-${project.id}`}
    >
      {/* Specular Gloss Reflection Flare Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr ${
          theme === 'light'
            ? 'from-transparent via-white/[0.18] to-white/[0.35]'
            : 'from-transparent via-white/[0.01] to-white/[0.08]'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20`} 
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[11px] font-black font-mono tracking-wider text-white bg-black/65 px-2.5 py-0.5 rounded border border-white/10 uppercase">
            {project.format === 'Image' ? 'Imagen' : project.format === 'Video' ? 'Video' : 'Gen. de Agente'}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="px-5 py-2.5 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-xl transition-all duration-300 ease-in-out active:scale-95">
            <span>Exportar / Publicar</span>
            <ArrowUpRight size={13} className="text-[#00D2FF]" />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 gap-3.5">
        <div className="space-y-1.5">
          <h3 className={`text-base sm:text-[17px] font-black leading-tight transition-colors line-clamp-1 ${
            theme === 'light'
              ? 'text-zinc-900 group-hover:text-[#00D2FF]'
              : 'text-zinc-100 group-hover:text-[#00D2FF]'
          }`}>
            {project.title}
          </h3>
          <p className={`text-[12.5px] sm:text-xs font-mono line-clamp-1 italic ${
            theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            "{project.prompt}"
          </p>
        </div>

        <div className={`flex items-center justify-between pt-3 border-t ${
          theme === 'light' ? 'border-zinc-100' : 'border-zinc-900/80'
        }`}>
          <span className={`text-xs font-mono font-bold ${
            theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            {project.timestamp}
          </span>
          <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded border transition-all duration-300 ${
            project.status === 'Approved'
              ? theme === 'light'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : theme === 'light'
                ? 'text-[#0089A8] bg-[#00D2FF]/10 border-[#00D2FF]/20'
                : 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20'
          }`}>
            {project.status === 'Approved' ? 'Aprobado' : project.status === 'Ready' ? 'Listo' : 'Procesando'}
          </span>
        </div>
      </div>
    </div>
  );
}
