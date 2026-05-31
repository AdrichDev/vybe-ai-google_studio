import { generateGoogleImage } from "../providers/google-image.provider.js";
import { generateOpenAiImage, editOpenAiImage } from "../providers/openai-image.provider.js";
import { generateHuggingFaceImage } from "../providers/huggingface-image.provider.js";

export async function generateGoogleImageService(request) {
  return generateGoogleImage(request);
}

export async function generateOpenAiImageService(request) {
  return generateOpenAiImage(request);
}

export async function editOpenAiImageService(request) {
  return editOpenAiImage(request);
}

export async function generateHuggingFaceImageService(request) {
  return generateHuggingFaceImage(request);
}
