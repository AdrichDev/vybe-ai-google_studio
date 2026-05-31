import { InferenceClient } from "@huggingface/inference";
import { PROVIDER_SOURCE } from "../config/http.js";
import { ProviderError } from "../errors/provider-error.js";

const HF_MODEL_MAP = {
  "flux-schnell": "black-forest-labs/FLUX.1-schnell",
  "flux-dev":     "black-forest-labs/FLUX.1-dev",
  "stable-diffusion-3": "stabilityai/stable-diffusion-3.5-large",
};

const STEPS_MAP = { ultra: 28, pro: 20, fast: 4 };

function creativityToGuidance(creativity) {
  const c = Math.max(0.2, Math.min(1.5, creativity));
  return Math.max(1.0, 10.0 - c * 5.0);
}

function resolveHfModel(modelKey) {
  return HF_MODEL_MAP[modelKey] || HF_MODEL_MAP["flux-schnell"];
}

export async function generateHuggingFaceImage({ prompt, apiKey, imageFile, model = "flux-schnell", quality = "pro", creativity = 0.8 }) {
  try {
    const client = new InferenceClient(apiKey);
    const hfModel = resolveHfModel(model);
    const numSteps = STEPS_MAP[quality] || STEPS_MAP.pro;
    const guidanceScale = creativityToGuidance(creativity);

    if (imageFile) {
      console.log(`[VYBE AI · Hugging Face] Img2Img con FLUX.1-schnell (hf-inference). Prompt: "${prompt}"`);

      const inputBlob = new Blob([imageFile.buffer], { type: imageFile.mimetype || "image/jpeg" });

      try {
        const blob = await client.imageToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          provider: "hf-inference",
          inputs: inputBlob,
          parameters: { prompt, strength: 0.75, num_inference_steps: numSteps },
        });
        return blobToResponse(blob, "Imagen editada por FLUX.1-schnell.");
      } catch {
        // Fallback: text-to-image con prompt enriquecido
        console.warn(`[VYBE AI · Hugging Face] Img2img no disponible, usando text-to-image.`);
        const blob = await client.textToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          provider: "hf-inference",
          inputs: `${prompt}, photorealistic, high quality`,
          parameters: { num_inference_steps: numSteps, guidance_scale: guidanceScale },
        });
        return blobToResponse(blob, "Imagen generada por FLUX.1-schnell (fallback).");
      }
    }

    console.log(`[VYBE AI · Hugging Face] Text-to-Image con ${hfModel} (hf-inference). Prompt: "${prompt}" | Steps: ${numSteps}`);

    const blob = await client.textToImage({
      model: hfModel,
      provider: "hf-inference",
      inputs: prompt,
      parameters: {
        num_inference_steps: numSteps,
        guidance_scale: guidanceScale,
      },
    });

    return blobToResponse(blob, `Imagen generada por ${hfModel}.`);
  } catch (error) {
    throw new ProviderError("Hugging Face", error.message, error);
  }
}

async function blobToResponse(blob, successLog) {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");
  const mimeType = blob.type || "image/jpeg";
  console.log(`[VYBE AI · Hugging Face] ¡Éxito! ${successLog}`);
  return {
    imageUrl: `data:${mimeType};base64,${base64Image}`,
    source: PROVIDER_SOURCE.HUGGING_FACE,
  };
}
