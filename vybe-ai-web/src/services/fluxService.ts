const HF_FLUX_ENDPOINT =
  'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

const FLUX_STEPS = 4;

export async function generateFluxImage(prompt: string, token: string): Promise<string> {
  if (!token) {
    throw new Error('Token de Hugging Face no configurado. Añadilo en Ajustes → Infraestructura IA y Credenciales.');
  }

  const response = await fetch(HF_FLUX_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        num_inference_steps: FLUX_STEPS,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Hugging Face respondió con error ${response.status}${errorText ? `: ${errorText.slice(0, 200)}` : ''}`
    );
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
