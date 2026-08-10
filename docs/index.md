---
layout: home

hero:
  name: Print Template Studio
  text: 面向业务系统的可视化打印模板设计器
  tagline: 基于 Vue 3、Element Plus 和浏览器原生打印，支持模板设计、JSON 绑定、预览与发布。
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/quick-start
    - theme: alt
      text: 打开 Playground
      link: /playground

features:
  - title: 基于 Element Plus
    details: 以业务后台的常见交互为中心，提供画布、面板、图层、属性与预览工作流。
  - title: TypeScript 友好
    details: 插件注册、组件绑定、仓储和导出接口都可以按现有项目方式逐步集成。
  - title: 文档和示例
    details: 站点按安装、组件、仓储与 Playground 组织，适合团队直接查阅和落地。
---

## 你会得到什么

Print Template Studio 适合订单、标签、出库单、质检单等需要频繁输出纸质内容的业务场景。
它把模板 authoring、运行时数据绑定、浏览器预览和原生打印放在同一个工作流里。

## 核心能力

- 页面纸张、方向、边距、背景、网格和辅助对齐
- 文本、图片、表格、条码、二维码、页码、直线、矩形、圆形和多标签
- 拖拽、缩放、层级、锁定、复制、对齐、分布、撤销和重做
- TemplateDocument v1 校验、迁移、导入、导出和发布载荷生成
- 本地模板库与可替换的 REST 仓储

## 快速入口

```bash
npm install @squirtles331/vue3-plugin-print
```

```js
import { createApp } from "vue";
import PrintTemplateStudioPlugin from "@squirtles331/vue3-plugin-print";
import "@squirtles331/vue3-plugin-print/style.css";

createApp(App).use(PrintTemplateStudioPlugin).mount("#app");
```
