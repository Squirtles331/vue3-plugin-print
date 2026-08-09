import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/element-plus") || id.includes("node_modules/@element-plus")) {
            return "element-plus";
          }
          if (id.includes("node_modules/@codemirror") || id.includes("node_modules/codemirror")) {
            return "editor-code";
          }
          if (id.includes("node_modules/vue/") || id.includes("node_modules/pinia/")) {
            return "framework";
          }
        },
      },
    },
  },
});
