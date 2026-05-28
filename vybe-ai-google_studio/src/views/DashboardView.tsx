/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Image, Video, Upload, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Project, ActiveSection } from '../types';
import { motion } from 'motion/react';

interface DashboardViewProps {
  onNavigate: (section: ActiveSection) => void;
  onSelectProject: (project: Project) => void;
  projects: Project[];
}

export default function DashboardView({
  onNavigate,
  onSelectProject,
  projects
}: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-8 p-6 overflow-y-auto h-full w-full" id="dashboard-container">
      
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-950/20 border border-zinc-800/40 p-8 sm:p-10 overflow-hidden bg-grid-pattern flex flex-col justify-center min-h-[220px]">
        {/* Accent light flare */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-b from-[#00D2FF]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#00D2FF] bg-[#00D2FF]/10 border border-[#00D2FF]/20 px-2.5 py-0.5 rounded-full mb-3.5 uppercase">
            <Sparkles size={10} className="text-[#00D2FF] animate-pulse" /> Creative Engine Synchronized
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight mb-3">
            Welcome back, Adrian. <br />
            <span className="text-zinc-400">Continue creating with AI.</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mb-6 leading-relaxed">
            Create magnificent photography and cinema in pure silence. Let our invisible intelligence layers refine and render your content to absolute perfection.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('photo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(0,210,255,0.2)] active:scale-95 cursor-pointer"
              id="quick-nav-photo"
            >
              <Image size={14} />
              <span>New Image</span>
            </button>
            <button
              onClick={() => onNavigate('video')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#121212] hover:bg-[#161616] text-white border border-zinc-800/80 transition-all duration-300 ease-in-out active:scale-95 cursor-pointer"
              id="quick-nav-video"
            >
              <Video size={14} className="text-[#9B51E0]" />
              <span>New Video</span>
            </button>
            <button
              onClick={() => onNavigate('assets')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#121212] hover:bg-[#161616] text-white border border-zinc-800/80 transition-all duration-300 ease-in-out active:scale-95 cursor-pointer"
              id="quick-nav-assets"
            >
              <Upload size={14} className="text-[#00D2FF]" />
              <span>Upload Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Recent Creations</h2>
            <p className="text-xs text-zinc-500">Tap any asset to trigger review, export, or publish flow</p>
          </div>
          <button 
            onClick={() => onNavigate('assets')}
            className="text-xs text-zinc-400 hover:text-[#00D2FF] font-mono flex items-center gap-1 transition-colors duration-300 ease-in-out cursor-pointer"
            id="view-all-assets-btn"
          >
            See All Assets <ChevronRight size={14} />
          </button>
        </div>

        {/* Cinematographic Grid of recent projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="recent-creations-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group relative flex flex-col bg-[#121212] hover:bg-[#161616] border border-zinc-800/40 hover:border-zinc-700/60 duration-300 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl"
              id={`project-card-${project.id}`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Format Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono tracking-wider text-white bg-black/65 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 uppercase">
                    {project.format}
                  </span>
                </div>

                {/* Hover Play/Render Icon Indicator overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="px-4 py-2 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-xl transition-all duration-300 ease-in-out active:scale-95">
                    <span>Export / Publish</span>
                    <ArrowUpRight size={13} className="text-[#00D2FF]" />
                  </div>
                </div>
              </div>

              {/* metadata description */}
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
                  <span className="text-[9px] text-zinc-500 font-mono">{project.timestamp}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                    project.status === 'Approved'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
