import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const clientRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  build: {
    outDir: resolve(clientRoot, "../dist"),
    emptyOutDir: true
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
