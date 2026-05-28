/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, Camera, Film, FolderHeart, Settings2, 
  Bell, Sparkles, Cpu, HelpCircle, ArrowUpRight, Search, 
  Tv, Volume2, Command, Globe, FolderLock 
} from 'lucide-react';

import { ActiveSection, Project, Asset, ActivityLog } from './types';
import { INITIAL_PROJECTS, INITIAL_ASSETS, INITIAL_LOGS } from './data';

import DashboardView from './views/DashboardView';
import PhotoStudioView from './views/PhotoStudioView';
import VideoStudioView from './views/VideoStudioView';
import AssetsView from './views/AssetsView';
import SettingsView from './views/SettingsView';
import ExportModal from './components/ExportModal';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  
  // High fidelity local state hub
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [logs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedAssetForExport, setSelectedAssetForExport] = useState<{
    title: string;
    type: string;
    image: string;
    prompt?: string;
  }>({
    title: 'Cyberpunk Vanguard - Editorial Noir',
    type: 'Image',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    prompt: ''
  });

  // Navigation click trigger
  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
  };

  // Add project state triggered from workspaces
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    
    // Auto-create corresponding digital asset mirror
    const newAsset: Asset = {
      id: `a-gen-${Date.now()}`,
      title: newProject.title + ' Master',
      type: newProject.format === 'Video' ? 'video' : 'image',
      url: newProject.image,
      ratio: newProject.format === 'Video' ? '9:16' : '1:1',
      size: newProject.format === 'Video' ? '185.0 MB' : '34.2 MB',
      isFavorite: false
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  // Asset interaction support
  const handleToggleFavorite = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a));
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Launch human-in-the-loop modal
  const handleOpenExport = (project: any) => {
    setSelectedAssetForExport({
      title: project.title,
      type: project.format || project.type || 'Image',
      image: project.image || project.url || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      prompt: project.prompt || ''
    });
    setExportModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden antialiased select-none" id="vybe-ai-root">
      
      {/* 1. TOPBAR LAYOUT */}
      <header className="h-[64px] bg-[#121212]/30 border-b border-zinc-900/60 px-6 flex items-center justify-between flex-shrink-0 z-40 backdrop-blur-sm" id="vybe-topbar">
        {/* Left branding logo assembly */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-widest bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-sans">
              VYBE AI
            </span>
            <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-0.5">
              AI Creative Studio
            </span>
          </div>
        </div>

        {/* Center premium command search bar */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900/50 border border-zinc-900 hover:border-zinc-800 rounded-xl px-4 py-2 w-[340px] transition-colors cursor-pointer select-none">
          <Search size={14} className="text-zinc-500" />
          <span className="text-xs text-zinc-500 flex-1 text-left">
            Search assets, agents or prompts...
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">
            <Command size={10} />
            K
          </div>
        </div>

        {/* Right action badges & premium profile avatar */}
        <div className="flex items-center gap-4">
          
          {/* Pulsing AI active badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono text-emerald-400 animate-pulse bg-gradient-to-r from-emerald-500/5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>AI AGENTS ACTIVE</span>
          </div>

          {/* Icon trigger */}
          <button className="text-zinc-400 hover:text-white relative p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer transition-all" id="bell-notifications">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00D2FF] rounded-full" />
          </button>

          {/* User Info Avatar */}
          <div className="flex items-center gap-2.5 border-l border-zinc-900 pl-4">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-white leading-tight">Adrian Reyes</span>
              <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Premium Partner</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-zinc-800 overflow-hidden shadow-lg select-none">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Studio partner avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY PANELS WRAPPER */}
      <div className="flex-1 flex min-h-0 relative z-30" id="vybe-workspace-container">
        
        {/* SIDEBAR LATERAL: Slim Compact Premium Dark Menu */}
        <aside className="w-[72px] sm:w-[84px] bg-[#121212]/30 border-r border-zinc-900/60 p-3.5 flex flex-col justify-between flex-shrink-0 z-40 backdrop-blur-sm" id="vybe-sidebar">
          
          {/* Sidebar Nav Buttons */}
          <nav className="space-y-4" id="sidebar-navigation">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'photo', label: 'Photo Studio', icon: Camera },
              { id: 'video', label: 'Video Studio', icon: Film },
              { id: 'assets', label: 'Assets', icon: FolderHeart },
              { id: 'settings', label: 'Settings', icon: Settings2 }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as ActiveSection)}
                  title={item.label}
                  className={`group relative w-full aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-[#121212] to-zinc-900 text-[#00D2FF] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.6)] border border-zinc-800'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900/40 border border-transparent'
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  <IconComp size={18} className="transition-transform group-hover:scale-110 duration-200" />
                  <span className="text-[8px] font-sans font-medium tracking-tight mt-1 truncate max-w-full">
                    {item.label.split(' ')[0]}
                  </span>

                  {/* High Contrast Accent Indicator Dot */}
                  {isActive && (
                    <span className="absolute left-1.5 w-1 h-3 rounded-full bg-gradient-to-b from-[#00D2FF] to-[#9B51E0] pointer-events-none" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Help Indicator block */}
          <div className="text-center pt-4 border-t border-zinc-950">
            <button 
              onClick={() => handleNavigate('settings')}
              className="text-zinc-600 hover:text-zinc-400 p-2 rounded-lg hover:bg-zinc-950 cursor-pointer transition-colors"
              title="Information Guide"
              id="help-guide-trigger"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </aside>

        {/* 3. MAIN RENDER CONTENT AREA */}
        <main className="flex-1 bg-[#0A0A0A] overflow-y-auto relative z-10 flex flex-col" id="vybe-main-content">
          <div className="flex-1 min-h-0 flex flex-col">
            {activeSection === 'dashboard' && (
              <DashboardView 
                onNavigate={handleNavigate}
                onSelectProject={handleOpenExport}
                projects={projects}
              />
            )}
            
            {activeSection === 'photo' && (
              <PhotoStudioView 
                onAddProject={handleAddProject}
                onOpenExportModal={handleOpenExport}
              />
            )}

            {activeSection === 'video' && (
              <VideoStudioView 
                onAddProject={handleAddProject}
                onOpenExportModal={handleOpenExport}
              />
            )}

            {activeSection === 'assets' && (
              <AssetsView 
                assets={assets}
                onToggleFavorite={handleToggleFavorite}
                onDeleteAsset={handleDeleteAsset}
                onOpenExportModal={handleOpenExport}
                onNavigate={handleNavigate}
                onAddAsset={(newAsset) => setAssets(prev => [newAsset, ...prev])}
              />
            )}

            {activeSection === 'settings' && (
              <SettingsView />
            )}
          </div>
        </main>

      </div>

      {/* 4. BOTTOM STATUS BAR */}
      <footer className="h-[28px] bg-[#121212]/30 border-t border-zinc-900/60 px-6 flex items-center justify-between text-[10px] font-mono select-none z-40 flex-shrink-0" id="vybe-footer">
        {/* Left indicators */}
        <div className="flex items-center gap-4 text-zinc-500">
          <div className="flex items-center gap-1.5" id="cluster-connection-tag">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>AI Cluster: Connected</span>
          </div>
          <span className="text-zinc-800">•</span>
          <span>Veo 3.1 & GPT-5.5 Ready</span>
          <span className="text-zinc-800">•</span>
          <span>Workspace Frame Max Allowed: 100vh Fijo</span>
        </div>

        {/* Right loading indicator */}
        <div className="flex items-center gap-3 text-zinc-500">
          <span className="text-zinc-400">3 Pipelines Live</span>
          
          {/* Sliding Tailwind Progress Bar */}
          <div className="w-16 h-1 bg-zinc-950 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] rounded-full animate-flow-width" />
          </div>
        </div>
      </footer>

      {/* 5. MULTI-MODEL SOCIAL EXPORT MODAL POPUP */}
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        assetTitle={selectedAssetForExport.title}
        assetType={selectedAssetForExport.type as any}
        imageUrl={selectedAssetForExport.image}
        defaultPrompt={selectedAssetForExport.prompt}
      />

    </div>
  );
}
