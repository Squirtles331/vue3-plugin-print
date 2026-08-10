# 模板仓储示例

默认情况下，设计器会把模板和元素预设保存到浏览器本地存储。生产环境中通常会替换为业务系统自己的 REST 仓储。

## 本地仓储

```vue
<template>
  <PrintTemplateStudio storage-key="warehouse-label" />
</template>
```

`storage-key` 会影响本地存储命名空间。同一个页面如果挂载多个设计器，必须使用不同的值。

## REST 仓储

```js
import { createRestTemplateRepository } from "@squirtles331/vue3-plugin-print";

export function createTemplateRepository(token) {
  return createRestTemplateRepository({
    baseUrl: "https://api.example.com/print",
    getHeaders: () => ({
      Authorization: `Bearer ${token}`,
    }),
  });
}
```

```vue
<script setup>
import { computed } from "vue";
import { createTemplateRepository } from "./templateRepository";

const props = defineProps({
  token: { type: String, required: true },
});

const repository = computed(() => createTemplateRepository(props.token));
</script>

<template>
  <PrintTemplateStudio :repository="repository" storage-key="remote-label" />
</template>
```

## 数据边界

模板定义布局、样式、分页和字段路径。运行时 JSON 只提供值，不应该覆盖模板里的视觉规则。

```js
const runtimeData = {
  customer: { name: "杭州示例科技有限公司" },
  order: { number: "SO-20260810" },
  items: [
    { sku: "A-100", name: "标签纸", quantity: 2 },
    { sku: "B-200", name: "碳带", quantity: 1 },
  ],
};
```

字段路径可以写成 `customer.name`、`order.number`、`items[0].sku`。
