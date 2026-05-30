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
      <div className="relative py-6 sm:py-8 flex flex-col justify-center min-h-[180px]" id="dashboard-hero">
        {/* Accent light flare */}
        <div className="absolute top-0 left-0 w-80 h-32 bg-gradient-to-b from-[#00D2FF]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block font-mono">
            STUDIO
          </span>
          <h1 className="text-3xl sm:text-[40px] font-semibold text-white tracking-tight leading-[1.2] mb-6">
            Welcome back, Adrian. <br />
            <span className="text-zinc-500 font-normal">Continue creating with </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] font-bold">
              AI
            </span>
            <span className="text-white font-bold">.</span>
          </h1>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("photo")}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-black hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-[0_4px_20px_rgba(0,210,255,0.15)]"
              id="quick-nav-photo"
            >
              <Sparkles size={14} className="text-black" />
              <span>New Image</span>
            </button>
            <button
              onClick={() => onNavigate("video")}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-black hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-[0_4px_20px_rgba(0,210,255,0.15)]"
              id="quick-nav-video"
            >
              <Film size={14} className="text-black" />
              <span>New Video</span>
            </button>
            <button
              onClick={() => onNavigate("assets")}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold bg-zinc-900/60 hover:bg-zinc-900 text-white border border-zinc-800/80 transition-all active:scale-95 cursor-pointer"
              id="quick-nav-assets"
            >
              <Upload size={14} className="text-white" />
              <span>Upload Asset</span>
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
