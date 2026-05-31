/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Image, Video, Film, Upload, ChevronRight } from "lucide-react";
import { Project, ActiveSection } from "../types";
import ProjectCard from "../components/ui/ProjectCard";

interface DashboardViewProps {
  onNavigate: (section: ActiveSection) => void;
  onSelectProject: (project: Project) => void;
  projects: Project[];
  theme?: string;
}

export default function DashboardView({
  onNavigate,
  onSelectProject,
  projects,
  theme = "dark",
}: DashboardViewProps) {
  return (
    <div
      className="flex flex-col gap-8 p-6 overflow-y-auto h-full w-full"
      id="dashboard-container"
    >
      {/* Hero Section with adaptive Glassmorphism Card */}
      <div 
        className={`relative py-10 px-8 flex flex-col justify-center min-h-[220px] rounded-3xl border transition-all duration-300 ${
          theme === 'light'
            ? 'bg-white/70 border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] backdrop-blur-xl'
            : 'bg-zinc-950/40 border-zinc-900/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] backdrop-blur-md'
        }`} 
        id="dashboard-hero"
      >
        {/* Accent light flare (only for dark mode or custom touch in light) */}
        <div className={`absolute top-0 left-0 w-80 h-32 bg-gradient-to-b ${theme === 'light' ? 'from-amber-400/5' : 'from-[#00D2FF]/5'} to-transparent blur-3xl pointer-events-none`} />

        <div className="relative z-10 w-full">
          <span className={`text-[11px] sm:text-xs font-black ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-[0.25em] mb-4.5 block font-mono`}>
            ESTUDIO
          </span>
          <h1 className={`text-4xl sm:text-[48px] font-black ${theme === 'light' ? 'text-zinc-950' : 'text-white'} tracking-tight leading-[1.12] mb-7`}>
            Bienvenido de vuelta, Adrián. <br />
            <span className={theme === 'light' ? 'text-zinc-600 font-medium' : 'text-zinc-400 font-normal'}>Continúa creando con </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] font-black">
              IA
            </span>
            <span className={theme === 'light' ? 'text-zinc-950 font-black' : 'text-white font-black'}>.</span>
          </h1>

          {/* Quick Action Buttons with updated sizes */}
          <div className="flex flex-wrap gap-3.5">
            <button
              onClick={() => onNavigate("photo")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-extrabold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-black hover:shadow-[0_4px_25px_rgba(0,210,255,0.25)] hover:scale-[1.015] active:scale-95 transition-all duration-300 cursor-pointer"
              id="quick-nav-photo"
            >
              <Sparkles size={16} className="text-black" />
              <span>Nueva Imagen</span>
            </button>
            <button
              onClick={() => onNavigate("video")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-extrabold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-black hover:shadow-[0_4px_25px_rgba(0,210,255,0.25)] hover:scale-[1.015] active:scale-95 transition-all duration-300 cursor-pointer"
              id="quick-nav-video"
            >
              <Film size={16} className="text-black" />
              <span>Nuevo Video</span>
            </button>
            <button
              onClick={() => onNavigate("assets")}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-extrabold transition-all duration-300 hover:scale-[1.015] active:scale-95 cursor-pointer border ${
                theme === 'light'
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200/80'
                  : 'bg-zinc-900/60 hover:bg-zinc-900 text-white border-zinc-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
              }`}
              id="quick-nav-assets"
            >
              <Upload size={16} className={theme === 'light' ? 'text-zinc-900' : 'text-white'} />
              <span>Subir Recurso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-base sm:text-[17px] font-black ${theme === 'light' ? 'text-zinc-950' : 'text-white'} uppercase tracking-[0.2em] font-sans`}>
              Creaciones Recientes
            </h2>
            <p className={`text-xs ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'} mt-1`}>
              Seleccioná cualquier recurso para iniciar los flujos de revisión, exportación o publicación.
            </p>
          </div>
          <button
            onClick={() => onNavigate("assets")}
            className={`text-xs ${theme === 'light' ? 'text-zinc-500 hover:text-[#00D2FF]' : 'text-zinc-400 hover:text-[#00D2FF]'} font-extrabold flex items-center gap-1 transition-colors duration-300 ease-in-out cursor-pointer`}
            id="view-all-assets-btn"
          >
            Ver todos los recursos <ChevronRight size={14} />
          </button>
        </div>

        {/* Cinematographic Grid of recent projects */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className={`w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center ${theme === 'light' ? 'border-zinc-300 text-zinc-400' : 'border-zinc-800 text-zinc-600'}`}>
              <Image size={24} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>Sin creaciones todavía</p>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>Generá tu primera imagen o video para verlos aquí</p>
            </div>
            <button
              onClick={() => onNavigate("photo")}
              className="mt-2 text-xs font-semibold text-[#00D2FF] hover:underline cursor-pointer"
            >
              Ir al Estudio de Fotos →
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            id="recent-creations-grid"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={onSelectProject}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
