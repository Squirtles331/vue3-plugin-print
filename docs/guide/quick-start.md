# 快速开始

## 安装

```bash
npm install @squirtles331/vue3-plugin-print
```

## 注册插件

```vue
<script setup>
import { createApp } from "vue";
import App from "./App.vue";
import PrintTemplateStudioPlugin from "@squirtles331/vue3-plugin-print";
import "@squirtles331/vue3-plugin-print/style.css";

createApp(App).use(PrintTemplateStudioPlugin).mount("#app");
</script>
```

## 使用组件

```vue
<script setup>
import { ref } from "vue";

const template = ref();
const runtimeData = ref({
  customer: { name: "示例客户" },
  order: { number: "SO-20260810" },
});
</script>

<template>
  <PrintTemplateStudio
    v-model:template="template"
    v-model:runtime-data="runtimeData"
    storage-key="sales-order-template"
    :height="760"
  />
</template>
```

## 提示

- `template` 是 `TemplateDocument v2` 模板文档本体，组件会读取和回写它。
- `runtimeData` 只负责打印时的数据输入，不会修改模板布局。
- `storage-key` 建议按业务场景区分，避免多个实例共享同一份本地缓存。
- Nuxt 或 SSR 项目里，请把组件放在客户端区域。
- `schemaVersion: 1` 的旧模板以及已移除字段别名会被拒绝；组件不提供自动迁移，请在接入前转换为 v2 或重新创建模板。

## Print policy

Printing is strict by default: missing bound values, empty printable images or machine codes, and elements outside the configured printable safe area stop the action. For intentionally incomplete stationery only, pass `:print-policy="{ allowIncomplete: true }"`. Use `await designer.value.whenReady()` when calling exposed methods before the component has mounted.
