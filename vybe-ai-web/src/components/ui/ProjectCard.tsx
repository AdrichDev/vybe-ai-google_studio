import React from 'react';
import { Project } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  key?: string | number;
  project: Project;
  onSelect: (project: Project) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative flex flex-col bg-[#121212] hover:bg-[#161616] border border-zinc-800/40 hover:border-zinc-700/60 duration-300 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl"
      id={`project-card-${project.id}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-3 left-3">
          <span className="text-[9px] font-mono tracking-wider text-white bg-black/65 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 uppercase">
            {project.format === 'Image' ? 'Imagen' : project.format === 'Video' ? 'Video' : 'Generado por Agente'}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="px-4 py-2 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-xl transition-all duration-300 ease-in-out active:scale-95">
            <span>Exportar / Publicar</span>
            <ArrowUpRight size={13} className="text-[#00D2FF]" />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-[#00D2FF] transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono line-clamp-1 italic">
            "{project.prompt}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80">
          <span className="text-[9px] text-zinc-500 font-mono">
            {project.timestamp === 'Just now' ? 'Ahora' : project.timestamp === '2 hours ago' ? 'Hace 2 horas' : project.timestamp === '1 day ago' ? 'Hace 1 día' : project.timestamp === '3 days ago' ? 'Hace 3 días' : project.timestamp}
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
            project.status === 'Approved'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20'
          }`}>
            {project.status === 'Approved' ? 'Aprobado' : project.status === 'Ready' ? 'Listo' : 'Procesando'}
          </span>
        </div>
      </div>
    </div>
  );
}
