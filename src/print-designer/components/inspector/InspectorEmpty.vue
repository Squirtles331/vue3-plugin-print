<template>
  <div class="inspector-empty">
    <div class="inspector-empty__title">{{ title }}</div>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "未选中元素",
  },
  description: {
    type: String,
    default: "选中画布中的元素后，这里会显示位置、尺寸、样式和数据绑定等配置。",
  },
});
</script>

<style scoped lang="scss">
.inspector-empty {
  padding: 16px 14px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
}

.inspector-empty__title {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.inspector-empty p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--pd-muted);
}
</style>
