import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        pd: {
          border: "var(--pd-border)",
          text: "var(--pd-text)",
          muted: "var(--pd-muted)",
          panel: "var(--pd-panel-bg)",
          accent: "var(--pd-accent-text)",
        },
      },
      borderRadius: {
        pd: "var(--pd-radius-control)",
      },
    },
  },
} satisfies Config;
