/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sliders,
  Settings,
  Share2,
  Brain,
  Save,
  CheckCircle2,
  Tv,
  Instagram,
  Youtube,
  HelpCircle,
  HardDrive,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsViewProps {
  apiKeys: { google: string; openai: string; huggingface: string };
  setApiKeys: React.Dispatch<
    React.SetStateAction<{ google: string; openai: string; huggingface: string }>
  >;
  theme?: string;
}

export default function SettingsView({
  apiKeys,
  setApiKeys,
  theme = "dark",
}: SettingsViewProps) {
  const [googleFeedback, setGoogleFeedback] = useState(false);
  const [openaiFeedback, setOpenaiFeedback] = useState(false);
  const [hfFeedback, setHfFeedback] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);

  const [socials, setSocials] = useState(() => {
    const saved = localStorage.getItem("vybe_socials");
    return saved ? JSON.parse(saved) : { instagram: true, tiktok: true, youtube: false };
  });

  const [socialHandles, setSocialHandles] = useState(() => {
    const saved = localStorage.getItem("vybe_social_handles");
    return saved ? JSON.parse(saved) : { instagram: "@adrian.vybe", tiktok: "@adrian.vybe", youtube: "" };
  });

  const [lastHandles, setLastHandles] = useState(() => {
    const saved = localStorage.getItem("vybe_last_handles");
    return saved ? JSON.parse(saved) : { instagram: "@adrian.vybe", tiktok: "@adrian.vybe", youtube: "@adrian.shorts" };
  });

  const [activeSocialModal, setActiveSocialModal] = useState<"instagram" | "tiktok" | "youtube" | null>(null);
  const [socialModalOption, setSocialModalOption] = useState<"last" | "new">("last");
  const [newHandleInput, setNewHandleInput] = useState("");

  const [exports, setExports] = useState({
    encoding: "prores",
    watermark: false,
    compress: true,
  });

  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSwitchClick = (platform: "instagram" | "tiktok" | "youtube") => {
    if (socials[platform]) {
      handleDisconnectSocial(platform);
    } else {
      setActiveSocialModal(platform);
      setSocialModalOption("last");
      setNewHandleInput("");
    }
  };

  const handleDisconnectSocial = (platform: "instagram" | "tiktok" | "youtube") => {
    const newSocials = { ...socials, [platform]: false };
    setSocials(newSocials);
    localStorage.setItem("vybe_socials", JSON.stringify(newSocials));
  };

  const handleSaveSocialConnection = () => {
    if (!activeSocialModal) return;
    
    let handleToUse = "";
    if (socialModalOption === "last") {
      handleToUse = lastHandles[activeSocialModal] || "@adrian.vybe";
    } else {
      const sanitized = newHandleInput.trim();
      handleToUse = sanitized.startsWith("@") ? sanitized : `@${sanitized}`;
      if (handleToUse === "@") {
        handleToUse = lastHandles[activeSocialModal] || "@adrian.vybe";
      }
    }

    const newSocials = { ...socials, [activeSocialModal]: true };
    const newHandles = { ...socialHandles, [activeSocialModal]: handleToUse };
    const newLast = { ...lastHandles, [activeSocialModal]: handleToUse };

    setSocials(newSocials);
    setSocialHandles(newHandles);
    setLastHandles(newLast);

    localStorage.setItem("vybe_socials", JSON.stringify(newSocials));
    localStorage.setItem("vybe_social_handles", JSON.stringify(newHandles));
    localStorage.setItem("vybe_last_handles", JSON.stringify(newLast));

    setActiveSocialModal(null);
  };

  const handleSaveSettings = () => {
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
    }, 2000);
  };

  return (
    <div
      className="px-8 py-10 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto"
      id="settings-workspace"
    >
      {/* Header section with Save confirmation feedback status */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme === 'light' ? 'border-zinc-200' : 'border-zinc-900'} pb-6`}>
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} tracking-tight`}>
            Ajustes / Configurá tu estudio a tu manera.
          </h2>
          <p className={`text-xs ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Configuración global de orquestación, tokens sociales y enrutamiento de credenciales premium.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saveFeedback && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-xs text-emerald-500 font-mono flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Guardado en el clúster local
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white text-xs font-semibold rounded-xl hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] hover:opacity-95 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            id="save-settings-btn"
          >
            <Save size={16} />
            <span>Aplicar Cambios</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Social Orchestration */}
        <div
          className={`${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'bg-[#121212] border-zinc-900/60 text-white'} border rounded-2xl p-6.5 flex flex-col justify-between md:col-span-2`}
          id="section-social-orchestration"
        >
          <div className="space-y-1 pb-3">
            <h3 className={`text-xl sm:text-[22px] font-bold ${theme === 'light' ? 'text-zinc-950' : 'text-white'} tracking-tight`}>
              Orquestación Social
            </h3>
            <p className={`text-[13.5px] ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-500'} font-medium`}>
              Conectá tus canales para publicar directamente.
            </p>
          </div>

          <div className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-zinc-900/40'} flex-1 flex flex-col justify-between`}>
            {/* Instagram */}
            <div className="flex items-center justify-between py-5.5 first:pt-2 last:pb-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                  <Instagram size={20} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                </div>
                <div>
                  <div className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    Instagram
                  </div>
                  <div className={`text-[13px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} font-mono mt-0.5`}>
                    {socials.instagram ? socialHandles.instagram : "No vinculado"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4.5">
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    socials.instagram
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-400 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {socials.instagram ? "CONECTADO" : "DESCONECTADO"}
                </span>
                <button
                  onClick={() => handleSwitchClick("instagram")}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${
                    socials.instagram ? "bg-gradient-to-r from-[#00D2FF] to-[#9B51E0]" : (theme === 'light' ? "bg-zinc-200" : "bg-zinc-800")
                  }`}
                  id="switch-instagram"
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${
                      socials.instagram ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex items-center justify-between py-5.5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                  <Tv size={20} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                </div>
                <div>
                  <div className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    TikTok
                  </div>
                  <div className={`text-[13px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} font-mono mt-0.5`}>
                    {socials.tiktok ? socialHandles.tiktok : "No vinculado"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4.5">
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    socials.tiktok
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-400 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {socials.tiktok ? "CONECTADO" : "DESCONECTADO"}
                </span>
                <button
                  onClick={() => handleSwitchClick("tiktok")}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${
                    socials.tiktok ? "bg-gradient-to-r from-[#00D2FF] to-[#9B51E0]" : (theme === 'light' ? "bg-zinc-200" : "bg-zinc-800")
                  }`}
                  id="switch-tiktok"
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${
                      socials.tiktok ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* YouTube Shorts */}
            <div className="flex items-center justify-between py-5.5 last:pb-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                  <Youtube size={20} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                </div>
                <div>
                  <div className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    YouTube Shorts
                  </div>
                  <div className={`text-[13px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} font-mono mt-0.5`}>
                    {socials.youtube ? socialHandles.youtube : "No vinculado"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4.5">
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    socials.youtube
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-400 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {socials.youtube ? "CONECTADO" : "DESCONECTADO"}
                </span>
                <button
                  onClick={() => handleSwitchClick("youtube")}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${
                    socials.youtube ? "bg-gradient-to-r from-[#00D2FF] to-[#9B51E0]" : (theme === 'light' ? "bg-zinc-200" : "bg-zinc-800")
                  }`}
                  id="switch-youtube"
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${
                      socials.youtube ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Infrastructure & Credentials */}
        <div
          className={`${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'bg-[#121212] border border-zinc-900/60 text-white'} border rounded-2xl p-6.5 space-y-6 md:col-span-2`}
          id="section-ai-credentials"
        >
          <div className="space-y-1 pb-2">
            <h3 className={`text-xl sm:text-[22px] font-bold ${theme === 'light' ? 'text-zinc-950' : 'text-white'} tracking-tight`}>
              Infraestructura IA y Credenciales
            </h3>
            <p className={`text-[13.5px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>
              Usá tus propias claves. Cada estudio puede usar un proveedor diferente.
            </p>
          </div>

          <div className="space-y-6">
            {/* Google AI Studio Block */}
            <div className="space-y-3" id="row-google-credentials">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                    <Sparkles size={18} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                  </div>
                  <div>
                    <span className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} block`}>
                      Google AI Studio
                    </span>
                    <span className={`text-[12px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block mt-0.5`}>
                      Almacenado localmente en esta sesión.
                    </span>
                  </div>
                </div>
                
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-350 ${
                    apiKeys.google
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-450 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {apiKeys.google ? "CONECTADO" : "CLAVE FALTANTE"}
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showGoogleKey ? "text" : "password"}
                  value={apiKeys.google}
                  onChange={(e) => {
                    setApiKeys((prev) => ({ ...prev, google: e.target.value }));
                  }}
                  onBlur={() => {
                    setGoogleFeedback(true);
                    setTimeout(() => setGoogleFeedback(false), 2000);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Ingresá GEMINI_API_KEY"
                  className={`w-full text-sm font-medium ${theme === 'light' ? 'text-zinc-900 bg-white border-zinc-200 focus:border-zinc-400' : 'text-zinc-300 bg-zinc-950 border-zinc-900/60 focus:border-zinc-750'} border rounded-xl py-3 px-4.5 pr-11 transition-all duration-300 focus:outline-none font-mono`}
                  id="google-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1.5 rounded-lg transition-colors flex items-center justify-center animate-duration-150"
                  id="google-key-eye-toggle"
                >
                  {showGoogleKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* OpenAI API Block */}
            <div className="space-y-3" id="row-openai-credentials">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                    <Brain size={18} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                  </div>
                  <div>
                    <span className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} block`}>
                      OpenAI API
                    </span>
                    <span className={`text-[12px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block mt-0.5`}>
                      Almacenado localmente en esta sesión.
                    </span>
                  </div>
                </div>
                
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-350 ${
                    apiKeys.openai
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-450 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {apiKeys.openai ? "CONECTADO" : "CLAVE FALTANTE"}
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showOpenaiKey ? "text" : "password"}
                  value={apiKeys.openai}
                  onChange={(e) => {
                    setApiKeys((prev) => ({ ...prev, openai: e.target.value }));
                  }}
                  onBlur={() => {
                    setOpenaiFeedback(true);
                    setTimeout(() => setOpenaiFeedback(false), 2000);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Ingresá OPENAI_API_KEY"
                  className={`w-full text-sm font-medium ${theme === 'light' ? 'text-zinc-900 bg-white border-zinc-200 focus:border-zinc-400' : 'text-zinc-300 bg-zinc-950 border-zinc-900/60 focus:border-zinc-750'} border rounded-xl py-3 px-4.5 pr-11 transition-all duration-300 focus:outline-none font-mono`}
                  id="openai-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1.5 rounded-lg transition-colors flex items-center justify-center animate-duration-150"
                  id="openai-key-eye-toggle"
                >
                  {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Hugging Face Block */}
            <div className="space-y-3" id="row-hf-credentials">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800/45'}`}>
                    <Sliders size={18} className={theme === 'light' ? 'text-zinc-700' : 'text-white'} />
                  </div>
                  <div>
                    <span className={`text-[15px] sm:text-base font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'} block`}>
                      Hugging Face
                    </span>
                    <span className={`text-[12px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block mt-0.5`}>
                      Almacenado localmente en esta sesión.
                    </span>
                  </div>
                </div>
                
                <span
                  className={`text-[10px] font-sans font-black tracking-wide px-3 py-1.5 rounded-lg border transition-all duration-350 ${
                    apiKeys.huggingface
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : (theme === 'light' ? "text-zinc-450 bg-zinc-200 border-zinc-300" : "text-zinc-550 bg-zinc-900/50 border-zinc-800/40")
                  }`}
                >
                  {apiKeys.huggingface ? "CONECTADO" : "CLAVE FALTANTE"}
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showHfKey ? "text" : "password"}
                  value={apiKeys.huggingface}
                  onChange={(e) => {
                    setApiKeys((prev) => ({ ...prev, huggingface: e.target.value }));
                  }}
                  onBlur={() => {
                    setHfFeedback(true);
                    setTimeout(() => setHfFeedback(false), 2000);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Ingresá HF_TOKEN"
                  className={`w-full text-sm font-medium ${theme === 'light' ? 'text-zinc-900 bg-white border-zinc-200 focus:border-zinc-400' : 'text-zinc-300 bg-zinc-950 border-zinc-900/60 focus:border-zinc-750'} border rounded-xl py-3 px-4.5 pr-11 transition-all duration-300 focus:outline-none font-mono`}
                  id="hf-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowHfKey(!showHfKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1.5 rounded-lg transition-colors flex items-center justify-center animate-duration-150"
                  id="hf-key-eye-toggle"
                >
                  {showHfKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Export Parameters */}
        <div
          className={`${theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'bg-[#121212] border border-zinc-900/60 text-white'} border rounded-2xl p-6.5 space-y-4 md:col-span-2`}
          id="section-export-params"
        >
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <HardDrive size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Masterización y Parámetros de Exportación
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Encoding file format select */}
            <div className={`space-y-1.5 p-3 rounded-xl border ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-900 text-white'}`}>
              <label className={`text-[9px] font-mono uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Codificación de Video
              </label>
              <div className="space-y-1 mt-1">
                {[
                  { id: "prores", label: "ProRes 422 HQ (Listo para RAW)" },
                  { id: "h264", label: "H.264 FastStart (MP4 para Móvil)" },
                ].map((enc) => (
                  <button
                    key={enc.id}
                    type="button"
                    onClick={() =>
                      setExports((prev) => ({ ...prev, encoding: enc.id }))
                    }
                    className={`w-full text-left p-2 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      exports.encoding === enc.id
                        ? "bg-[#9B51E0]/15 text-white border border-[#9B51E0]/30"
                        : theme === 'light'
                          ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    id={`encoding-sel-${enc.id}`}
                  >
                    {enc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Safe Area grid guidelines watermark toggle */}
            <div className={`space-y-1.5 p-3 rounded-xl border flex flex-col justify-between ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-900 text-white'}`}>
              <div>
                <label className={`text-[9px] font-mono uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Márgenes de Seguridad en Línea de Tiempo
                </label>
                <p className={`text-[10px] ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-405'} mt-1 leading-normal`}>
                  Superponer márgenes de seguridad de Instagram/TikTok en los
                  renderizados del lienzo.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setExports((prev) => ({
                    ...prev,
                    watermark: !prev.watermark,
                  }))
                }
                className={`w-full text-center py-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  exports.watermark
                    ? "bg-[#00D2FF]/20 text-white border-[#00D2FF]/50"
                    : theme === 'light'
                      ? "bg-zinc-200/50 text-zinc-450 border-zinc-300/40 hover:bg-zinc-200"
                      : "bg-zinc-900/40 text-zinc-500 border-zinc-900"
                }`}
                id="watermark-safeguard-toggle"
              >
                {exports.watermark ? "Guías Activas" : "Guías Desactivadas"}
              </button>
            </div>

            {/* AI Compression */}
            <div className={`space-y-1.5 p-3 rounded-xl border flex flex-col justify-between ${theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-900 text-white'}`}>
              <div>
                <label className={`text-[9px] font-mono uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Ingesta de Metadatos
                </label>
                <p className={`text-[10px] ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-405'} mt-1 leading-normal`}>
                  Incrustar prompts activos y pesos de semilla directamente en
                  cabeceras de ProRes.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setExports((prev) => ({ ...prev, compress: !prev.compress }))
                }
                className={`w-full text-center py-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  exports.compress
                    ? "bg-[#00D2FF]/15 text-white border-[#00D2FF]/30"
                    : theme === 'light'
                      ? "bg-zinc-200/50 text-zinc-450 border-zinc-300/40 hover:bg-zinc-200"
                      : "bg-zinc-900/40 text-zinc-500 border-zinc-900"
                }`}
                id="compress-metadata-toggle"
              >
                {exports.compress ? "Incrustar Cabeceras" : "No Incrustar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className={`border p-4 rounded-xl flex items-center gap-3 ${theme === 'light' ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-950' : 'bg-[#121212] border-zinc-900 text-white'}`}>
        <ShieldCheck size={18} className="text-emerald-400" />
        <span className={`text-[11px] ${theme === 'light' ? 'text-emerald-800' : 'text-zinc-400'} leading-normal`}>
          Protocolo de Seguridad Activado: VYBE Creative Studio ejecuta flujos
          autenticados de OAuth de forma segura. Se omiten las conexiones
          directas con bases de datos para mantener el aislamiento absoluto de
          los nodos en modo de simulación local.
        </span>
      </div>

      {/* Social Connection Modal */}
      <AnimatePresence>
        {activeSocialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            id="social-connection-modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`w-full max-w-md border rounded-3xl p-6.5 space-y-6 shadow-2xl relative ${
                theme === 'light'
                  ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
                  : 'bg-[#121212] border-zinc-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
              }`}
            >
              {/* Circular Icon and Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] text-white shadow-lg relative z-10">
                    {activeSocialModal === "instagram" && <Instagram size={28} />}
                    {activeSocialModal === "tiktok" && <Tv size={28} />}
                    {activeSocialModal === "youtube" && <Youtube size={28} />}
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] opacity-25 blur-sm z-0 animate-pulse" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-[19px] font-black ${theme === 'light' ? 'text-zinc-950' : 'text-white'} tracking-tight`}>
                    Vincular {activeSocialModal === "instagram" ? "Instagram" : activeSocialModal === "tiktok" ? "TikTok" : "YouTube Shorts"}
                  </h3>
                  <p className={`text-xs ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>
                    VYBE orquestará la publicación automática de tus reels de forma segura.
                  </p>
                </div>
              </div>

              {/* Options Body */}
              <div className="space-y-3">
                {/* Option 1: Use Last Connected Account */}
                <div
                  onClick={() => setSocialModalOption("last")}
                  className={`border rounded-2xl p-4.5 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    socialModalOption === "last"
                      ? theme === 'light'
                        ? 'bg-zinc-50 border-zinc-300 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 shadow-md'
                      : theme === 'light'
                        ? 'bg-transparent border-zinc-150 hover:bg-zinc-50/50'
                        : 'bg-transparent border-zinc-900/60 hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      socialModalOption === "last" ? 'bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] text-white' : theme === 'light' ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-650'
                    }`}>
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <span className={`text-[13px] sm:text-[13.5px] font-bold block ${theme === 'light' ? 'text-zinc-800' : 'text-white'}`}>
                        Usar última cuenta
                      </span>
                      <span className={`text-[12px] font-mono ${theme === 'light' ? 'text-[#9B51E0] font-black' : 'text-[#00D2FF] font-bold'} block mt-0.5`}>
                        {lastHandles[activeSocialModal] || "@adrian.vybe"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Link Different Account */}
                <div
                  onClick={() => setSocialModalOption("new")}
                  className={`border rounded-2xl p-4.5 cursor-pointer transition-all duration-300 space-y-3.5 ${
                    socialModalOption === "new"
                      ? theme === 'light'
                        ? 'bg-zinc-50 border-zinc-300 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 shadow-md'
                      : theme === 'light'
                        ? 'bg-transparent border-zinc-150 hover:bg-zinc-50/50'
                        : 'bg-transparent border-zinc-900/60 hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        socialModalOption === "new" ? 'bg-gradient-to-tr from-[#00D2FF] to-[#9B51E0] text-white' : theme === 'light' ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-650'
                      }`}>
                        <Sliders size={14} />
                      </div>
                      <div>
                        <span className={`text-[13px] sm:text-[13.5px] font-bold block ${theme === 'light' ? 'text-zinc-800' : 'text-white'}`}>
                          Vincular otra cuenta
                        </span>
                        <span className={`text-[11.5px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'} block mt-0.5`}>
                          Registra un usuario nuevo en esta sesión.
                        </span>
                      </div>
                    </div>
                  </div>

                  {socialModalOption === "new" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative flex items-center mt-2"
                    >
                      <span className={`absolute left-4 font-bold font-mono text-[13.5px] ${theme === 'light' ? 'text-[#9B51E0]' : 'text-[#00D2FF]'}`}>@</span>
                      <input
                        type="text"
                        placeholder="nombre_usuario"
                        value={newHandleInput}
                        onChange={(e) => setNewHandleInput(e.target.value)}
                        className={`w-full text-xs font-bold ${
                          theme === 'light' ? 'text-zinc-900 bg-white border-zinc-200 focus:border-zinc-300' : 'text-zinc-300 bg-zinc-950 border-zinc-800 focus:border-zinc-700'
                        } border rounded-xl py-2.5 pl-8 pr-4 transition-all duration-300 focus:outline-none`}
                        id="new-handle-input"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSocialModal(null)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer border text-center ${
                    theme === 'light'
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSocialConnection}
                  className="flex-1 py-3 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] hover:shadow-[0_4px_15px_rgba(0,210,255,0.2)] hover:opacity-95 transition-all cursor-pointer text-center animate-duration-150"
                >
                  Confirmar Conexión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
