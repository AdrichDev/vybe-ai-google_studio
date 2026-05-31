export interface SocialPreset {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  label: string;
  mediaType: 'photo' | 'video' | 'both';
  aspectRatio: string;
  width: number;
  height: number;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  // ─── Instagram ───
  { id: 'ig-feed-square',      platform: 'instagram', label: 'Feed Cuadrado',          mediaType: 'both',  aspectRatio: '1:1',    width: 1080, height: 1080 },
  { id: 'ig-feed-vertical',    platform: 'instagram', label: 'Feed Vertical',           mediaType: 'photo', aspectRatio: '4:5',    width: 1080, height: 1350 },
  { id: 'ig-feed-horizontal',  platform: 'instagram', label: 'Feed Horizontal',         mediaType: 'photo', aspectRatio: '1.91:1', width: 1080, height: 608  },
  { id: 'ig-reel-story',       platform: 'instagram', label: 'Reel / Historia / Live',  mediaType: 'both',  aspectRatio: '9:16',   width: 1080, height: 1920 },

  // ─── TikTok ───
  { id: 'tt-video',            platform: 'tiktok',    label: 'Video / Historia',        mediaType: 'both',  aspectRatio: '9:16',   width: 1080, height: 1920 },

  // ─── YouTube ───
  { id: 'yt-short',            platform: 'youtube',   label: 'YouTube Short',           mediaType: 'both',  aspectRatio: '9:16',   width: 1080, height: 1920 },
  { id: 'yt-video-hd',         platform: 'youtube',   label: 'Video HD 1080p',          mediaType: 'video', aspectRatio: '16:9',   width: 1920, height: 1080 },
  { id: 'yt-video-4k',         platform: 'youtube',   label: 'Video 4K',                mediaType: 'video', aspectRatio: '16:9',   width: 3840, height: 2160 },
  { id: 'yt-thumbnail',        platform: 'youtube',   label: 'Miniatura (Thumbnail)',   mediaType: 'photo', aspectRatio: '16:9',   width: 1280, height: 720  },
];

export const PHOTO_PRESETS = SOCIAL_PRESETS.filter((p) => p.mediaType !== 'video');
export const VIDEO_PRESETS = SOCIAL_PRESETS.filter((p) => p.mediaType !== 'photo');

export const PHOTO_PRESETS_BY_PLATFORM = {
  instagram: PHOTO_PRESETS.filter((p) => p.platform === 'instagram'),
  tiktok:    PHOTO_PRESETS.filter((p) => p.platform === 'tiktok'),
  youtube:   PHOTO_PRESETS.filter((p) => p.platform === 'youtube'),
};

export const VIDEO_PRESETS_BY_PLATFORM = {
  instagram: VIDEO_PRESETS.filter((p) => p.platform === 'instagram'),
  tiktok:    VIDEO_PRESETS.filter((p) => p.platform === 'tiktok'),
  youtube:   VIDEO_PRESETS.filter((p) => p.platform === 'youtube'),
};

export const DEFAULT_PHOTO_PRESET = PHOTO_PRESETS_BY_PLATFORM.instagram[0];
export const DEFAULT_VIDEO_PRESET = VIDEO_PRESETS_BY_PLATFORM.youtube[0];
