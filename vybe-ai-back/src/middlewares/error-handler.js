import { HTTP_STATUS } from "../config/http.js";
import { AppError } from "../errors/app-error.js";
import { ProviderError } from "../errors/provider-error.js";

function parseProviderError(provider, raw) {
  if (raw.includes("not available in your country") || raw.includes("FAILED_PRECONDITION")) {
    return `Google AI: generación de imágenes no disponible en tu país. Usá OpenAI o Hugging Face como proveedor.`;
  }
  if (raw.includes("prepayment credits are depleted") || raw.includes("RESOURCE_EXHAUSTED")) {
    return `Créditos de ${provider} agotados. Recargalos en tu cuenta de Google AI Studio.`;
  }
  if (raw.includes("No Inference Provider available")) {
    return `Hugging Face: no hay proveedor disponible para este modelo. Probá texto sin imagen base.`;
  }
  if (raw.includes("not supported for provider")) {
    const match = raw.match(/Task '([^']+)' not supported/);
    const task = match ? match[1] : "esta tarea";
    return `Hugging Face: el proveedor seleccionado no soporta "${task}". Intentá con otro modelo o sin imagen base.`;
  }
  if (raw.includes("401") || raw.includes("Unauthorized") || raw.includes("Invalid API key")) {
    return `API Key de ${provider} inválida o expirada. Verificala en Ajustes.`;
  }
  if (raw.includes("429") || raw.includes("rate limit") || raw.includes("too many requests")) {
    return `Límite de solicitudes de ${provider} alcanzado. Esperá unos minutos.`;
  }
  return `Error de ${provider}: ${raw.slice(0, 200)}`;
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ProviderError) {
    const rawDetail = error.cause?.message || error.message || "Error del proveedor";
    console.error(`⚠️ Error de proveedor [${error.providerName}]:`, rawDetail);

    const friendlyMessage = parseProviderError(error.providerName, rawDetail);
    return res.status(502).json({
      error: friendlyMessage,
      provider: error.providerName,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }

  console.error("❌ Error no controlado:", error);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: "Error interno del servidor.",
  });
}
