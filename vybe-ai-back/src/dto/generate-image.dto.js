import { HTTP_STATUS } from "../config/http.js";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

export function requirePrompt(prompt) {
  if (!prompt || !String(prompt).trim()) {
    throw new AppError("El prompt es obligatorio.", HTTP_STATUS.BAD_REQUEST);
  }
  return String(prompt).trim();
}

function resolveOpenAiSize(model, aspectRatio, rawSize) {
  if (rawSize) return rawSize;
  // Todos los modelos gpt-image-* soportan "auto"
  if (model && model.startsWith("gpt-image-")) return "auto";
  // Fallback legacy
  if (!aspectRatio) return "1024x1024";
  const [w, h] = aspectRatio.split(":").map(Number);
  if (w > h) return "1536x1024";
  if (w < h) return "1024x1536";
  return "1024x1024";
}

export function resolveGoogleRequest(body = {}, file = undefined) {
  const prompt = requirePrompt(body.prompt);
  const apiKey = body.googleKey || env.googleApiKey;

  if (!apiKey) {
    throw new AppError(
      "Clave de Google AI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    prompt,
    apiKey,
    model: body.model || "gemini-2.0-flash-preview-image-generation",
    quality: body.quality || "pro",
    creativity: parseFloat(body.creativity) || 0.8,
    aspectRatio: body.aspectRatio || "1:1",
    imageFile: file,
  };
}

export function resolveOpenAiRequest(body = {}) {
  const prompt = requirePrompt(body.prompt);
  const apiKey = body.openaiKey || env.openAiApiKey;
  const model = body.model || "dall-e-3";

  if (!apiKey) {
    throw new AppError(
      "Clave de OpenAI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const size = resolveOpenAiSize(model, body.aspectRatio, body.size);

  return {
    prompt,
    apiKey,
    model,
    size,
    quality: body.quality || "pro",
    creativity: parseFloat(body.creativity) || 0.8,
    aspectRatio: body.aspectRatio || "1:1",
  };
}

export function resolveOpenAiEditRequest(body = {}, file = undefined) {
  const prompt = requirePrompt(body.prompt);
  const apiKey = body.openaiKey || env.openAiApiKey;
  const model = body.model || "dall-e-3";

  if (!apiKey) {
    throw new AppError(
      "Clave de OpenAI no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const size = resolveOpenAiSize(model, body.aspectRatio, body.size);

  return {
    prompt,
    apiKey,
    model,
    size,
    quality: body.quality || "pro",
    creativity: parseFloat(body.creativity) || 0.8,
    aspectRatio: body.aspectRatio || "1:1",
    imageFile: file,
  };
}

export function resolveHuggingFaceRequest(body = {}, file = undefined) {
  const prompt = requirePrompt(body.prompt);
  const apiKey = body.hfToken || env.huggingFaceToken;

  if (!apiKey) {
    throw new AppError(
      "HF_TOKEN no configurada. Añadila en Ajustes.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    prompt,
    apiKey,
    model: body.model || "flux-schnell",
    quality: body.quality || "pro",
    creativity: parseFloat(body.creativity) || 0.8,
    aspectRatio: body.aspectRatio || "1:1",
    imageFile: file,
  };
}
