import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { ProviderError } from "../errors/provider-error.js";

function createClient(apiKey) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

export async function startVeoVideoGeneration({ apiKey, prompt, aspectRatio = "16:9", resolution, imageFile = null }) {
  try {
    const mode = imageFile ? "imagen→video" : "texto→video";
    console.log(`[VYBE AI · Veo] Iniciando ${mode} — prompt: "${prompt}" — resolución: ${resolution ?? "720p (default)"}`);

    const ai = createClient(apiKey);

    const request = {
      model: "veo-3.1-lite-generate-preview",
      prompt,
      config: { numberOfVideos: 1, resolution: resolution ?? "720p", aspectRatio },
    };

    if (imageFile) {
      request.image = {
        imageBytes: imageFile.buffer.toString("base64"),
        mimeType: imageFile.mimetype || "image/jpeg",
      };
    }

    const operation = await ai.models.generateVideos(request);

    console.log(`[VYBE AI · Veo] Job iniciado — operación: ${operation.name}`);
    return { operationName: operation.name };
  } catch (error) {
    throw new ProviderError("Google Veo", error.message, error);
  }
}

export async function pollVeoVideoGeneration({ apiKey, operationName }) {
  try {
    const ai = createClient(apiKey);

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return { done: false };
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return { done: true };
    }

    // Descargar el video binario con la API key en el header
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Error al descargar el video de Google: HTTP ${videoRes.status}`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    console.log("[VYBE AI · Veo] ¡Éxito! Video descargado y convertido a base64.");
    return {
      done: true,
      videoUrl: `data:video/mp4;base64,${base64}`,
    };
  } catch (error) {
    throw new ProviderError("Google Veo (poll)", error.message, error);
  }
}
