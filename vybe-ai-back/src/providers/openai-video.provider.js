import { ProviderError } from "../errors/provider-error.js";

const BASE_URL = "https://api.openai.com/v1";
const POLL_INTERVAL_MS = 15_000;
const MAX_POLLS = 40; // 40 × 15s = 10 minutos máximo

function openaiHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function createVideoJob({ apiKey, prompt, model, size, seconds }) {
  const response = await fetch(`${BASE_URL}/videos`, {
    method: "POST",
    headers: openaiHeaders(apiKey),
    body: JSON.stringify({ model, prompt, size, seconds }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Error HTTP ${response.status} al crear job`);
  }

  const data = await response.json();
  return data.id; // videoId
}

async function pollVideoJob(videoId, apiKey) {
  let polls = 0;

  while (polls < MAX_POLLS) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    polls++;

    const response = await fetch(`${BASE_URL}/videos/${videoId}`, {
      headers: openaiHeaders(apiKey),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al consultar estado del job`);
    }

    const data = await response.json();
    console.log(`[VYBE AI · Sora] Job ${videoId} — estado: ${data.status} (poll ${polls}/${MAX_POLLS})`);

    if (data.status === "completed") return data;
    if (data.status === "failed") {
      throw new Error(`Job de video falló: ${data.error?.message || "sin detalles"}`);
    }
    // queued / in_progress → seguir esperando
  }

  throw new Error(`Timeout: el job ${videoId} no completó en 10 minutos`);
}

async function downloadVideoBuffer(videoId, apiKey) {
  const response = await fetch(`${BASE_URL}/videos/${videoId}/content?variant=video`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al descargar el video`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateSoraVideo({ apiKey, prompt, model, size, seconds, profile }) {
  try {
    console.log(`[VYBE AI · Sora] Creando job — modelo: ${model}, tamaño: ${size}, duración: ${seconds}s`);

    const videoId = await createVideoJob({ apiKey, prompt, model, size, seconds });
    console.log(`[VYBE AI · Sora] Job creado: ${videoId} — esperando completación...`);

    await pollVideoJob(videoId, apiKey);
    console.log(`[VYBE AI · Sora] Job ${videoId} completado. Descargando MP4...`);

    const buffer = await downloadVideoBuffer(videoId, apiKey);
    console.log(`[VYBE AI · Sora] ¡Éxito! MP4 de ${(buffer.length / 1024 / 1024).toFixed(1)} MB descargado`);

    return {
      buffer,
      metadata: { videoId, model, size, seconds, profile, source: "openai_video_api" },
    };
  } catch (error) {
    throw new ProviderError("OpenAI Sora", error.message, error);
  }
}
