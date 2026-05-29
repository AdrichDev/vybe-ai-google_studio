/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Image, Video, Upload, ChevronRight } from "lucide-react";
import { Project, ActiveSection } from "../types";
import ProjectCard from "../components/ui/ProjectCard";

interface DashboardViewProps {
  onNavigate: (section: ActiveSection) => void;
  onSelectProject: (project: Project) => void;
  projects: Project[];
}

export default function DashboardView({
  onNavigate,
  onSelectProject,
  projects,
}: DashboardViewProps) {
  return (
    <div
      className="flex flex-col gap-8 p-6 overflow-y-auto h-full w-full"
      id="dashboard-container"
    >
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-950/20 border border-zinc-800/40 p-8 sm:p-10 overflow-hidden bg-grid-pattern flex flex-col justify-center min-h-[220px]">
        {/* Accent light flare */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-b from-[#00D2FF]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#00D2FF] bg-[#00D2FF]/10 border border-[#00D2FF]/20 px-2.5 py-0.5 rounded-full mb-3.5 uppercase">
            <Sparkles size={10} className="text-[#00D2FF] animate-pulse" />{" "}
            Motor Creativo Sincronizado
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-3">
            Te damos la bienvenida, Adrian. <br />
            <span className="text-zinc-400">Continúa creando con IA.</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mb-6 leading-relaxed">
            Crea fotografías y obras de cine magníficas en absoluto silencio.
            Deja que nuestras capas invisibles de inteligencia perfeccionen y
            rendericen tu contenido digital hasta la perfección absoluta.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("photo")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(0,210,255,0.2)] active:scale-95 cursor-pointer"
              id="quick-nav-photo"
            >
              <Image size={14} />
              <span>Nueva Imagen</span>
            </button>
            <button
              onClick={() => onNavigate("video")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#121212] hover:bg-[#161616] text-white border border-zinc-800/80 transition-all duration-300 ease-in-out active:scale-95 cursor-pointer"
              id="quick-nav-video"
            >
              <Video size={14} className="text-[#9B51E0]" />
              <span>Nuevo Video</span>
            </button>
            <button
              onClick={() => onNavigate("assets")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#121212] hover:bg-[#161616] text-white border border-zinc-800/80 transition-all duration-300 ease-in-out active:scale-95 cursor-pointer"
              id="quick-nav-assets"
            >
              <Upload size={14} className="text-[#00D2FF]" />
              <span>Subir Recurso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Creaciones Recientes
            </h2>
            <p className="text-xs text-zinc-500">
              Pulsa en cualquier recurso para iniciar el flujo de revisión,
              exportación o publicación
            </p>
          </div>
          <button
            onClick={() => onNavigate("assets")}
            className="text-xs text-zinc-400 hover:text-[#00D2FF] font-mono flex items-center gap-1 transition-colors duration-300 ease-in-out cursor-pointer"
            id="view-all-assets-btn"
          >
            Ver todos los recursos <ChevronRight size={14} />
          </button>
        </div>

        {/* Cinematographic Grid of recent projects */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          id="recent-creations-grid"
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
