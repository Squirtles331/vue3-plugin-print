# 打印模板工作台

<p align="center">Vue 3 可嵌入打印设计器 · 内置 UI · JSON 数据绑定 · 浏览器原生打印</p>

`@squirtles331/vue3-plugin-print` 是一个独立实现的 Vue 3 可视化打印模板设计器。业务项目安装后即可嵌入完整编辑器，保存 `TemplateDocument v1` 模板、绑定业务 JSON，并通过浏览器原生打印流程输出。

> **当前实现：** 项目已经移除第三方 UI 组件库依赖。按钮、弹窗、标签页、表单控件、反馈提示和图标都由仓库内的 `src/print-designer/ui` primitives 提供；宿主项目不需要安装 Element Plus、Ant Design Vue、Naive UI 等 UI 组件库。

> **首发范围：** 支持最新桌面版 Chrome 与 Edge；不提供 PDF/图片导出、静默/云打印、Vue 2、Web Component 或服务端渲染。

<p align="center">
  <a href="https://squirtles331.github.io/vue3-plugin-print/">在线演示</a> ·
  <a href="docs/index.md">完整文档</a> ·
  <a href="#安装与注册">安装</a> ·
  <a href="#组件使用">组件使用</a> ·
  <a href="#仓储与多实例">仓储与多实例</a> ·
  <a href="#浏览器打印">浏览器打印</a> ·
  <a href="#参与贡献">参与贡献</a>
</p>

## 项目特性

- **无第三方 UI 组件库依赖：** 设计器 UI 使用项目内置 primitives，不污染宿主应用的组件库、主题变量或全局样式。
- **页面设计：** 支持预设/自定义纸张、方向、边距、背景、打印标记、网格、标尺和辅助对齐。
- **元素编辑：** 支持文本、图片、表格、条码、二维码、页码、直线、矩形、圆形和多标签。
- **设计工作流：** 支持拖拽、缩放、层级、锁定、对齐/分布、撤销/重做、元素预设和起始模板。
- **数据绑定：** 一个 JSON 对象驱动文本、图片、条码、二维码、表格和标签网格，路径支持 `customer.name`、`items[0].sku` 等格式。
- **模板管理：** 使用 `TemplateDocument v1` 作为持久化格式，支持校验、迁移、本地保存、导入/导出与可替换仓储。
- **打印运行时：** 预览与浏览器打印共用运行时渲染、分页和预检结果；打印 iframe 不包含选择框、辅助线或编辑器控件。

## 安装与注册

宿主项目需要 Vue `^3.5`。本包会携带 Pinia、CodeMirror、条码和二维码等运行依赖，但不会要求宿主安装任何第三方 UI 组件库。

```bash
npm install @squirtles331/vue3-plugin-print
```

在入口注册插件并引入样式：

```js
import { createApp } from "vue";
import App from "./App.vue";
import PrintTemplateStudioPlugin from "@squirtles331/vue3-plugin-print";
import "@squirtles331/vue3-plugin-print/style.css";

createApp(App).use(PrintTemplateStudioPlugin).mount("#app");
```

插件会注册 `PrintTemplateStudio` 和设计器内部 UI 组件。包仅能在浏览器中挂载；Nuxt/SSR 项目请放在客户端组件内。

## 组件使用

```vue
<script setup>
import { ref } from "vue";

const template = ref();
const runtimeData = ref({
  order: { number: "SO-20260810" },
  customer: { name: "示例客户" },
  items: [{ sku: "A-100", name: "标签纸", quantity: 2 }],
});
const designer = ref();

function handleError({ scope, error, message }) {
  console.error(scope, message, error);
}
</script>

<template>
  <PrintTemplateStudio
    ref="designer"
    v-model:template="template"
    v-model:runtime-data="runtimeData"
    storage-key="sales-order-template"
    :height="760"
    @error="handleError"
  />
</template>
```

| 接口 | 说明 |
| --- | --- |
| `v-model:template` | 接收并输出规范化后的 `TemplateDocument v1`。 |
| `v-model:runtime-data` | 预览和打印使用的 JSON 数据；预览面板修改后会回写。 |
| `repository` | 可选模板仓储，覆盖默认浏览器本地存储。 |
| `storage-key` | 默认本地仓储的命名空间；同页多实例必须使用不同值。 |
| `height` | 编辑器高度，默认 `720px`，宽度自动填满宿主容器。 |
| `print-policy` | 严格打印预检策略，默认阻止不完整数据、空图片/码和越出安全边距的元素；仅在需要时传入 `{ allowIncomplete: true }` 放行。 |
| `template-change` | 模板内容变化时触发。 |
| `error` | 仓储、模板校验或打印预检失败时触发，载荷为 `{ scope, error, message }`。 |
| `ready` | 编辑器实例挂载完成后触发。 |

组件 ref 提供以下方法：

| 方法 | 说明 |
| --- | --- |
| `loadTemplateDocument(document)` | 加载并校验模板文档。 |
| `getTemplateDocument()` | 获取当前模板校验结果。 |
| `getPublishReadyTemplatePayload()` | 获取适合保存到业务系统的发布载荷。 |
| `setRuntimeData(data)` | 设置预览和打印数据。 |
| `print(data?)` | 使用当前模板和传入数据执行浏览器打印。 |
| `whenReady()` | 返回编辑器挂载完成后的 Promise，适合需要在挂载前协调实例调用的宿主。 |

## 仓储与多实例

未提供 `repository` 时，模板和元素预设保存到当前浏览器的本地存储。单个设计器可以省略 `storage-key`；同一页面多个持久化实例必须使用不同键，避免模板库和预设库互相可见。

```js
import { createRestTemplateRepository } from "@squirtles331/vue3-plugin-print";

const repository = createRestTemplateRepository({
  baseUrl: "https://api.example.com/print",
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});
```

仓储适配器需要提供 `list()`、`get(id)`、`save(document)` 和 `delete(id)`。内置本地与 REST 仓储还提供 `create()`，用于在前端生成空白模板草稿；持久化使用 `GET /templates`、`GET /templates/:id`、`PUT /templates/:id` 与 `DELETE /templates/:id`。`clear()` 是本地仓储专用的可选能力。

也可导入 `createLocalTemplateRepository`、`validateTemplateDocument`、`serializeTemplateDocument` 和 `createPublishReadyTemplatePayload`，用于业务系统的模板管理流程。模板仅接受并输出 `TemplateDocument v2`；导入、读取或传入其他版本会被拒绝，不提供自动迁移或兼容层。

## 浏览器打印

- 工具栏打印和组件 `print(data?)` 会执行同一套预检：模板结构错误和不支持的运行时规则会阻止打印，并通过 `error` 事件返回问题信息。
- 缺失的文本、图片、条码、二维码、表格或多标签绑定会作为预览/打印提示展示；运行时不会回退到设计时示例数据。
- 预览中应先检查变量缺失、图片、条码、二维码与长表格分页。
- 原生打印对话框中使用 100%/实际大小，并关闭浏览器页眉页脚。
- 图片 URL 必须可由浏览器访问；无效图片会显示占位或错误状态。
- 打印机不可打印边距和实际尺寸仍需在目标设备上校准。

## 本地开发与发布

```bash
npm ci
npm run dev             # 启动 GitHub Pages 演示应用
npm run build:demo      # 构建演示站到 demo-dist/
npm run build:library   # 构建 npm 包到 dist/
npm run verify          # 完整校验
```

维护者在 GitHub 仓库 Secrets 中配置 `NPM_TOKEN` 后，推送与 `package.json` 版本一致的 `vX.Y.Z` 标签即可通过 GitHub Actions 发布公开包。

## 开源与来源边界

本仓库以 [MIT](LICENSE) 发布，仅覆盖仓库中可独立授权的代码、文案、模板与资产。项目 UI 已由内部 primitives 实现，能力类别参考不等于复制其他项目的代码、品牌、素材、样式或模板。第三方运行依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 参与贡献

提交 [Issue](https://github.com/Squirtles331/vue3-plugin-print/issues) 或 Pull Request 前，请阅读 [贡献指南](CONTRIBUTING.md)、[安全策略](SECURITY.md) 和 [发布检查清单](docs/release-checklist.md)。

---

## English Quick Start

```bash
npm install @squirtles331/vue3-plugin-print
```

```js
import PrintTemplateStudioPlugin from "@squirtles331/vue3-plugin-print";
import "@squirtles331/vue3-plugin-print/style.css";

app.use(PrintTemplateStudioPlugin);
```

Render `<PrintTemplateStudio v-model:template="template" v-model:runtime-data="runtimeData" />`. The package targets Vue 3.5+ and browser-native printing in current desktop Chrome / Edge. It does not require Element Plus or any other third-party UI component library. PDF/image export, silent/cloud printing, Vue 2, Web Components, and SSR are outside the first release scope.
