<template>
  <div class="view-settings-panel">
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

    <div class="view-settings-panel__separator"></div>

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
</script>

<style scoped lang="scss">
.view-settings-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
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
