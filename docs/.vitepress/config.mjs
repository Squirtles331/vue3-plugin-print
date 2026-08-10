import { defineConfig } from "vitepress";

function resolveBase() {
  const configuredBase = process.env.VITEPRESS_BASE || process.env.VITE_BASE_URL;
  if (typeof configuredBase === "string" && configuredBase.trim()) {
    const normalizedBase = configuredBase.trim().replace(/^\/+|\/+$/g, "");
    return normalizedBase ? `/${normalizedBase}/` : "/";
  }

  return "/";
}

export default defineConfig({
  title: "Print Template Studio",
  description: "Vue 3 visual print-template designer",
  lang: "zh-CN",
  base: resolveBase(),
  srcExclude: [
    "releases/**",
    "browser-print-acceptance.md",
    "commercial-edition.md",
    "commercial-independence-audit.md",
    "property-support-matrix.md",
    "release-checklist.md",
    "release-validation.md",
    "runtime-contract.md",
  ],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "API", link: "/api/component" },
      { text: "Examples", link: "/examples/repository" },
      { text: "Playground", link: "/playground" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Quick Start", link: "/guide/quick-start" },
          { text: "Usage", link: "/guide/usage" },
        ],
      },
      {
        text: "API",
        items: [
          { text: "Component API", link: "/api/component" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Repository", link: "/examples/repository" },
        ],
      },
      {
        text: "Live",
        items: [
          { text: "Playground", link: "/playground" },
        ],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/Squirtles331/vue3-plugin-print" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright 2026 songTongxue",
    },
    editLink: {
      pattern: "https://github.com/Squirtles331/vue3-plugin-print/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    lastUpdated: {
      text: "Last updated",
    },
    outline: {
      level: [2, 3],
      label: "On this page",
    },
    docFooter: {
      prev: "Previous page",
      next: "Next page",
    },
    darkModeSwitchLabel: "Appearance",
    lightModeSwitchTitle: "Switch to light theme",
    darkModeSwitchTitle: "Switch to dark theme",
    sidebarMenuLabel: "Menu",
    returnToTopLabel: "Return to top",
  },
});
