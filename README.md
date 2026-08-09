# Print Template Studio

<p align="center">Vue 3 可嵌入打印设计器 · JSON 数据绑定 · 浏览器原生打印</p>

`@squirtles331/vue3-plugin-print` 是一个独立实现的 Vue 3 可视化打印模板设计器。业务项目安装后即可嵌入完整编辑器，保存 `TemplateDocument v1` 模板、绑定业务 JSON，并使用浏览器原生打印流程输出。

> **首发范围：** 支持最新桌面版 Chrome 与 Edge；不提供 PDF/图片导出、静默/云打印、Vue 2 或 Web Component。

<p align="center">
  <a href="https://squirtles331.github.io/vue3-plugin-print/">在线演示</a> ·
  <a href="#安装与注册">安装</a> ·
  <a href="#组件使用">组件使用</a> ·
  <a href="#仓储与多实例">仓储与多实例</a> ·
  <a href="#浏览器打印">浏览器打印</a> ·
  <a href="#参与贡献">参与贡献</a>
</p>

## 已支持的能力

- 页面：预设/自定义纸张、方向、边距、背景、打印标记、网格和辅助对齐。
- 元素：文本、图片、表格、条码、二维码、页码、直线、矩形、圆形和多标签。
- 设计：拖拽、缩放、层级、锁定、对齐/分布、撤销/重做、元素预设和起始模板。
- 数据：一个 JSON 对象驱动文本、图片、条码、二维码、表格和标签网格；支持 `customer.name`、`items[0].sku` 等路径。
- 模板：`TemplateDocument v1` 校验与迁移、本地保存、导入/导出与可替换仓储。
- 输出：预览与浏览器打印共用运行时渲染和分页结果；打印 iframe 不包含选择框、辅助线或编辑器控件。

## 安装与注册

宿主项目需要 Vue `^3.5`。Pinia、Element Plus、图标、条码与二维码依赖由本包安装。

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

插件会注册 `PrintTemplateStudio`、Element Plus 和设计器使用的图标。包仅能在浏览器中挂载；Nuxt/SSR 项目请置于客户端组件内。

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
| `template-change` / `error` | 模板变化与仓储/打印失败事件。 |

组件 ref 提供 `loadTemplateDocument(document)`、`getTemplateDocument()`、`getPublishReadyTemplatePayload()`、`setRuntimeData(data)` 和 `print(data?)`。

## 仓储与多实例

未提供 `repository` 时，模板和元素预设保存到当前浏览器的本地存储。单个设计器可以省略 `storage-key`；同一页面多个持久化实例必须使用不同键，避免模板库和预设库互相可见。

```js
import { createRestTemplateRepository } from "@squirtles331/vue3-plugin-print";

const repository = createRestTemplateRepository({
  baseUrl: "https://api.example.com/print",
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});
```

REST 仓储使用 `GET /templates`、`GET /templates/:id`、`PUT /templates/:id` 与 `DELETE /templates/:id`。`clear()` 是本地仓储专用的可选能力；未实现时，界面会保留可编辑状态并报告错误。

也可导入 `createLocalTemplateRepository`、`validateTemplateDocument`、`migrateTemplateDocument`、`serializeTemplateDocument` 和 `createPublishReadyTemplatePayload`，用于业务系统的模板管理流程。

## 浏览器打印

- 在预览中先检查变量缺失、图片、条码、二维码与长表格分页。
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

维护者在 npm 为 `@squirtles331/vue3-plugin-print` 配置 Trusted Publisher 后，推送与 `package.json` 版本一致的 `vX.Y.Z` 标签即可通过 GitHub Actions 发布公开包并生成 provenance。

## 开源与来源边界

本仓库以 [MIT](LICENSE) 发布，仅覆盖仓库中可独立授权的代码、文案、模板与资产。能力类别参考不等于复制其他项目的代码、品牌、素材或模板。第三方依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 参与贡献

提交 Issue 或 Pull Request 前，请阅读 [贡献指南](CONTRIBUTING.md)、[安全策略](SECURITY.md) 和 [发布检查清单](docs/release-checklist.md)。

---

## English quick start

```bash
npm install @squirtles331/vue3-plugin-print
```

```js
import PrintTemplateStudioPlugin from "@squirtles331/vue3-plugin-print";
import "@squirtles331/vue3-plugin-print/style.css";

app.use(PrintTemplateStudioPlugin);
```

Render `<PrintTemplateStudio v-model:template="template" v-model:runtime-data="runtimeData" />`. The package targets Vue 3.5+ and current desktop Chrome/Edge browser printing. PDF/image export, silent/cloud printing, Vue 2, Web Components, and server rendering are outside the first release scope.
