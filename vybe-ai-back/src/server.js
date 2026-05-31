import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`🚀 Servidor VYBE AI corriendo en http://localhost:${env.port}`);
});
