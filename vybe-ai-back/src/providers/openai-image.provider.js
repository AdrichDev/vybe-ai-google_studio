import { PROVIDER_SOURCE } from "../config/http.js";
import { ProviderError } from "../errors/provider-error.js";

const BASE_URL = "https://api.openai.com/v1";

function openaiJsonHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function openaiAuthHeader(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}

// Mapeo de quality UI → parámetro real por modelo
function resolveQualityParam(model, quality) {
  // gpt-image-1 y gpt-image-2 soportan quality
  if (model.startsWith("gpt-image-")) {
    if (quality === "ultra") return "high";
    if (quality === "fast") return "low";
    return "medium";
  }
  return undefined;
}

// Modelos que soportan el endpoint nativo de edición (/v1/images/edits)
const SUPPORTS_NATIVE_EDIT = new Set(["gpt-image-1", "gpt-image-1-mini", "gpt-image-2"]);

async function callGenerationsEndpoint({ model, prompt, size, qualityParam, apiKey }) {
  const body = {
    model,
    prompt,
    n: 1,
    size,
    ...(qualityParam && { quality: qualityParam }),
  };
  return fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: openaiJsonHeaders(apiKey),
    body: JSON.stringify(body),
  });
}

export async function generateOpenAiImage({ prompt, size, model = "gpt-image-1", quality = "pro", apiKey }) {
  try {
    console.log(`[VYBE AI · OpenAI] Generando imagen con ${model}, prompt: "${prompt}"`);

    const qualityParam = resolveQualityParam(model, quality);

    const response = await callGenerationsEndpoint({ model, prompt, size, qualityParam, apiKey });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const imageB64 = data.data?.[0]?.b64_json;

    if (imageB64) {
      console.log(`[VYBE AI · OpenAI] ¡Éxito! Imagen generada por ${model}.`);
      return {
        imageUrl: `data:image/png;base64,${imageB64}`,
        source: PROVIDER_SOURCE.OPENAI,
      };
    }

    const imageUrl = data.data?.[0]?.url;
    if (imageUrl) {
      return { imageUrl, source: PROVIDER_SOURCE.OPENAI };
    }

    throw new Error("Estructura de respuesta inesperada de OpenAI.");
  } catch (error) {
    throw new ProviderError("OpenAI", error.message, error);
  }
}

export async function editOpenAiImage({ prompt, imageFile, model = "dall-e-3", size, quality = "pro", apiKey }) {
  try {
    console.log(`[VYBE AI · OpenAI] Editando imagen con ${model}, prompt: "${prompt}"`);

    // dall-e-3 no tiene endpoint de edición nativo → GPT-4o-mini analiza y DALL-E 3 genera
    if (!SUPPORTS_NATIVE_EDIT.has(model)) {
      return editViaVisionAndGenerate({ prompt, imageFile, model, size, quality, apiKey });
    }

    // dall-e-2 y gpt-image-1 → /v1/images/edits con multipart
    const imageBlob = new Blob([imageFile.buffer], { type: "image/png" });
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("image", imageBlob, "image.png");
    form.append("n", "1");
    form.append("size", size);

    const qualityParam = resolveQualityParam(model, quality);
    if (qualityParam) form.append("quality", qualityParam);

    const response = await fetch(`${BASE_URL}/images/edits`, {
      method: "POST",
      headers: openaiAuthHeader(apiKey),
      body: form,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const imageB64 = data.data?.[0]?.b64_json;

    if (imageB64) {
      console.log(`[VYBE AI · OpenAI] ¡Éxito! Imagen editada por ${model}.`);
      return {
        imageUrl: `data:image/png;base64,${imageB64}`,
        source: PROVIDER_SOURCE.OPENAI,
      };
    }

    const imageUrl = data.data?.[0]?.url;
    if (imageUrl) return { imageUrl, source: PROVIDER_SOURCE.OPENAI };

    throw new Error("Estructura de respuesta inesperada en edición de OpenAI.");
  } catch (error) {
    throw new ProviderError("OpenAI (edit)", error.message, error);
  }
}

// DALL-E 3 no tiene edit API: GPT-4o-mini analiza la imagen base y genera un prompt enriquecido
async function editViaVisionAndGenerate({ prompt, imageFile, model, size, quality, apiKey }) {
  const imageB64 = imageFile.buffer.toString("base64");
  const mimeType = imageFile.mimetype || "image/jpeg";

  const gptResponse = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: openaiJsonHeaders(apiKey),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Eres un director de arte experto. El usuario quiere transformar esta imagen según la instrucción: "${prompt}". Analiza la composición, paleta y estilo de la imagen original. Escribe un nuevo prompt en inglés, completo y detallado, que describa el resultado final de la edición. Mantén todos los elementos visuales del original salvo que la instrucción los cambie explícitamente. Devuelve ÚNICAMENTE el prompt final, sin introducción ni markdown.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageB64}` },
            },
          ],
        },
      ],
      max_tokens: 350,
    }),
  });

  if (!gptResponse.ok) {
    const errData = await gptResponse.json().catch(() => ({}));
    throw new Error(`GPT-4o-mini vision falló: ${errData?.error?.message || gptResponse.statusText}`);
  }

  const gptData = await gptResponse.json();
  const refinedPrompt = gptData.choices?.[0]?.message?.content?.trim();

  if (!refinedPrompt) throw new Error("GPT-4o-mini no devolvió prompt enriquecido.");

  console.log(`[VYBE AI · OpenAI] Prompt enriquecido por GPT-4o-mini. Generando con ${model}...`);
  return generateOpenAiImage({ prompt: refinedPrompt, size, model, quality, apiKey });
}
