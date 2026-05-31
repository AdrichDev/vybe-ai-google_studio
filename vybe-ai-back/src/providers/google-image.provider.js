import { GoogleGenAI } from "@google/genai";
import { PROVIDER_SOURCE } from "../config/http.js";
import { ProviderError } from "../errors/provider-error.js";

function createClient(apiKey) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

// Modelos del frontend → modelo real de generación de imágenes vía Gemini API estándar
// imagen-3.0-* requiere Vertex AI; con API key estándar solo funciona gemini-2.0-flash-preview-image-generation
const IMAGE_GEN_MODEL = "gemini-2.0-flash-preview-image-generation";
const IMAGE_EDIT_MODEL = "gemini-2.5-flash-image";

export async function generateGoogleImage({ prompt, apiKey, imageFile = null, model }) {
  const textToImageModel = model && model !== "gemini-2.5-flash" && model !== "imagen-3"
    ? model
    : IMAGE_GEN_MODEL;
  try {
    const ai = createClient(apiKey);

    // === EDICIÓN (img2img) — multimodal vía Gemini ===
    if (imageFile) {
      console.log(`[VYBE AI · Google] Editando imagen con prompt: "${prompt}"`);

      const imageBytes = imageFile.buffer.toString("base64");
      const mimeType = imageFile.mimetype || "image/jpeg";

      const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: {
          parts: [
            { inlineData: { data: imageBytes, mimeType } },
            {
              text: `Perform this visual modification: "${prompt}". Retain the style and elements of the source image perfectly unless instructed.`,
            },
          ],
        },
      });

      // Buscar la parte de imagen en la respuesta
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          console.log("[VYBE AI · Google] ¡Éxito! Imagen editada por Gemini.");
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            source: PROVIDER_SOURCE.GOOGLE,
          };
        }
      }

      // Fallback: regenerar con Gemini Flash Image si no devolvió bytes directos
      const textResult = response.text || "";
      const fallback = await ai.models.generateContent({
        model: IMAGE_GEN_MODEL,
        contents: `${prompt}. ${textResult}`,
        config: { responseModalities: ["IMAGE", "TEXT"] },
      });

      for (const part of fallback.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          console.log("[VYBE AI · Google] ¡Éxito! Imagen editada vía Gemini (fallback).");
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            source: PROVIDER_SOURCE.GOOGLE,
          };
        }
      }

      throw new Error("Gemini no devolvió bytes de imagen en el fallback de edición.");
    }

    // === GENERACIÓN DESDE CERO (text-to-image) — Gemini Flash Image ===
    console.log(`[VYBE AI · Google] Generando imagen con prompt: "${prompt}"`);

    const response = await ai.models.generateContent({
      model: textToImageModel,
      contents: prompt,
      config: { responseModalities: ["IMAGE", "TEXT"] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        console.log("[VYBE AI · Google] ¡Éxito! Imagen generada por Gemini.");
        return {
          imageUrl: `data:${mime};base64,${part.inlineData.data}`,
          source: PROVIDER_SOURCE.GOOGLE,
        };
      }
    }

    throw new Error("Gemini no devolvió bytes de imagen en la respuesta.");
  } catch (error) {
    throw new ProviderError("Google AI", error.message, error);
  }
}
