import { GoogleGenAI } from "@google/genai";
import { ProviderError } from "../errors/provider-error.js";

const SYSTEM_INSTRUCTIONS = {
  photo: "Eres un director de arte creativo especializado en fotografía editorial y moda. Tu tarea es generar prompts creativos y concisos para generación de imágenes con IA.",
  video: "Eres un director creativo cinematográfico. Tu tarea es generar prompts creativos y concisos para generación de video con IA.",
};

function buildUserPrompt({ mode, platform, aspectRatio, provider }) {
  const platformCtx = platform ? `Plataforma de destino: ${platform}.` : "";
  const ratioCtx = aspectRatio ? `Relación de aspecto: ${aspectRatio}.` : "";
  const providerCtx = provider === "huggingface" ? "El modelo es FLUX.1-schnell, especializado en renderizado fotorrealista." : "";

  return `Genera un único prompt creativo en español para generación de ${mode === "photo" ? "imagen" : "video"} con IA.
${platformCtx} ${ratioCtx} ${providerCtx}

Reglas:
- Devuelve ÚNICAMENTE el texto del prompt, sin explicaciones ni comillas.
- Máximo 2 frases, directo y específico.
- Incluye detalles de iluminación, estilo visual y composición.
- No uses markdown.`;
}

function createClient(apiKey) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

export async function generateTestPrompt({ apiKey, mode, platform, aspectRatio, provider }) {
  try {
    console.log(`[VYBE AI · Prompt] Generando prompt de prueba para modo "${mode}"`);

    const ai = createClient(apiKey);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserPrompt({ mode, platform, aspectRatio, provider }),
      config: { systemInstruction: SYSTEM_INSTRUCTIONS[mode] },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Respuesta vacía de Gemini");

    console.log(`[VYBE AI · Prompt] ¡Éxito! Prompt generado: "${text.slice(0, 60)}..."`);

    return { prompt: text, source: "google_api" };
  } catch (error) {
    throw new ProviderError("Google AI (texto)", error.message, error);
  }
}
