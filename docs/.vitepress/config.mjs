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
  title: "打印模板工作台",
  description: "基于 Vue 3 的可视化打印模板设计器",
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
      { text: "组件", link: "/guide/quick-start" },
      { text: "工具", link: "/guide/comparison" },
      { text: "演示", link: "/playground" },
      { text: "v0.1.0", link: "/releases/v0.1.0" },
    ],
    sidebar: [
      {
        text: "使用指南",
        items: [
          { text: "快速开始", link: "/guide/quick-start" },
          { text: "组件使用", link: "/guide/usage" },
          { text: "选型对比", link: "/guide/comparison" },
        ],
      },
      {
        text: "接口说明",
        items: [{ text: "组件接口", link: "/api/component" }],
      },
      {
        text: "使用示例",
        items: [{ text: "仓储示例", link: "/examples/repository" }],
      },
      {
        text: "在线演示",
        items: [{ text: "演示区", link: "/playground" }],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/Squirtles331/vue3-plugin-print" },
    ],
    footer: {
      message: "开源协议：MIT",
      copyright: "Copyright 2026 songTongxue",
    },
    editLink: {
      pattern: "https://github.com/Squirtles331/vue3-plugin-print/edit/master/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    lastUpdated: {
      text: "最后更新",
    },
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
  },
});
