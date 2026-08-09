import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export function resolveDeploymentBase(environment = process.env) {
  const configuredBase = environment.VITE_BASE_URL;
  if (typeof configuredBase === "string" && configuredBase.trim()) {
    const normalizedBase = configuredBase.trim().replace(/^\/+|\/+$/g, "");
    return normalizedBase ? `/${normalizedBase}/` : "/";
  }

  const repository = environment.GITHUB_REPOSITORY;
  if (environment.GITHUB_ACTIONS !== "true" || typeof repository !== "string") {
    return "/";
  }

  const [, repositoryName] = repository.split("/");
  return repositoryName ? `/${repositoryName}/` : "/";
}

export default defineConfig({
  base: resolveDeploymentBase(),
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
    outDir: "demo-dist",
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
