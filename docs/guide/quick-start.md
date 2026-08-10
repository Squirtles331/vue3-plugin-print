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

- `template` 是模板文档本体，组件会读取和回写它。
- `runtimeData` 只负责打印时的数据输入，不会修改模板布局。
- `storage-key` 建议按业务场景区分，避免多个实例共享同一份本地缓存。
- Nuxt 或 SSR 项目里，请把组件放在客户端区域。
