/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveSection = 'dashboard' | 'photo' | 'video' | 'assets' | 'settings';

export interface Project {
  id: string;
  title: string;
  timestamp: string;
  format: 'Image' | 'Video' | 'AI Agent-Generated';
  image: string;
  status: 'Ready' | 'Processing' | 'Approved';
  prompt?: string;
  ratio?: string;
}

export interface Asset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'template';
  url: string;
  ratio: string;
  size: string;
  duration?: string;
  isFavorite: boolean;
}

export interface ActivityLog {
  id: string;
  agent: string;
  action: string;
  timestamp: string; // e.g., "now", "2m ago"
  status: 'running' | 'completed' | 'paused';
}

export interface PhotoWorkflowState {
  stylePreset: string;
  lighting: string;
  aspectRatio: string;
  prompt: string;
  currentPreviewUrl: string;
  isGenerating: boolean;
}

export interface VideoWorkflowState {
  mode: 'image-to-video' | 'text-to-video';
  autoCaptions: boolean;
  voiceover: string;
  isPlaying: boolean;
  currentTime: number; // in seconds
  totalDuration: number; // in seconds
  currentFrame: number;
}
