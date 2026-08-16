<script setup lang="ts">
defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: 'px',
  },
  zoomLabel: {
    type: String,
    default: '100%',
  },
  snapEnabled: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <footer class="designer-statusbar">
    <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
    <span>选中 {{ selectedCount }} 个元素</span>
    <span>单位 {{ unit }}</span>
    <span>缩放 {{ zoomLabel }}</span>
    <span>吸附 {{ snapEnabled ? "开启" : "关闭" }}</span>
  </footer>
</template>

<style scoped lang="scss">
.designer-statusbar {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 36px;
  padding: 0 18px;
  border-top: 1px solid var(--pd-border);
  background: rgba(20, 28, 39, 0.9);
  color: rgba(198, 210, 228, 0.8);
  font-size: 12px;
  font-weight: 600;
}
</style>
