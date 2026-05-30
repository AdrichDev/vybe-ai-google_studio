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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsViewProps {
  apiKeys: { google: string; openai: string; huggingface: string };
  setApiKeys: React.Dispatch<
    React.SetStateAction<{ google: string; openai: string; huggingface: string }>
  >;
}

export default function SettingsView({
  apiKeys,
  setApiKeys,
}: SettingsViewProps) {
  const [googleFeedback, setGoogleFeedback] = useState(false);
  const [openaiFeedback, setOpenaiFeedback] = useState(false);
  const [hfFeedback, setHfFeedback] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showHfKey, setShowHfKey] = useState(false);
  const [socials, setSocials] = useState({
    instagram: true,
    tiktok: true,
    youtube: false,
  });

  const [aiPreferences, setAiPreferences] = useState({
    model: "gemini-3-pro",
    quality: "ultra-8k",
    temp: 0.8,
  });

  const [exports, setExports] = useState({
    encoding: "prores",
    watermark: false,
    compress: true,
  });

  const [saveFeedback, setSaveFeedback] = useState(false);

  const toggleSocial = (plat: "instagram" | "tiktok" | "youtube") => {
    setSocials((prev) => ({ ...prev, [plat]: !prev[plat] }));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Parámetros del Sistema
          </h2>
          <p className="text-xs text-zinc-500">
            Configuración global de orquestación, tokens sociales y parámetros
            de enrutamiento de IA multi-modelo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saveFeedback && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-xs text-emerald-400 font-mono flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Guardado en el clúster local
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white text-xs font-semibold rounded-xl hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] hover:opacity-95 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            id="save-settings-btn"
          >
            <Save size={13} />
            <span>Aplicar Preferencias</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Social Orchestration */}
        <div
          className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4"
          id="section-social-orchestration"
        >
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Share2 size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Orquestación de API Social
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Configure conexiones seguras directas para publicar contenido
            aprobado por humanos en redes corporativas de forma automatizada.
          </p>

          <div className="space-y-3">
            {/* Instagram */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <Instagram size={16} className="text-purple-400" />
                <div>
                  <div className="text-xs font-medium text-white">
                    API de Instagram Reels
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono">
                    @instagram_vibe_partner
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                    socials.instagram
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-zinc-600"
                  }`}
                >
                  {socials.instagram ? "CONECTADO" : "MUTADO"}
                </span>
                <button
                  onClick={() => toggleSocial("instagram")}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.instagram ? "bg-[#00D2FF]" : "bg-zinc-800"
                  }`}
                  id="switch-instagram"
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      socials.instagram ? "left-4.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                {/* TikTok logo simulation with Video icon */}
                <Tv size={16} className="text-teal-400" />
                <div>
                  <div className="text-xs font-medium text-white">
                    Flujo de TikTok Creator
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono">
                    @vybe_creator_org
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                    socials.tiktok
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-zinc-600"
                  }`}
                >
                  {socials.tiktok ? "CONECTADO" : "MUTADO"}
                </span>
                <button
                  onClick={() => toggleSocial("tiktok")}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.tiktok ? "bg-[#00D2FF]" : "bg-zinc-800"
                  }`}
                  id="switch-tiktok"
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      socials.tiktok ? "left-4.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* YouTube */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <Youtube size={16} className="text-red-500" />
                <div>
                  <div className="text-xs font-medium text-white">
                    Matriz de YouTube Shorts
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono">
                    No Vinculado
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                    socials.youtube
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-zinc-600 bg-zinc-900/60 border border-zinc-800"
                  }`}
                >
                  {socials.youtube ? "CONECTADO" : "EN ESPERA"}
                </span>
                <button
                  onClick={() => toggleSocial("youtube")}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.youtube ? "bg-[#00D2FF]" : "bg-zinc-800"
                  }`}
                  id="switch-youtube"
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      socials.youtube ? "left-4.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Model Preferences */}
        <div
          className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4"
          id="section-ai-models"
        >
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Brain size={15} className="text-[#9B51E0]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Preferencias de Modelos de IA
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Ajuste de forma contextual las redes neuronales principales, las
            relaciones de muestreo y los motores de IA.
          </p>

          <div className="space-y-4">
            {/* Preferred Model */}
            <div className="space-y-1.5 animate-duration-150">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Motor de Generación
              </label>
              <select
                value={aiPreferences.model}
                onChange={(e) =>
                  setAiPreferences((prev) => ({
                    ...prev,
                    model: e.target.value,
                  }))
                }
                className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-3 focus:outline-none focus:border-zinc-800"
                id="select-ai-engine"
              >
                <option value="gemini-3-pro">
                  Gemini 3.5 Pro (Súper Resolución Multimodal)
                </option>
                <option value="gpt-5-5">
                  OpenAI GPT-5.5 (Agente Cognitivo)
                </option>
                <option value="veo-3-master">
                  Motor de Video Cinemático Veo v3.1
                </option>
              </select>
            </div>

            {/* Quality Standard */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Resolución de Renderizado
              </label>
              <select
                value={aiPreferences.quality}
                onChange={(e) =>
                  setAiPreferences((prev) => ({
                    ...prev,
                    quality: e.target.value,
                  }))
                }
                className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-3 focus:outline-none focus:border-zinc-800"
                id="select-ai-resolution"
              >
                <option value="ultra-8k">
                  Ultra HD 8K Máster (150 ciclos, Render lento)
                </option>
                <option value="pro-4k">
                  Pro Quad HD 4K (90 ciclos, Estándar)
                </option>
                <option value="fast-1080">
                  Borrador Vertical 1080p (Rápido, 30 ciclos)
                </option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span>Variabilidad Creativa (Temp)</span>
                <span className="text-[#00D2FF]">{aiPreferences.temp}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                value={aiPreferences.temp}
                onChange={(e) =>
                  setAiPreferences((prev) => ({
                    ...prev,
                    temp: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-[#00D2FF] bg-zinc-950 rounded-lg cursor-pointer h-1"
                id="settings-temp-slider"
              />
            </div>
          </div>
        </div>

        {/* AI Infrastructure & Credentials */}
        <div
          className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-5 md:col-span-2"
          id="section-ai-credentials"
        >
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Sliders size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Infraestructura y Credenciales de IA
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Administre de forma segura sus integraciones de API localmente.
            Ingrese sus claves para conectar el espacio de trabajo directamente
            con los flujos creativos de Google AI y OpenAI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google AI Studio Row */}
            <div
              className="space-y-2 bg-zinc-950/45 border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between"
              id="row-google-credentials"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Google AI Studio
                </span>
                <div className="flex items-center gap-2 h-5">
                  <AnimatePresence>
                    {googleFeedback && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-[9px] font-mono text-emerald-400"
                      >
                        Clave guardada localmente
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded leading-none transition-all duration-300 ${
                      apiKeys.google
                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-zinc-400 bg-zinc-800/60"
                    }`}
                  >
                    {apiKeys.google ? "Conectado" : "Falta Clave"}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center mt-1.5 focus-within:border-zinc-700">
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
                  placeholder="Ingrese GEMINI_API_KEY"
                  className="w-full text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-zinc-700 transition-all duration-300"
                  id="google-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1 rounded-lg transition-colors flex items-center justify-center"
                  id="google-key-eye-toggle"
                >
                  {showGoogleKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* OpenAI API Row */}
            <div
              className="space-y-2 bg-zinc-950/45 border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between"
              id="row-openai-credentials"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  OpenAI API
                </span>
                <div className="flex items-center gap-2 h-5">
                  <AnimatePresence>
                    {openaiFeedback && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-[9px] font-mono text-emerald-400"
                      >
                        Clave guardada localmente
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded leading-none transition-all duration-300 ${
                      apiKeys.openai
                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-zinc-400 bg-zinc-800/60"
                    }`}
                  >
                    {apiKeys.openai ? "Conectado" : "Falta Clave"}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center mt-1.5 focus-within:border-zinc-700">
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
                  placeholder="Ingrese OPENAI_API_KEY"
                  className="w-full text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-zinc-700 transition-all duration-300"
                  id="openai-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1 rounded-lg transition-colors flex items-center justify-center"
                  id="openai-key-eye-toggle"
                >
                  {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Hugging Face API Row */}
            <div
              className="space-y-2 bg-zinc-950/45 border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between"
              id="row-hf-credentials"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Hugging Face (FLUX)
                </span>
                <div className="flex items-center gap-2 h-5">
                  <AnimatePresence>
                    {hfFeedback && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-[9px] font-mono text-emerald-400"
                      >
                        Clave guardada localmente
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded leading-none transition-all duration-300 ${
                      apiKeys.huggingface
                        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-zinc-400 bg-zinc-800/60"
                    }`}
                  >
                    {apiKeys.huggingface ? "Conectado" : "Falta Clave"}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center mt-1.5 focus-within:border-zinc-700">
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
                  placeholder="Ingrese HF_TOKEN"
                  className="w-full text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-zinc-700 transition-all duration-300"
                  id="hf-api-key-input"
                />
                <button
                  type="button"
                  onClick={() => setShowHfKey(!showHfKey)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer p-1 rounded-lg transition-colors flex items-center justify-center"
                  id="hf-key-eye-toggle"
                >
                  {showHfKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Export Parameters */}
        <div
          className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 md:col-span-2"
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
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
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
                    className={`w-full text-left p-2 rounded text-[10px] font-medium transition-colors ${
                      exports.encoding === enc.id
                        ? "bg-[#9B51E0]/15 text-white border border-[#9B51E0]/30"
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
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  Márgenes de Seguridad en Línea de Tiempo
                </label>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
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
                    : "bg-zinc-900/40 text-zinc-500 border-zinc-900"
                }`}
                id="watermark-safeguard-toggle"
              >
                {exports.watermark ? "Guías Activas" : "Guías Desactivadas"}
              </button>
            </div>

            {/* AI Compression */}
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  Ingesta de Metadatos
                </label>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
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
      <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck size={18} className="text-emerald-400" />
        <span className="text-[11px] text-zinc-400 leading-normal">
          Protocolo de Seguridad Activado: VYBE Creative Studio ejecuta flujos
          autenticados de OAuth de forma segura. Se omiten las conexiones
          directas con bases de datos para mantener el aislamiento absoluto de
          los nodos en modo de simulación local.
        </span>
      </div>
    </div>
  );
}
