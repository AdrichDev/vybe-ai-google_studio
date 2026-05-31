import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

export const env = {
  port: Number(process.env.PORT || 8080),
  googleApiKey: process.env.GEMINI_API_KEY || "",
  openAiApiKey: process.env.APIKEY_OPENAI || "",
  huggingFaceToken: process.env.HF_TOKEN || "",
};
