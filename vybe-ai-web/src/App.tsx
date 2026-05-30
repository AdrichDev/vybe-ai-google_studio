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
  Cpu,
  HelpCircle,
  ArrowUpRight,
  Search,
  Tv,
  Volume2,
  Command,
  Globe,
  FolderLock,
  ChevronLeft,
  ChevronRight,
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

  // Sidebar collapsed state with local storage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("vybe_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vybe_sidebar_collapsed", String(sidebarCollapsed));
    } catch (e) {
      console.error("Failed to save sidebar collapsed state", e);
    }
  }, [sidebarCollapsed]);

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
      ratio: newProject.format === "Video" ? "9:16" : "1:1",
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
  const handleOpenExport = (project: any) => {
    setSelectedAssetForExport({
      title: project.title,
      type: project.format || project.type || "Image",
      image:
        project.image ||
        project.url ||
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      prompt: project.prompt || "",
    });
    setExportModalOpen(true);
  };

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#0A0A0A] text-white font-sans overflow-hidden antialiased select-none"
      id="vybe-ai-root"
    >
      {/* 1. TOPBAR LAYOUT */}
      <header
        className="h-[64px] bg-[#121212]/30 border-b border-zinc-900/60 px-6 flex items-center justify-between flex-shrink-0 z-40 backdrop-blur-sm"
        id="vybe-topbar"
      >
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
            Buscar recursos, agentes o prompts...
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">
            <Command size={10} />K
          </div>
        </div>

        {/* Right action badges & premium profile avatar */}
        <div className="flex items-center gap-4">
          {/* Pulsing AI active badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono text-emerald-400 animate-pulse bg-gradient-to-r from-emerald-500/5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>AGENTES DE IA ACTIVOS</span>
          </div>

          {/* Icon trigger */}
          <button
            className="text-zinc-400 hover:text-white relative p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer transition-all"
            id="bell-notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00D2FF] rounded-full" />
          </button>

          {/* User Info Avatar */}
          <div className="flex items-center gap-2.5 border-l border-zinc-900 pl-4">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-white leading-tight">
                Adrian Reyes
              </span>
              <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
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
          className={`bg-[#121212]/30 border-r border-zinc-900/60 p-4 flex flex-col justify-between flex-shrink-0 z-40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-[76px] px-3" : "w-[240px]"
          }`}
          id="vybe-sidebar"
        >
          <div className="flex flex-col gap-6">
            {/* Category header "WORKSPACE" + Collapsible Toggle Tab */}
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-0" : "justify-between px-3"} mb-1 select-none`}>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] font-mono">
                  WORKSPACE
                </span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-500 hover:text-white transition-all duration-300 cursor-pointer ${
                  sidebarCollapsed ? "" : "ml-auto"
                }`}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                id="sidebar-toggle-btn"
              >
                {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            {/* Sidebar Nav Buttons */}
            <nav className="flex flex-col gap-1.5" id="sidebar-navigation">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
                { id: "photo", label: "Photo Studio", icon: Image },
                { id: "video", label: "Video Studio", icon: Film },
                { id: "assets", label: "Assets", icon: Folder },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as ActiveSection)}
                    className={`group relative w-full flex items-center ${
                      sidebarCollapsed ? "justify-center h-11 px-0" : "justify-start gap-3.5 px-4 py-3"
                    } rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ease-in-out cursor-pointer ${
                      isActive
                        ? "bg-zinc-900/60 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] border border-zinc-800/20"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/20 border border-transparent"
                    }`}
                    id={`sidebar-link-${item.id}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <IconComp
                      size={15}
                      className={`transition-colors duration-200 flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-zinc-600 group-hover:text-zinc-400"
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

          {/* Quick Help Indicator block */}
          <div className="border-t border-zinc-900/80 pt-4">
            <button
              onClick={() => handleNavigate("settings")}
              className={`group w-full flex items-center ${
                sidebarCollapsed ? "justify-center h-11 px-0" : "justify-start gap-3.5 px-4 py-3"
              } rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20 transition-all duration-300 ease-in-out cursor-pointer`}
              title="Information Guide"
              id="help-guide-trigger"
            >
              <HelpCircle size={15} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
              {!sidebarCollapsed && <span>Guide & Help</span>}
            </button>
          </div>
        </aside>

        {/* 3. MAIN RENDER CONTENT AREA */}
        <main
          className="flex-1 bg-[#0A0A0A] overflow-y-auto relative z-10 flex flex-col"
          id="vybe-main-content"
        >
          <div className="flex-1 min-h-0 flex flex-col">
            {activeSection === "dashboard" && (
              <DashboardView
                onNavigate={handleNavigate}
                onSelectProject={handleOpenExport}
                projects={projects}
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
              />
            )}

            {activeSection === "settings" && (
              <SettingsView apiKeys={apiKeys} setApiKeys={setApiKeys} />
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
        assetType={selectedAssetForExport.type as any}
        imageUrl={selectedAssetForExport.image}
        defaultPrompt={selectedAssetForExport.prompt}
      />
    </div>
  );
}
