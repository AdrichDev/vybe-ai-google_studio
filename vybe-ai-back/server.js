import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { HfInference } from '@huggingface/inference';
import multer from 'multer';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Fix for Windows Node.js native fetch DNS resolution issues (IPv6 vs IPv4)
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// === PROVIDER INITIALIZATION ===
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Premium visual mocks bank
const MOCK_CINEMATIC_IMAGES = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200&auto=format&fit=crop"
];

// Reusable Fallback Utility for Premium Sim Mode
function handleProviderFallback(res, providerName, error) {
  const errorDetails = error.cause ? `${error.message} (Causa: ${error.cause.message || error.cause})` : error.message;
  console.error(`⚠️ Error con ${providerName}, activando Fallback:`, errorDetails);
  
  const randomMockUrl = MOCK_CINEMATIC_IMAGES[Math.floor(Math.random() * MOCK_CINEMATIC_IMAGES.length)];
  return res.json({
    imageUrl: randomMockUrl,
    source: "mock_harness",
    note: `Modo simulación activado por error de ${providerName}: ${errorDetails}`
  });
}

// ─────────────────────────────────────────
// ENDPOINT 1: Google Gemini (Text-to-Image)
// ─────────────────────────────────────────
app.post('/api/generar-imagen', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "El prompt es obligatorio." });

  try {
    console.log(`[VYBE AI · Google] Generando imagen con prompt: "${prompt}"`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseModalities: ['IMAGE'] }
    });

    const base64Image = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Image) {
      const mimeType = response.candidates[0].content.parts[0].inlineData.mimeType || 'image/png';
      console.log("[VYBE AI · Google] ¡Éxito! Imagen generada por Gemini.");
      return res.json({ imageUrl: `data:${mimeType};base64,${base64Image}`, source: "google_api" });
    }

    throw new Error("Estructura de respuesta vacía o inválida de Gemini");
  } catch (error) {
    return handleProviderFallback(res, "Google AI", error);
  }
});

// ─────────────────────────────────────────
// ENDPOINT 2: OpenAI DALL-E 3 (Text-to-Image)
// ─────────────────────────────────────────
app.post('/api/generar-imagen-openai', async (req, res) => {
  const { prompt, size } = req.body;
  if (!prompt) return res.status(400).json({ error: "El prompt es obligatorio." });

  const openaiKey = process.env.APIKEY_OPENAI;
  if (!openaiKey) return res.status(500).json({ error: "APIKEY_OPENAI no configurada." });

  try {
    console.log(`[VYBE AI · OpenAI] Generando imagen DALL-E 3 con prompt: "${prompt}"`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size || '1024x1024',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const imageB64 = data.data?.[0]?.b64_json;
    if (imageB64) {
      console.log("[VYBE AI · OpenAI] ¡Éxito! Imagen generada por DALL-E 3.");
      return res.json({ imageUrl: `data:image/png;base64,${imageB64}`, source: "openai_api" });
    }

    const imageUrl = data.data?.[0]?.url;
    if (imageUrl) return res.json({ imageUrl, source: "openai_api" });

    throw new Error("Estructura de respuesta inesperada de OpenAI");
  } catch (error) {
    return handleProviderFallback(res, "OpenAI", error);
  }
});

// ─────────────────────────────────────────
// ENDPOINT 3: Hugging Face (FLUX.1-dev / Wavespeed)
// ─────────────────────────────────────────
app.post('/api/generar-imagen-hf', upload.single('image'), async (req, res) => {
  const prompt = req.body.prompt;
  const imageFile = req.file;

  if (!prompt) return res.status(400).json({ error: "El prompt es obligatorio." });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: "HF_TOKEN no configurada." });

  try {
    const hf = new HfInference(hfToken);

    if (imageFile) {
      console.log(`[VYBE AI · Hugging Face] Img2Img con FLUX.1-dev (Wavespeed). Prompt: "${prompt}"`);

      // Inferencia Image-to-Image usando la SDK oficial y el proveedor Wavespeed que resuelve por router.huggingface.co
      const blob = await hf.imageToImage({
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: imageFile.buffer,
        provider: 'wavespeed',
        parameters: {
          prompt: prompt
        }
      });

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      const mimeType = blob.type || 'image/jpeg';

      console.log("[VYBE AI · Hugging Face] ¡Éxito! Imagen transformada por FLUX.1-dev Img2Img.");
      return res.json({ imageUrl: `data:${mimeType};base64,${base64Image}`, source: "huggingface_api" });
    } else {
      console.log(`[VYBE AI · Hugging Face] Generando imagen FLUX.1 con prompt: "${prompt}" usando Wavespeed`);

      const blob = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: prompt,
        provider: 'wavespeed'
      });

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      const mimeType = blob.type || 'image/jpeg';

      console.log("[VYBE AI · Hugging Face] ¡Éxito! Imagen generada por FLUX.1.");
      return res.json({ imageUrl: `data:${mimeType};base64,${base64Image}`, source: "huggingface_api" });
    }
  } catch (error) {
    return handleProviderFallback(res, "Hugging Face", error);
  }
});

app.listen(8080, () => console.log('🚀 Servidor VYBE AI corriendo en http://localhost:8080'));