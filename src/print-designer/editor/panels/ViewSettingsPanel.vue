<template>
  <div class="view-settings-panel">
    <div class="view-settings-panel__modes">
      <button type="button" class="view-settings-panel__mode" @click="applyMode('focus')">
        <strong>专注编辑</strong>
        <span>保留必要辅助线，减少干扰。</span>
      </button>
      <button type="button" class="view-settings-panel__mode" @click="applyMode('print')">
        <strong>打印检查</strong>
        <span>更接近实际输出时的视觉状态。</span>
      </button>
      <button type="button" class="view-settings-panel__mode" @click="applyMode('simple')">
        <strong>简洁视图</strong>
        <span>关闭大多数辅助层，适合快速浏览。</span>
      </button>
    </div>

    <div class="view-settings-panel__section">
      <div class="view-settings-panel__section-title">编辑辅助</div>
      <label class="view-settings-panel__toggle">
        <span>显示参考线</span>
        <el-switch :model-value="guidesVisible" @change="viewportStore.toggleGuides" />
      </label>

      <label class="view-settings-panel__toggle">
        <span>显示网格</span>
        <el-switch :model-value="gridVisible" @change="viewportStore.toggleGrid" />
      </label>

      <label class="view-settings-panel__toggle">
        <span>显示边距线</span>
        <el-switch :model-value="safeAreaVisible" @change="viewportStore.toggleSafeArea" />
      </label>

      <label class="view-settings-panel__toggle">
        <span>显示页面边框</span>
        <el-switch :model-value="pageOutlineVisible" @change="viewportStore.togglePageOutline" />
      </label>

      <label class="view-settings-panel__toggle">
        <span>吸附</span>
        <el-switch :model-value="snapEnabled" @change="viewportStore.toggleSnap" />
      </label>
    </div>

    <div class="view-settings-panel__separator"></div>

    <div class="view-settings-panel__section">
      <div class="view-settings-panel__section-title">交互偏好</div>
      <label class="view-settings-panel__toggle">
        <span>允许元素拖出画布</span>
        <el-switch
          :model-value="allowOverflowDrag"
          @change="viewportStore.toggleAllowOverflowDrag"
        />
      </label>

      <label class="view-settings-panel__toggle">
        <span>文本元素快捷操作栏</span>
        <el-switch
          :model-value="textQuickToolbarVisible"
          @change="viewportStore.toggleTextQuickToolbar"
        />
      </label>
    </div>

    <p class="view-settings-panel__hint">这些设置只影响编辑视图，不会直接写入打印输出结果。</p>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useEditorViewportStore } from "../stores/viewportStore";

const viewportStore = useEditorViewportStore();

const {
  guidesVisible,
  gridVisible,
  safeAreaVisible,
  snapEnabled,
  pageOutlineVisible,
  allowOverflowDrag,
  textQuickToolbarVisible,
} = storeToRefs(viewportStore);

function applyMode(mode) {
  if (mode === "focus") {
    if (!guidesVisible.value) viewportStore.toggleGuides();
    if (!gridVisible.value) viewportStore.toggleGrid();
    if (safeAreaVisible.value) viewportStore.toggleSafeArea();
    if (!pageOutlineVisible.value) viewportStore.togglePageOutline();
    if (!snapEnabled.value) viewportStore.toggleSnap();
    return;
  }

  if (mode === "print") {
    if (!guidesVisible.value) viewportStore.toggleGuides();
    if (gridVisible.value) viewportStore.toggleGrid();
    if (!safeAreaVisible.value) viewportStore.toggleSafeArea();
    if (!pageOutlineVisible.value) viewportStore.togglePageOutline();
    if (!snapEnabled.value) viewportStore.toggleSnap();
    return;
  }

  if (guidesVisible.value) viewportStore.toggleGuides();
  if (gridVisible.value) viewportStore.toggleGrid();
  if (safeAreaVisible.value) viewportStore.toggleSafeArea();
  if (pageOutlineVisible.value) viewportStore.togglePageOutline();
  if (!snapEnabled.value) viewportStore.toggleSnap();
}
</script>

<style scoped lang="scss">
.view-settings-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
}

.view-settings-panel__modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.view-settings-panel__mode {
  display: flex;
  min-height: 76px;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
}

.view-settings-panel__mode:hover {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.view-settings-panel__mode strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.view-settings-panel__mode span {
  color: var(--pd-muted);
  font-size: 11px;
  line-height: 1.45;
}

.view-settings-panel__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.view-settings-panel__section-title {
  color: var(--pd-strong);
  font-size: 12px;
  font-weight: 700;
}

.view-settings-panel__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.view-settings-panel__toggle span {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.view-settings-panel__separator {
  height: 1px;
  margin: 2px 0;
  background: var(--pd-divider);
}

.view-settings-panel__hint {
  margin: 0;
  color: var(--pd-muted);
  font-size: 11px;
  line-height: 1.5;
}
</style>
