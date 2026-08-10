# 打印模板工作台

`PrintTemplateStudio` 是一个面向 Vue 3 的可视化打印模板组件，用来做订单、标签、出库单、质检单等业务打印。

它更接近开源插件常见的文档形态：先讲清楚是什么、怎么装、怎么用，再给出 API、示例和选型说明。

## 安装

```bash
npm install @squirtles331/vue3-plugin-print
```

## 基本使用

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

## 文档导航

| 页面 | 说明 |
| --- | --- |
| [快速开始](/guide/quick-start) | 安装、注册和最小示例 |
| [组件使用](/guide/usage) | 组件接入方式、常见用法 |
| [组件接口](/api/component) | Props、Emits、Expose 和仓储接口 |
| [仓储示例](/examples/repository) | 本地仓储和后端仓储示例 |
| [选型对比](/guide/comparison) | 和常见打印插件、PDF 工具的差异 |
| [演示区](/playground) | 单独打开完整演示应用 |

## 主要能力

- 模板文档 `TemplateDocument v1`
- 预览和浏览器打印共用运行时
- 本地模板库和 REST 仓储
- 标尺、图层、对齐、分页、表格和标签网格
- 条码、二维码、页码、矩形、圆形和多标签
- 导入、导出、迁移和发布载荷生成

## 适用场景

- 订单打印
- 标签打印
- 出库单打印
- 质检单打印
- 其他需要长期维护模板的业务打印场景

## 说明

如果你只是打印一个已经排好的页面，可以直接看轻量打印插件。
如果你需要的是一个能长期维护的打印模板模块，可以优先看 [选型对比](/guide/comparison) 和 [组件接口](/api/component)。
