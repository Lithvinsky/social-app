import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// FIXED: removed hardcoded URL
const apiTarget = "https://social-app-5sgz.onrender.com";

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

export default defineConfig({
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
});
