# 组件接口

## 组件 `PrintTemplateStudio`

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `template` | `object \| null` | `null` | 初始模板文档。 |
| `runtimeData` | `object` | `{}` | 预览和打印数据。 |
| `repository` | `object \| null` | `null` | 外部模板仓储。 |
| `storageKey` | `string` | `default` | 本地仓储命名空间。 |
| `height` | `string \| number` | `720` | 编辑器高度。 |

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
| `getTemplateDocument()` | 获取当前模板。 |
| `getPublishReadyTemplatePayload()` | 获取发布载荷。 |
| `setRuntimeData(data)` | 设置运行时数据。 |
| `print(data?)` | 执行打印。 |

## 仓储接口

`createLocalTemplateRepository()` 适合默认场景，`createRestTemplateRepository()` 适合接入后端服务。

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
