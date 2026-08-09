# Print Template Studio

一个独立实现的 Vue 3 可视化打印模板设计器。它面向业务单据、标签和表单场景：在浏览器中设计模板，使用 JSON 绑定业务数据，并通过浏览器原生打印流程输出。

> v0.1 以桌面端 Chrome 和 Edge 为支持目标。在线演示将在 GitHub Pages 启用后发布到 <https://songtonngxue.github.io/vue3-plugin-print/>。

## 已支持的能力

- 页面：预设/自定义纸张、方向、边距、背景、打印标记、网格和辅助对齐。
- 元素：文本、图片、表格、条码、二维码、页码、直线、矩形、圆形和多标签。
- 设计：拖拽、缩放、层级、锁定、对齐/分布、撤销/重做、元素预设和起始模板。
- 数据：一个 JSON 对象驱动文本、图片、条码、二维码、表格和标签网格；支持 `customer.name`、`items[0].sku` 等路径。
- 模板：`TemplateDocument v1` 校验与迁移、本地保存、重新打开、删除/清空浏览器本地模板、JSON 导入导出。
- 输出：预览与浏览器打印共用运行时渲染和分页结果；打印内容在隔离 iframe 中生成，不包含选框、辅助线或编辑器面板。

## 快速开始

需要 Node.js 20 或更高版本。

```bash
npm ci
npm run dev
```

打开 <http://localhost:5173>。生产构建与本地预览：

```bash
npm run build
npm run preview
```

完整发布验证：

```bash
npm run verify
```

该命令会执行 lint、单元测试、分页性能检查、GitHub Pages 路径构建、生产构建和生产依赖审计。

## 使用流程

1. 点击“新建”，从订单摘要、发货单、标签页或空白页起始模板开始。
2. 插入元素并在属性面板完成页面、样式、绑定和表格/标签网格配置。
3. 在数据面板或预览面板提供业务 JSON。
4. 保存到当前浏览器；模板库支持重新打开、删除和清空本浏览器的模板。也可以导出 JSON 文件并在另一台设备导入。
5. 预览确认后使用“打印”，在浏览器原生对话框中选择打印机和份数。

### 运行时 JSON 示例

```json
{
  "order": { "number": "SO-20260809", "createdAt": "2026-08-09" },
  "customer": { "name": "示例客户", "logoUrl": "https://example.invalid/logo.png" },
  "items": [
    { "sku": "A-100", "name": "标签纸", "quantity": 2, "price": 16.5 },
    { "sku": "B-200", "name": "包装盒", "quantity": 1, "price": 8 }
  ]
}
```

文本、图片、条码和二维码可绑定 `order.number` 或 `customer.logoUrl`；表格的 `dataVariable` 可填写 `items`。缺失路径会明确显示缺失状态，不会自动回填演示业务数据。

### 模板数据

持久化和运行时输入是 `TemplateDocument v1`。它包含 `schemaVersion`、模板元数据、页面设置和页面元素；缩放、选择、历史记录及预览缓存等编辑器状态不会被保存。导出文件使用 `print-template-studio/template` 的版本化 JSON 封套，导入时会进行大小限制、校验和迁移。

如需在自己的 Vue 容器中使用源码组件，可通过组件暴露的 `setRuntimeData(data)`、`getTemplateDocument()`、`getPublishReadyTemplatePayload()` 和 `loadTemplateDocument(document)` 与编辑器交互。v0.1 不是 npm 组件包或 Web Component。

## 浏览器打印说明

- 支持范围：最新桌面版 Chrome 与 Edge。
- 打印前在预览中检查绑定错误、表格分页、条码和二维码。
- 在原生打印对话框中使用 100%/实际尺寸，并关闭浏览器额外页眉页脚；不同打印机的不可打印边距仍需用实机校准。
- 图片 URL 必须允许浏览器访问；不可用图片会显示占位/错误状态。

详细的发布前实机验收清单见 [浏览器打印验收](docs/browser-print-acceptance.md)。

## 本地存储与隐私

v0.1 不包含账号、服务器或云同步。保存的模板和元素预设仅存在当前浏览器的本地存储中；清除浏览器站点数据或点击“清空本地模板库”后无法恢复。请通过 JSON 导出保留重要模板。

## 本版本不包含

- PDF 或图片导出
- 静默打印、云打印、打印客户端及打印队列
- 打印机、DPI、单双面等设备级参数控制
- 服务端渲染、账户同步、协作和权限模型
- npm 组件包、Web Component、移动端适配和多语言界面

这些能力会在后续独立变更中评估，不会作为 v0.1 的隐含承诺。

## 开源与来源边界

本仓库以 [MIT](LICENSE) 发布。它只允许在独立实现、独立文案、独立模板和独立资产的范围内使用该许可。参考同类产品的通用能力类别不等同于复制其源码、品牌、素材或模板；发布 `v0.1.0` 前仍需完成 [来源复核清单](docs/release-checklist.md)。第三方依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 参与贡献与安全

欢迎提交 bug、改进建议和文档修订。请先阅读 [贡献指南](CONTRIBUTING.md) 与 [安全策略](SECURITY.md)，并使用仓库模板提交 Issue 或 Pull Request。

---

## English quick start

Print Template Studio is a standalone Vue 3 visual print-template designer for browser-native printing. It supports template authoring, versioned JSON import/export, local browser persistence, runtime JSON bindings, preview, and printing in current desktop Chrome and Edge.

```bash
npm ci
npm run dev
```

Templates are stored only in the current browser. Export important templates as JSON before clearing site data. v0.1 deliberately excludes PDF/image export, silent/cloud printing, server rendering, collaboration, and package/Web Component distribution. Run `npm run verify` before contributing a release candidate.
