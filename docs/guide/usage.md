# 组件使用

`PrintTemplateStudio` 是可直接嵌入业务应用的打印模板主组件。

## Props

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `template` | `object \| null` | 当前模板文档，支持外部控制与回写。 |
| `runtimeData` | `object` | 预览和打印使用的业务数据。 |
| `repository` | `object \| null` | 可替换的模板仓储，不传时使用本地存储。 |
| `storageKey` | `string` | 本地仓储命名空间。 |
| `height` | `string \| number` | 编辑器高度，默认 `720`。 |

## Events

| 名称 | 说明 |
| --- | --- |
| `update:template` | 模板发生变化时回写。 |
| `update:runtimeData` | 运行时数据发生变化时回写。 |
| `template-change` | 模板变更通知。 |
| `error` | 仓储、解析或打印错误。 |
| `ready` | 组件挂载完成。 |

## 暴露方法

| 方法 | 说明 |
| --- | --- |
| `loadTemplateDocument(document)` | 载入模板文档。 |
| `getTemplateDocument()` | 获取当前模板。 |
| `getPublishReadyTemplatePayload()` | 获取可发布载荷。 |
| `setRuntimeData(data)` | 更新运行时数据。 |
| `print(data?)` | 打印当前内容，必要时可先注入数据。 |

## 常见用法

```vue
<script setup>
import { ref } from "vue";

const template = ref();
const runtimeData = ref({});

function handleError(payload) {
  console.error(payload.scope, payload.message);
}
</script>

<template>
  <PrintTemplateStudio
    ref="designer"
    v-model:template="template"
    v-model:runtime-data="runtimeData"
    storage-key="invoice-template"
    :height="780"
    @error="handleError"
  />
</template>
```
