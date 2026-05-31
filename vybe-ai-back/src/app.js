import express from "express";
import cors from "cors";
import imageRoutes from "./routes/image.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", imageRoutes);
  app.use(errorHandler);

  return app;
}
