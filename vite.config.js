import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Mermaid is lazy-loaded for article diagrams, but its optional diagram chunks are large.
    chunkSizeWarningLimit: 700,
  },
  plugins: [react()],
});
