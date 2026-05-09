import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const envDir = fileURLToPath(new URL(".", import.meta.url));
  const env = loadEnv(mode, envDir, "");
  /** Local backend from backend/.env.example (PORT=5050). Override with VITE_PROXY_TARGET. */
  const apiTarget =
    env.VITE_PROXY_TARGET?.trim() || "http://127.0.0.1:5050";

  const apiProxy = {
    "/api": {
      target: apiTarget,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
    /** Local post images/videos when not using Cloudinary */
    "/uploads": {
      target: apiTarget,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: { ...apiProxy },
    },
    /** Without this, `npm run preview` sends `/api/*` to the static server and requests fail. */
    preview: {
      port: 5174,
      proxy: { ...apiProxy },
    },
  };
});
