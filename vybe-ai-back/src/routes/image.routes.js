import { Router } from "express";
import {
  generateGoogleImageController,
  generateHuggingFaceImageController,
  generateOpenAiImageController,
  editOpenAiImageController,
} from "../controllers/image.controller.js";
import { generateTestPromptController } from "../controllers/prompt.controller.js";
import { generateOpenAiVideoController, generateGoogleVideoController, pollGoogleVideoController } from "../controllers/video.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Imagen — generación texto
router.post("/generar-imagen",        upload.single("image"), generateGoogleImageController);
router.post("/generar-imagen-openai", generateOpenAiImageController);
router.post("/generar-imagen-hf",     upload.single("image"), generateHuggingFaceImageController);

// Imagen — edición con imagen base
router.post("/editar-imagen-openai",  upload.single("image"), editOpenAiImageController);

// Utilidades
router.post("/generar-prompt-prueba", generateTestPromptController);

// Video
router.post("/generar-video-openai",        generateOpenAiVideoController);
router.post("/generar-video-google",         upload.single("image"), generateGoogleVideoController);
router.post("/generar-video-google/status",  pollGoogleVideoController);

export default router;
