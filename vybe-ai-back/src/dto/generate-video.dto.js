import { AppError } from "../errors/app-error.js";
import { HTTP_STATUS } from "../config/http.js";
import { env } from "../config/env.js";

const VEO_RESOLUTIONS = new Set(["720p", "1080p"]);

export function resolveGoogleVideoRequest(body = {}, file = undefined) {
  const { prompt, googleKey: clientKey, aspectRatio, resolution } = body;

  if (!prompt || !String(prompt).trim()) {
    throw new AppError("El prompt es obligatorio.", HTTP_STATUS.BAD_REQUEST);
  }

  const apiKey = clientKey || env.googleApiKey;
  if (!apiKey) {
    throw new AppError(
      "Clave de Google AI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    prompt: String(prompt).trim(),
    apiKey,
    aspectRatio: aspectRatio || "16:9",
    resolution: VEO_RESOLUTIONS.has(resolution) ? resolution : undefined,
    imageFile: file,
  };
}

export function resolveVeoPollRequest(body = {}) {
  const { operationName, googleKey: clientKey } = body;

  if (!operationName) {
    throw new AppError("operationName es obligatorio.", HTTP_STATUS.BAD_REQUEST);
  }

  const apiKey = clientKey || env.googleApiKey;
  if (!apiKey) {
    throw new AppError(
      "Clave de Google AI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return { operationName, apiKey };
}

// Perfiles UX → configuración real de Sora
const SORA_PROFILES = {
  sora: {         // "Sora Pro" — alta calidad, 12s
    model: "sora-2-pro",
    baseDuration: 12,
    preferHighRes: true,
  },
  "sora-turbo": { // "Sora Turbo" — iteración rápida, 8s
    model: "sora-2",
    baseDuration: 8,
    preferHighRes: false,
  },
};

// Tamaños reales soportados por Sora (verificado contra API docs)
const SIZE_MAP = {
  "9:16":   { high: "1080x1920", low: "512x768"  },
  "16:9":   { high: "1920x1080", low: "1280x720"  },
  "1:1":    { high: "512x512",   low: "512x512"   },
  "4:5":    { high: "512x768",   low: "512x768"   },
  "1.91:1": { high: "1920x1080", low: "1280x720"  },
};

function resolveSize(aspectRatio, preferHigh) {
  const entry = SIZE_MAP[aspectRatio] || SIZE_MAP["9:16"];
  return preferHigh ? entry.high : entry.low;
}

// Sora valid seconds: 4 | 8 | 12  (API-enforced enum)
const SORA_VALID_SECONDS = [4, 8, 12];

function resolveSeconds(baseDuration, creativity) {
  let target;
  if (creativity < 0.6)     target = 4;
  else if (creativity > 1.0) target = 12;
  else                       target = baseDuration <= 6 ? 4 : baseDuration <= 10 ? 8 : 12;
  // Snap to nearest valid value
  return SORA_VALID_SECONDS.reduce((a, b) =>
    Math.abs(b - target) < Math.abs(a - target) ? b : a
  );
}

export function resolveVideoRequest(body = {}) {
  const { prompt, openaiKey: clientKey, profile, aspectRatio, creativity, resolution } = body;

  if (!prompt || !String(prompt).trim()) {
    throw new AppError("El prompt es obligatorio.", HTTP_STATUS.BAD_REQUEST);
  }

  const apiKey = clientKey || env.openAiApiKey;
  if (!apiKey) {
    throw new AppError(
      "Clave de OpenAI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const profileKey = profile && SORA_PROFILES[profile] ? profile : "sora-turbo";
  const { model, baseDuration, preferHighRes } = SORA_PROFILES[profileKey];

  const temp = typeof creativity === "number" ? creativity : 0.8;

  // resolution override: "high" | "low" | undefined (usa el default del perfil)
  let preferHigh;
  if (resolution === "high") preferHigh = true;
  else if (resolution === "low") preferHigh = false;
  else preferHigh = preferHighRes || temp > 1.0;

  const size    = resolveSize(aspectRatio || "9:16", preferHigh);
  const seconds = resolveSeconds(baseDuration, temp);

  return {
    prompt: String(prompt).trim(),
    apiKey,
    model,
    size,
    seconds,
    profile: profileKey,
  };
}
