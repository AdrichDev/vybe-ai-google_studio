import { generateSoraVideo } from "../providers/openai-video.provider.js";
import { startVeoVideoGeneration, pollVeoVideoGeneration } from "../providers/google-video.provider.js";

export async function generateSoraVideoService(request) {
  return generateSoraVideo(request);
}

export async function startVeoVideoService(request) {
  return startVeoVideoGeneration(request);
}

export async function pollVeoVideoService(request) {
  return pollVeoVideoGeneration(request);
}
