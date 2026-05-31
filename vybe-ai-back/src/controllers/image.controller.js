import {
  resolveGoogleRequest,
  resolveHuggingFaceRequest,
  resolveOpenAiRequest,
  resolveOpenAiEditRequest,
} from "../dto/generate-image.dto.js";
import {
  generateGoogleImageService,
  generateHuggingFaceImageService,
  generateOpenAiImageService,
  editOpenAiImageService,
} from "../services/image-generation.service.js";

export async function generateGoogleImageController(req, res, next) {
  try {
    const request = resolveGoogleRequest(req.body, req.file);
    const result = await generateGoogleImageService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function generateOpenAiImageController(req, res, next) {
  try {
    const request = resolveOpenAiRequest(req.body);
    const result = await generateOpenAiImageService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function editOpenAiImageController(req, res, next) {
  try {
    const request = resolveOpenAiEditRequest(req.body, req.file);
    const result = await editOpenAiImageService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function generateHuggingFaceImageController(req, res, next) {
  try {
    const request = resolveHuggingFaceRequest(req.body, req.file);
    const result = await generateHuggingFaceImageService(request);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
