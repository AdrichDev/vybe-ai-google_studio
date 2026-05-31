import { generateTestPrompt } from "../providers/google-text.provider.js";

export async function generateTestPromptService(request) {
  return generateTestPrompt(request);
}
