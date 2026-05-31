import { PROVIDER_SOURCE } from "../config/http.js";

const MOCK_CINEMATIC_IMAGES = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200&auto=format&fit=crop",
];

export function buildProviderFallback(providerName, error) {
  const errorDetails = error?.cause
    ? `${error.message} (Causa: ${error.cause.message || error.cause})`
    : error?.message || "Error desconocido";

  console.error(`⚠️ Error con ${providerName}, activando Fallback:`, errorDetails);

  return {
    imageUrl:
      MOCK_CINEMATIC_IMAGES[
        Math.floor(Math.random() * MOCK_CINEMATIC_IMAGES.length)
      ],
    source: PROVIDER_SOURCE.MOCK,
    note: `Modo simulación activado por error de ${providerName}: ${errorDetails}`,
  };
}
