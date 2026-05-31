import { resolveVideoRequest, resolveGoogleVideoRequest, resolveVeoPollRequest } from "../dto/generate-video.dto.js";
import { generateSoraVideoService, startVeoVideoService, pollVeoVideoService } from "../services/video-generation.service.js";
import { ProviderError } from "../errors/provider-error.js";
import { AppError } from "../errors/app-error.js";

export async function generateGoogleVideoController(req, res, next) {
  try {
    const request = resolveGoogleVideoRequest(req.body, req.file);
    const result = await startVeoVideoService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function pollGoogleVideoController(req, res, next) {
  try {
    const request = resolveVeoPollRequest(req.body);
    const result = await pollVeoVideoService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function generateOpenAiVideoController(req, res, next) {
  // Deshabilitar timeout del socket para requests de larga duración (polling de hasta 10 min)
  req.socket.setTimeout(0);

  let request;
  try {
    request = resolveVideoRequest(req.body);
  } catch (error) {
    return next(error);
  }

  try {
    const { buffer, metadata } = await generateSoraVideoService(request);

    // Enviar el MP4 como binario con metadata en headers
    res.set({
      "Content-Type": "video/mp4",
      "Content-Length": buffer.length,
      "X-Video-Id": metadata.videoId,
      "X-Video-Model": metadata.model,
      "X-Video-Size": metadata.size,
      "X-Video-Seconds": String(metadata.seconds),
      "X-Video-Source": metadata.source,
    });

    return res.send(buffer);
  } catch (error) {
    if (error instanceof ProviderError) {
      const detail = error.cause?.message || error.message;
      console.error(`⚠️ Error de proveedor [${error.providerName}]:`, detail);
      return res.status(502).json({
        error: `Error del proveedor ${error.providerName}: ${detail}`,
        provider: error.providerName,
      });
    }
    return next(error);
  }
}
