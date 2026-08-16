# 选型对比

市面上的打印方案大致可以分成三类：打印设计器、DOM 打印插件、PDF/报表生成工具。它们都能解决一部分问题，但关注点不同。

打印模板工作台更适合 Vue 3 业务系统里的模板化打印：业务人员在前端维护模板，系统保存模板文档，运行时注入订单、标签、出库单等业务数据，再通过同一套运行时完成预览和浏览器打印。

## 常见插件和方案

| 方案 | 类型 | 典型用途 | 选型提示 |
| --- | --- | --- | --- |
| [`vue-plugin-hiprint`](https://github.com/CcSimple/vue-plugin-hiprint) | hiprint 工具库 | 基于 hiprint API 组装设计器、模板和打印链路 | 生态成熟，适合已有 hiprint 模板或需要打印客户端的项目；UI 和业务集成通常需要项目自行组织。 |
| [`sv-print`](https://ccsimple.github.io/sv-print-docs/) | 打印设计器组件 | 基于 hiprint 的现成设计器，提供 Svelte、Vue、React 等接入包 | 上手快，适合希望直接使用设计器组件的项目；如果团队需要独立模板模型、内置 UI 和自有仓储接口，需要再评估贴合度。 |
| [`vue3-print-nb`](https://www.npmjs.com/package/vue3-print-nb) / [`vue-print-nb`](https://www.npmjs.com/package/vue-print-nb) | Vue 打印指令 | 打印整页、局部 DOM 或指定 URL | 轻量直接，适合页面已经排好版、只差触发打印的场景；不负责模板设计、模板仓储和复杂版式编辑。 |
| [`vue-print-next`](https://www.npmjs.com/package/vue-print-next) | Vue 打印指令/方法 | Vue 2 / Vue 3 内容打印、打印预览、忽略指定元素 | 核心仍是 DOM 打印，不是模板设计器。 |
| [`vue-to-print`](https://www.npmjs.com/package/vue-to-print) | Vue 3 组件打印工具 | 打印某个 Vue 组件内容，API 思路接近 `react-to-print` | 适合组件内容打印，关注样式复制和打印窗口；不提供可视化模板设计。 |
| [`print-js`](https://www.npmjs.com/package/print-js) | 通用 JavaScript 打印库 | 打印 PDF、HTML、图片或 JSON 数据 | 与框架无关，适合已有内容的快速打印；如果需要业务人员维护模板，需要额外建设编辑器和数据模型。 |
| [`vue-html-to-paper`](https://github.com/mycure-inc/vue-html-to-paper) | Vue HTML 打印插件 | 把 HTML 元素输出到打印窗口 | 适合简单 HTML 打印；Vue 3 适配和维护活跃度需要单独评估。 |
| [`vue-easy-print`](https://www.npmjs.com/package/vue-easy-print) | Vue 打印组件 | 通过 Vue slot 渲染打印模板，再复制到 iframe 打印 | 适合用组件模板组织打印内容；模板仍主要由开发者编写，不是面向业务人员的可视化设计。 |
| [`pdfmake`](https://www.npmjs.com/package/pdfmake) / [`jsPDF`](https://www.npmjs.com/package/jspdf) / [`html2pdf.js`](https://github.com/ekoopmans/html2pdf.js) | PDF 生成工具 | 前端或后端生成 PDF，用于下载、归档或再打印 | 适合以文件交付为中心的流程；如果目标是在线调整纸张、标签、图层和数据绑定，需要额外开发模板设计能力。 |

## 与通用方案相比

| 常见方案 | 常见问题 | 打印模板工作台的做法 |
| --- | --- | --- |
| 直接拿页面 DOM 打印 | 布局、数据、打印逻辑混在一起，模板难复用 | 把模板独立成 `TemplateDocument v2`，运行时只负责业务数据 |
| 只做 PDF/图片导出 | 预览和打印不是同一条链路，实际打印效果容易偏差 | 预览和浏览器打印共用同一套运行时渲染 |
| 只有简单拖拽编辑器 | 能画但难管理模板、版本和仓储 | 提供模板库、元素预设、本地仓储和 REST 仓储 |
| 只做表单式配置 | 复杂版式、分页、表格和标签网格不好处理 | 提供标尺、图层、对齐、分页、表格、标签网格和页码 |

## 本项目的差异点

| 维度 | 打印模板工作台的重点 |
| --- | --- |
| 技术栈 | 面向 Vue 3.5+ 业务应用，编辑器 UI 由内部 primitives 实现，不依赖第三方 UI 组件库 |
| 模板模型 | 使用 `TemplateDocument v2` 保存模板结构，支持校验、导入、导出和发布载荷生成；旧版本不会自动迁移 |
| 运行时 | 预览和打印共用同一套运行时渲染、分页和预检，减少预览正常但打印偏差的问题 |
| 仓储 | 默认支持本地模板库，也提供可替换的 REST 仓储接口 |
| 业务扩展 | 围绕订单、标签、条码、出库单、质检单等高频业务打印场景组织能力 |

## 怎么选

如果只是打印一个已经排版好的页面，优先考虑 `vue-print-next`、`vue3-print-nb`、`vue-to-print` 或 `print-js` 这类轻量方案。

如果已经有 hiprint 模板资产、打印客户端或团队熟悉 hiprint，可以优先评估 `vue-plugin-hiprint` 和 `sv-print` 的接入成本。

如果目标是在 Vue 3 后台系统里做一个可持续维护的打印模板模块，并且需要模板库、属性面板、运行时数据绑定、预览和打印统一链路，打印模板工作台会更贴近这个目标。
