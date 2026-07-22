<template>
  <div class="page-setup-panel">
    <div class="page-setup-panel__intro">
      <strong>页面设置</strong>
      <span>这里仅控制纸张尺寸、边距、背景和打印标记，不展示元素属性。</span>
    </div>

    <PageSettingsPanel />
  </div>
</template>

<script setup>
import PageSettingsPanel from "./PageSettingsPanel.vue";
</script>

<style scoped lang="scss">
.page-setup-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow: auto;
  background: #ffffff;
}

.page-setup-panel__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
}

.page-setup-panel__intro strong {
  font-size: 13px;
  color: var(--pd-strong);
}

.page-setup-panel__intro span {
  font-size: 12px;
  line-height: 1.6;
  color: var(--pd-muted);
}
</style>
