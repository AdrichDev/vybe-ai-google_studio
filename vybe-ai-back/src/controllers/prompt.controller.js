import { resolveTestPromptRequest } from "../dto/generate-test-prompt.dto.js";
import { generateTestPromptService } from "../services/prompt-generation.service.js";

export async function generateTestPromptController(req, res, next) {
  try {
    const request = resolveTestPromptRequest(req.body);
    const result = await generateTestPromptService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
