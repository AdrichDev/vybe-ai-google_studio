/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Asset, ActivityLog } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Cyberpunk Vanguard - Editorial Noir',
    timestamp: 'Ahora mismo',
    format: 'Image',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    status: 'Ready',
    prompt: 'A sleek model standing beneath neon Japanese billboards, wearing iridescent reflective metallic tactical jacket, dark moody cyberpunk colors, volumetric rain fog, shot on Arri Alexa anamorphic lens 8k resolution.'
  },
  {
    id: 'p2',
    title: 'Porsche 911 GT3 - Matte Cyber-Green Accent',
    timestamp: 'Hace 2 horas',
    format: 'AI Agent-Generated',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    status: 'Ready',
    prompt: 'A deep matte-finish sports supercar positioned inside a hyper-modern concrete brutalist bunker, dramatic key light spotlighting green brake calipers, cybernetic accents, glowing purple light rails, Ultra HD.'
  },
  {
    id: 'p3',
    title: 'Urban Nomads - Campaña Streetwear Tokyo',
    timestamp: 'Hace 1 día',
    format: 'Video',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    status: 'Approved',
    prompt: 'Primer plano de joyería streetwear elegante y hilos de tela reflectante, paneo a cámara lenta 60fps sobre calles de Shibuya de noche, gradación cinemática de alto contraste.'
  },
  {
    id: 'p4',
    title: 'Golden Hour Neon - Estudio de Retrato',
    timestamp: 'Hace 3 días',
    format: 'Image',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    status: 'Approved',
    prompt: 'Retrato dramático de una mujer reflejando matices dorados del atardecer e iluminación lateral de tubo de neón rosa, texturas de piel de alta fidelidad, modo editorial de belleza.'
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'a1',
    title: 'Cyberpunk Vanguard - RAW',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    ratio: '9:16',
    size: '42.8 MB',
    isFavorite: true
  },
  {
    id: 'a2',
    title: 'Porsche GT3 - Cine Grade C_01',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    ratio: '16:9',
    size: '28.4 MB',
    isFavorite: false
  },
  {
    id: 'a3',
    title: 'Tokyo Street Drift Loop',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=800&q=80',
    ratio: '9:16',
    size: '185.0 MB',
    duration: '0:15',
    isFavorite: true
  },
  {
    id: 'a4',
    title: 'Golden Neon Campaign - Master V2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    ratio: '4:5',
    size: '34.2 MB',
    isFavorite: false
  },
  {
    id: 'a5',
    title: 'Hyper-Light Laser Matrix Background',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80',
    ratio: '16:9',
    size: '298.5 MB',
    duration: '0:24',
    isFavorite: false
  },
  {
    id: 'a6',
    title: 'ElevenLabs Studio Voiceover - Male',
    type: 'audio',
    url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=800&q=80',
    ratio: '-',
    size: '4.2 MB',
    duration: '0:30',
    isFavorite: false
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    agent: 'OpenClaw Agent',
    action: 'Veo 3.1 renderizando luxury_reel_porsche.mp4 (Fotograma 120/450)',
    timestamp: 'ahora',
    status: 'running'
  },
  {
    id: 'l2',
    agent: 'n8n Publisher',
    action: 'Pipeline de TikTok API inicializado para @vibe_studio_ai',
    timestamp: 'hace 1m',
    status: 'completed'
  },
  {
    id: 'l3',
    agent: 'GPT-5.5 Copywright',
    action: 'Hashtags creativos y descripción de Instagram optimizados',
    timestamp: 'hace 3m',
    status: 'completed'
  },
  {
    id: 'l4',
    agent: 'Midjourney Refiner',
    action: 'Escalado "Cyberpunk Vanguard" RAW a 16K Ultra Alta Resolución',
    timestamp: 'hace 15m',
    status: 'completed'
  },
  {
    id: 'l5',
    agent: 'ElevenLabs Voice',
    action: 'Sintetizando parámetros de voz: [Narrador, Grave, Acento Británico, Tono Calmado]',
    timestamp: 'hace 25m',
    status: 'completed'
  }
];

export const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic Master', description: 'Arri Alexa anamorphic film look' },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', description: 'Tokyo night, vibrant ultraviolet and cyan hues' },
  { id: 'editorial', name: 'High-Fashion Editorial', description: 'Vogue cover minimal aesthetic' },
  { id: 'retrofuturism', name: 'Retro Futurism', description: 'Analog glow, grain, and warmth' },
  { id: 'vray', name: '3D Hyperreal', description: 'Octane Render look, high key lighting' }
];

export const LIGHTING_PRESETS = [
  { id: 'moody', name: 'Midnight Volumetric' },
  { id: 'neon', name: 'Cyberpunk Purple Neon Duo' },
  { id: 'soft', name: 'Sartorial Studio Softbox' },
  { id: 'sun', name: 'Sunset Golden Hour Rays' },
  { id: 'rim', name: 'Underground Rim-Lighting' }
];

export const ASPECT_RATIOS = [
  { id: '916', name: '9:16 Vertical (Reels/TikTok)', value: 'aspect-[9/16] w-[280px]' },
  { id: '169', name: '16:9 Landscape (YouTube)', value: 'aspect-[16/9] w-full' },
  { id: '11', name: '1:1 Square (Instagram Post)', value: 'aspect-square w-[340px]' },
  { id: '45', name: '4:5 Portrait (Instagram Feed)', value: 'aspect-[4/5] w-[310px]' }
];
