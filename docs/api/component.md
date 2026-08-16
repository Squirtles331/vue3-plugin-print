# 组件接口

## 组件 `PrintTemplateStudio`

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `template` | `TemplateDocument \| null` | `null` | 初始 `TemplateDocument v2` 文档。 |
| `runtimeData` | `Record<string, unknown>` | `{}` | 预览和打印数据。 |
| `repository` | `TemplateRepository \| null` | `null` | 外部模板仓储。 |
| `storageKey` | `string` | `default` | 本地仓储命名空间。 |
| `height` | `string \| number` | `720` | 编辑器高度。 |
| `printPolicy` | `object` | `{ allowIncomplete: false }` | 严格预检策略；仅在允许不完整输出时传入 `{ allowIncomplete: true }`。 |

### Emits

| 事件 | 负载 |
| --- | --- |
| `update:template` | 模板文档。 |
| `update:runtimeData` | 运行时数据。 |
| `template-change` | 模板文档。 |
| `error` | `{ scope, error, message }`。 |
| `ready` | 编辑器实例。 |

### Expose

| 方法 | 说明 |
| --- | --- |
| `loadTemplateDocument(document)` | 加载模板。 |
| `replaceTemplateDocument(document)` | 异步替换并校验模板。 |
| `getTemplateDocument()` | 获取当前模板。 |
| `getPublishReadyTemplatePayload()` | 获取发布载荷。 |
| `setRuntimeData(data)` | 设置运行时数据。 |
| `print(data?)` | 执行打印。 |
| `whenReady()` | 返回编辑器挂载完成后的 Promise；宿主需要在挂载前调用实例方法时使用。 |

## 仓储接口

`createLocalTemplateRepository()` 适合默认场景，`createRestTemplateRepository()` 适合接入后端服务。

`TemplateDocument`、`TemplateRepository`、`PrintPolicy` 和 `PrintTemplateStudioInstance` 均可从包根路径导入。模板的 `schemaVersion` 必须为 `2`；仓储读取、导入或组件传入旧版本时会返回校验错误，不会静默转换。

```js
import { createRestTemplateRepository } from "@squirtles331/vue3-plugin-print";

const repository = createRestTemplateRepository({
  baseUrl: "https://api.example.com/print",
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});
```

后端建议暴露以下接口：

- `GET /templates`
- `GET /templates/:id`
- `PUT /templates/:id`
- `DELETE /templates/:id`
