/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Image,
  Film,
  Folder,
  Settings,
  Bell,
  Sparkles,
  HelpCircle,
  Search,
  Command,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { ActiveSection, Project, Asset, ActivityLog } from "./types";
import { INITIAL_PROJECTS, INITIAL_ASSETS, INITIAL_LOGS } from "./data";

import DashboardView from "./views/DashboardView";
import PhotoStudioView from "./views/PhotoStudioView";
import VideoStudioView from "./views/VideoStudioView";
import AssetsView from "./views/AssetsView";
import SettingsView from "./views/SettingsView";
import ExportModal from "./components/ExportModal";

export default function App() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Theme state with local storage persistence
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("vybe_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vybe_theme", theme);
    } catch (e) {
      console.error("Failed to save theme state", e);
    }
  }, [theme]);

  // Contextual AI Providers State
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const savedGoogle = localStorage.getItem("vybe_api_key_google") || "";
      const savedOpenai = localStorage.getItem("vybe_api_key_openai") || "";
      const savedHf = localStorage.getItem("vybe_api_key_huggingface") || "";
      return {
        google: savedGoogle,
        openai: savedOpenai,
        huggingface: savedHf,
      };
    } catch {
      return { google: "", openai: "", huggingface: "" };
    }
  });

  // Persist keys to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem("vybe_api_key_google", apiKeys.google);
      localStorage.setItem("vybe_api_key_openai", apiKeys.openai);
      localStorage.setItem("vybe_api_key_huggingface", apiKeys.huggingface);
    } catch (e) {
      console.error("Failed to save API keys to localStorage", e);
    }
  }, [apiKeys]);
  const [photoProvider, setPhotoProvider] = useState<"google" | "openai" | "huggingface">(
    "google",
  );
  const [videoProvider, setVideoProvider] = useState<"google" | "openai" | "huggingface">(
    "google",
  );

  // High fidelity local state hub
  const [projects, setProjects] = useState<Project[]>([]);
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
    title: "Cyberpunk Vanguard - Editorial Noir",
    type: "Image",
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    prompt: "",
  });

  // Navigation click trigger
  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
  };

  // Add project state triggered from workspaces
  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);

    // Auto-create corresponding digital asset mirror
    const newAsset: Asset = {
      id: `a-gen-${Date.now()}`,
      title: newProject.title + " Master",
      type: newProject.format === "Video" ? "video" : "image",
      url: newProject.image,
      ratio: newProject.ratio || (newProject.format === "Video" ? "9:16" : "1:1"),
      size: newProject.format === "Video" ? "185.0 MB" : "34.2 MB",
      isFavorite: false,
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  // Asset interaction support
  const handleToggleFavorite = (id: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)),
    );
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Launch human-in-the-loop modal
  const handleOpenExport = (project: Project | Asset) => {
    setSelectedAssetForExport({
      title: project.title,
      type: ("format" in project ? project.format : project.type) || "Image",
      image:
        ("image" in project ? project.image : project.url) ||
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      prompt: ("prompt" in project ? project.prompt : "") || "",
    });
    setExportModalOpen(true);
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col ${theme === 'light' ? 'bg-[#E5E5EC] text-zinc-900' : 'bg-[#0A0A0A] text-white'} font-sans overflow-hidden antialiased select-none`}
      id="vybe-ai-root"
    >
      {/* 1. TOPBAR LAYOUT */}
      <header
        className={`h-[64px] ${theme === 'light' ? 'bg-[#DCDCE4] border-[#CECED8] text-zinc-900' : 'bg-[#121212]/30 border-zinc-900/60 text-white'} border-b px-6 flex items-center justify-between flex-shrink-0 z-40 backdrop-blur-sm`}
        id="vybe-topbar"
      >
        {/* Left branding logo assembly */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className={`text-base font-black tracking-widest bg-gradient-to-r ${theme === 'light' ? 'from-zinc-800 to-zinc-500' : 'from-white via-zinc-200 to-zinc-400'} bg-clip-text text-transparent font-sans`}>
              VYBE AI
            </span>
            <span className={`block text-[10px] font-bold ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-widest leading-none mt-0.5 font-mono`}>
              Estudio Creativo de IA
            </span>
          </div>
        </div>

        {/* Center premium command search bar */}
        <div className={`hidden md:flex items-center gap-2 ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 hover:border-zinc-300' : 'bg-zinc-900/50 border-zinc-900 hover:border-zinc-800'} border rounded-xl px-4 py-2 w-[340px] transition-colors cursor-pointer select-none`}>
          <Search size={14} className={theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} />
          <span className={`text-xs ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} flex-1 text-left`}>
            Buscar recursos, agentes o prompts...
          </span>
          <div className={`flex items-center gap-1 ${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'} border rounded px-1.5 py-0.5 text-[9px] font-mono`}>
            <Command size={10} />K
          </div>
        </div>

        {/* Right action badges & premium profile avatar */}
        <div className="flex items-center gap-4">
          {/* Pulsing AI active badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono text-emerald-500 animate-pulse">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span>AGENTES DE IA ACTIVOS</span>
          </div>

          {/* Icon trigger */}
          <button
            className={`${theme === 'light' ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'} relative p-1.5 rounded-lg cursor-pointer transition-all`}
            id="bell-notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00D2FF] rounded-full" />
          </button>

          {/* User Info Avatar */}
          <div className={`flex items-center gap-2.5 ${theme === 'light' ? 'border-zinc-200' : 'border-zinc-900'} border-l pl-4`}>
            <div className="text-right hidden sm:block">
              <span className={`block text-xs font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} leading-tight`}>
                Adrián Reyes
              </span>
              <span className={`block text-[9px] font-mono ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-widest`}>
                Socio Premium
              </span>
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
      <div
        className="flex-1 flex min-h-0 relative z-30"
        id="vybe-workspace-container"
      >
        {/* SIDEBAR LATERAL: Slim Compact Premium Dark Menu */}
        <aside
          className={`${sidebarCollapsed ? 'w-[64px]' : 'w-[240px]'} ${theme === 'light' ? 'bg-[#D8D8E0] border-r border-[#CECED8]' : 'bg-[#121212]/30 border-r border-zinc-900/60'} p-4 flex flex-col justify-between flex-shrink-0 z-40 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden`}
          id="vybe-sidebar"
        >
          <div className="flex flex-col gap-6">
            {/* Category header + collapse toggle */}
            <div className="px-1 select-none flex items-center justify-between">
              {!sidebarCollapsed && (
                <span className={`text-xs font-black ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} uppercase tracking-[0.25em] font-mono`}>
                  ESPACIO DE TRABAJO
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(v => !v)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'light' ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60'} ${sidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
                title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                id="sidebar-collapse-toggle"
              >
                {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </div>

            {/* Sidebar Nav Buttons */}
            <nav className="flex flex-col gap-1.5" id="sidebar-navigation">
              {[
                { id: "dashboard", label: "Panel de Control", icon: LayoutGrid },
                { id: "photo", label: "Estudio de Fotos", icon: Image },
                { id: "video", label: "Estudio de Video", icon: Film },
                { id: "assets", label: "Recursos", icon: Folder },
                { id: "settings", label: "Ajustes", icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as ActiveSection)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`group relative w-full flex items-center gap-3.5 transition-all duration-300 ease-in-out cursor-pointer rounded-xl text-[13px] sm:text-sm font-bold tracking-wide
                      ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-4 py-3'}
                      ${isActive
                        ? theme === 'light'
                          ? "bg-white text-zinc-950 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-zinc-200"
                          : "bg-zinc-900/60 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] border border-zinc-800/20"
                        : theme === 'light'
                          ? "text-zinc-500 hover:text-[#9B51E0] hover:bg-[#9B51E0]/8 border border-transparent hover:border-[#9B51E0]/20"
                          : "text-zinc-500 hover:text-[#9B51E0] hover:bg-[#9B51E0]/10 border border-transparent hover:border-[#9B51E0]/20"
                      }`}
                    id={`sidebar-link-${item.id}`}
                  >
                    <IconComp
                      size={sidebarCollapsed ? 18 : 15}
                      className={`transition-colors duration-200 flex-shrink-0 ${
                        isActive
                          ? theme === 'light' ? 'text-zinc-950' : 'text-[#9B51E0]'
                          : 'text-zinc-500 group-hover:text-[#9B51E0]'
                      }`}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}

                    {/* High Contrast Left-Edge Active Stripe Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-gradient-to-b from-[#00D2FF] to-[#9B51E0] pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help & Theme Toggle Indicator block */}
          <div className={`border-t ${theme === 'light' ? 'border-zinc-200' : 'border-zinc-900/80'} pt-4 flex flex-col gap-1`}>
            <button
              onClick={() => handleNavigate("settings")}
              title={sidebarCollapsed ? "Guía y Ayuda" : undefined}
              className={`group w-full flex items-center gap-3.5 rounded-xl text-[13px] sm:text-sm font-bold transition-all duration-300 ease-in-out cursor-pointer border border-transparent hover:text-[#9B51E0] hover:bg-[#9B51E0]/10 hover:border-[#9B51E0]/20 text-zinc-500
                ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-4 py-3'}`}
              id="help-guide-trigger"
            >
              <HelpCircle size={sidebarCollapsed ? 18 : 15} className="flex-shrink-0 group-hover:text-[#9B51E0] transition-colors duration-200" />
              {!sidebarCollapsed && <span>Guía y Ayuda</span>}
            </button>

            {/* Sun/Moon Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={sidebarCollapsed ? (theme === 'light' ? 'Modo Oscuro' : 'Modo Claro') : undefined}
              className={`group w-full flex items-center gap-3.5 rounded-xl text-[13px] sm:text-sm font-bold transition-all duration-300 ease-in-out cursor-pointer border border-transparent hover:text-[#9B51E0] hover:bg-[#9B51E0]/10 hover:border-[#9B51E0]/20 text-zinc-500
                ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-4 py-3'}`}
              id="theme-toggle-btn"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={15} className="text-indigo-500 group-hover:text-indigo-700 flex-shrink-0" />
                  {!sidebarCollapsed && <span>Modo Oscuro</span>}
                </>
              ) : (
                <>
                  <Sun size={15} className="text-amber-400 group-hover:text-amber-500 flex-shrink-0 animate-spin-slow" />
                  {!sidebarCollapsed && <span>Modo Claro</span>}
                </>
              )}
            </button>
          </div>
        </aside>

        {/* 3. MAIN RENDER CONTENT AREA */}
        <main
          className={`flex-1 ${theme === 'light' ? 'bg-[#E5E5EC]' : 'bg-[#0A0A0A]'} overflow-y-auto relative z-10 flex flex-col`}
          id="vybe-main-content"
        >
          <div className="flex-1 min-h-0 flex flex-col">
            {activeSection === "dashboard" && (
              <DashboardView
                onNavigate={handleNavigate}
                onSelectProject={handleOpenExport}
                projects={projects}
                theme={theme}
              />
            )}

            {activeSection === "photo" && (
              <PhotoStudioView
                onAddProject={handleAddProject}
                onOpenExportModal={handleOpenExport}
                photoProvider={photoProvider}
                setPhotoProvider={setPhotoProvider}
                apiKeys={apiKeys}
                onNavigate={handleNavigate}
                onAddAsset={(newAsset) =>
                  setAssets((prev) => [newAsset, ...prev])
                }
                theme={theme}
              />
            )}

            {activeSection === "video" && (
              <VideoStudioView
                onAddProject={handleAddProject}
                onOpenExportModal={handleOpenExport}
                videoProvider={videoProvider}
                setVideoProvider={setVideoProvider}
                apiKeys={apiKeys}
                onNavigate={handleNavigate}
                onAddAsset={(newAsset) =>
                  setAssets((prev) => [newAsset, ...prev])
                }
                theme={theme}
              />
            )}

            {activeSection === "assets" && (
              <AssetsView
                assets={assets}
                onToggleFavorite={handleToggleFavorite}
                onDeleteAsset={handleDeleteAsset}
                onOpenExportModal={handleOpenExport}
                onNavigate={handleNavigate}
                onAddAsset={(newAsset) =>
                  setAssets((prev) => [newAsset, ...prev])
                }
                theme={theme}
              />
            )}

            {activeSection === "settings" && (
              <SettingsView apiKeys={apiKeys} setApiKeys={setApiKeys} theme={theme} />
            )}
          </div>
        </main>
      </div>

      {/* 4. BOTTOM STATUS BAR */}
      <footer
        className="h-[28px] bg-[#121212]/30 border-t border-zinc-900/60 px-6 flex items-center justify-between text-[10px] font-mono select-none z-40 flex-shrink-0"
        id="vybe-footer"
      >
        {/* Left indicators */}
        <div className="flex items-center gap-4 text-zinc-500">
          <div
            className="flex items-center gap-1.5"
            id="cluster-connection-tag"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Clúster de IA: Conectado</span>
          </div>
          <span className="text-zinc-800">•</span>
          <span>Veo 3.1 y GPT-5.5 Listos</span>
          <span className="text-zinc-800">•</span>
          <span>Marco de área de trabajo máxima permitida: 100vh Fijo</span>
        </div>
      </footer>

      {/* 5. MULTI-MODEL SOCIAL EXPORT MODAL POPUP */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        assetTitle={selectedAssetForExport.title}
        assetType={selectedAssetForExport.type as "Image" | "Video" | "AI Agent-Generated" | "image" | "video" | "audio" | "template"}
        imageUrl={selectedAssetForExport.image}
        defaultPrompt={selectedAssetForExport.prompt}
      />
    </div>
  );
}
