/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, Settings, Share2, Brain, Save, CheckCircle2, 
  Tv, Instagram, Youtube, HelpCircle, HardDrive, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsView() {
  const [socials, setSocials] = useState({
    instagram: true,
    tiktok: true,
    youtube: false
  });

  const [aiPreferences, setAiPreferences] = useState({
    model: 'gemini-3-pro',
    quality: 'ultra-8k',
    temp: 0.8
  });

  const [exports, setExports] = useState({
    encoding: 'prores',
    watermark: false,
    compress: true
  });

  const [saveFeedback, setSaveFeedback] = useState(false);

  const toggleSocial = (plat: 'instagram' | 'tiktok' | 'youtube') => {
    setSocials(prev => ({ ...prev, [plat]: !prev[plat] }));
  };

  const handleSaveSettings = () => {
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 h-full overflow-y-auto" id="settings-workspace">
      
      {/* Header section with Save confirmation feedback status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">System Parameters</h2>
          <p className="text-xs text-zinc-500">Global orchestration settings, social tokens, and multi-model AI routing parameters.</p>
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
                <CheckCircle2 size={13} /> Saved in local cluster
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-gradient-to-r from-[#00D2FF] to-[#9B51E0] text-white text-xs font-semibold rounded-xl hover:shadow-[0_0_12px_rgba(0,210,255,0.25)] hover:opacity-95 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            id="save-settings-btn"
          >
            <Save size={13} />
            <span>Commit Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Social Orchestration */}
        <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4" id="section-social-orchestration">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Share2 size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Social API Orchestration</h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Configure direct secure handshakes to publish human-in-the-loop approved content into corporate timelines.
          </p>

          <div className="space-y-3">
            {/* Instagram */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <Instagram size={16} className="text-purple-400" />
                <div>
                  <div className="text-xs font-medium text-white">Instagram Reels API</div>
                  <div className="text-[9px] text-zinc-500 font-mono">@instagram_vibe_partner</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                  socials.instagram ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-zinc-600'
                }`}>
                  {socials.instagram ? 'CONNECTED' : 'MUTED'}
                </span>
                <button
                  onClick={() => toggleSocial('instagram')}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.instagram ? 'bg-[#00D2FF]' : 'bg-zinc-800'
                  }`}
                  id="switch-instagram"
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    socials.instagram ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* TikTok */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                {/* TikTok logo simulation with Video icon */}
                <Tv size={16} className="text-teal-400" />
                <div>
                  <div className="text-xs font-medium text-white">TikTok Creator Pipeline</div>
                  <div className="text-[9px] text-zinc-500 font-mono">@vybe_creator_org</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                  socials.tiktok ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-zinc-600'
                }`}>
                  {socials.tiktok ? 'CONNECTED' : 'MUTED'}
                </span>
                <button
                  onClick={() => toggleSocial('tiktok')}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.tiktok ? 'bg-[#00D2FF]' : 'bg-zinc-800'
                  }`}
                  id="switch-tiktok"
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    socials.tiktok ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* YouTube */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <Youtube size={16} className="text-red-500" />
                <div>
                  <div className="text-xs font-medium text-white">YouTube Shorts Matrix</div>
                  <div className="text-[9px] text-zinc-500 font-mono">Not Linked</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                  socials.youtube ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-zinc-600 bg-zinc-900/60 border border-zinc-800'
                }`}>
                  {socials.youtube ? 'CONNECTED' : 'STANDBY'}
                </span>
                <button
                  onClick={() => toggleSocial('youtube')}
                  className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${
                    socials.youtube ? 'bg-[#00D2FF]' : 'bg-zinc-800'
                  }`}
                  id="switch-youtube"
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    socials.youtube ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Model Preferences */}
        <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4" id="section-ai-models">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Brain size={15} className="text-[#9B51E0]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Model Preferences</h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Fine-tune core neural networks, sampling ratios and target engines contextually.
          </p>

          <div className="space-y-4">
            {/* Preferred Model */}
            <div className="space-y-1.5 animate-duration-150">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Generator Engine</label>
              <select
                value={aiPreferences.model}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, model: e.target.value }))}
                className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-3 focus:outline-none focus:border-zinc-800"
                id="select-ai-engine"
              >
                <option value="gemini-3-pro">Gemini 3.5 Pro (Multimodal Super-Resolution)</option>
                <option value="gpt-5-5">OpenAI GPT-5.5 (Cognitive Agent)</option>
                <option value="veo-3-master">Veo v3.1 Cinematic Video Engine</option>
              </select>
            </div>

            {/* Quality Standard */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Render Resolution</label>
              <select
                value={aiPreferences.quality}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-3 focus:outline-none focus:border-zinc-800"
                id="select-ai-resolution"
              >
                <option value="ultra-8k">Ultra HD 8K Master (150 Cycles, Slow Render)</option>
                <option value="pro-4k">Pro Quad HD 4K (90 Cycles, Standard)</option>
                <option value="fast-1080">Draft Vertical 1080p (Fastest, 30 Cycles)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span>Creativity Variance (Temp)</span>
                <span className="text-[#00D2FF]">{aiPreferences.temp}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                value={aiPreferences.temp}
                onChange={(e) => setAiPreferences(prev => ({ ...prev, temp: parseFloat(e.target.value) }))}
                className="w-full accent-[#00D2FF] bg-zinc-950 rounded-lg cursor-pointer h-1"
                id="settings-temp-slider"
              />
            </div>
          </div>
        </div>

        {/* 3. Export Parameters */}
        <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-4 md:col-span-2" id="section-export-params">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <HardDrive size={15} className="text-[#00D2FF]" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Mastering & Export Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Encoding file format select */}
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Video Encoding</label>
              <div className="space-y-1 mt-1">
                {[
                  { id: 'prores', label: 'ProRes 422 HQ (RAW-Ready)' },
                  { id: 'h264', label: 'H.264 FastStart (Mobile MP4)' }
                ].map(enc => (
                  <button
                    key={enc.id}
                    type="button"
                    onClick={() => setExports(prev => ({ ...prev, encoding: enc.id }))}
                    className={`w-full text-left p-2 rounded text-[10px] font-medium transition-colors ${
                      exports.encoding === enc.id ? 'bg-[#9B51E0]/15 text-white border border-[#9B51E0]/30' : 'text-zinc-500 hover:text-zinc-300'
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
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Timeline Safeguards</label>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Overlay Instagram/TikTok SafeMargins onto canvas renders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExports(prev => ({ ...prev, watermark: !prev.watermark }))}
                className={`w-full text-center py-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  exports.watermark 
                    ? 'bg-[#00D2FF]/20 text-white border-[#00D2FF]/50' 
                    : 'bg-zinc-900/40 text-zinc-500 border-zinc-900'
                }`}
                id="watermark-safeguard-toggle"
              >
                {exports.watermark ? 'Active Guidelines On' : 'Guidelines Off'}
              </button>
            </div>

            {/* AI Compression */}
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Metadata Ingestion</label>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Embed active prompts & seed weights directly into ProRes headers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExports(prev => ({ ...prev, compress: !prev.compress }))}
                className={`w-full text-center py-2.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                  exports.compress 
                    ? 'bg-[#00D2FF]/15 text-white border-[#00D2FF]/30' 
                    : 'bg-zinc-900/40 text-zinc-500 border-zinc-900'
                }`}
                id="compress-metadata-toggle"
              >
                {exports.compress ? 'Embed Headers True' : 'Do Not Embed'}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Security note */}
      <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck size={18} className="text-emerald-400" />
        <span className="text-[11px] text-zinc-400 leading-normal">
          Security Protocol Enabled: VYBE Creative Studio runs fully authenticated OAuth pipelines. Direct database hook inputs are bypassed to maintain uncompromised node isolation in local simulation mode.
        </span>
      </div>

    </div>
  );
}
