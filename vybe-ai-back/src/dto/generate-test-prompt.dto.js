import { AppError } from "../errors/app-error.js";
import { HTTP_STATUS } from "../config/http.js";
import { env } from "../config/env.js";

export function resolveTestPromptRequest(body = {}) {
  const { mode, platform, aspectRatio, provider } = body;

  if (!mode || !["photo", "video"].includes(mode)) {
    throw new AppError(
      'El campo "mode" es obligatorio y debe ser "photo" o "video".',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const apiKey = body.googleKey || env.googleApiKey;

  if (!apiKey) {
    throw new AppError(
      "Clave de Google AI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return { mode, platform: platform || null, aspectRatio: aspectRatio || null, provider: provider || null, apiKey };
}
