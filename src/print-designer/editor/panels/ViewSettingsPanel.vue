<script setup lang="ts">
import PdSwitch from '../../ui/primitives/PdSwitch.vue'
import { useEditorViewportStore } from '../stores/viewportStore'

const viewportStore = useEditorViewportStore()
const { guidesVisible, gridVisible, safeAreaVisible, snapEnabled, pageOutlineVisible, allowOverflowDrag, textQuickToolbarVisible } = storeToRefs(viewportStore)
const activeOptionCount = computed(() => {
  const options = [
    guidesVisible.value,
    gridVisible.value,
    safeAreaVisible.value,
    pageOutlineVisible.value,
    snapEnabled.value,
    allowOverflowDrag.value,
    textQuickToolbarVisible.value,
  ]
  return options.filter(Boolean).length
})
const activeMode = computed(() => {
  if (guidesVisible.value
    && gridVisible.value
    && !safeAreaVisible.value
    && pageOutlineVisible.value
    && snapEnabled.value
    && !allowOverflowDrag.value
    && !textQuickToolbarVisible.value) {
    return 'focus'
  }
  if (guidesVisible.value
    && !gridVisible.value
    && !safeAreaVisible.value
    && pageOutlineVisible.value
    && snapEnabled.value
    && !allowOverflowDrag.value
    && !textQuickToolbarVisible.value) {
    return 'print'
  }
  if (!guidesVisible.value
    && !gridVisible.value
    && !safeAreaVisible.value
    && !pageOutlineVisible.value
    && snapEnabled.value
    && !allowOverflowDrag.value
    && !textQuickToolbarVisible.value) {
    return 'simple'
  }
  return ''
})
function applyMode(mode) {
  if (mode === 'focus') {
    if (!guidesVisible.value)
      viewportStore.toggleGuides()
    if (!gridVisible.value)
      viewportStore.toggleGrid()
    if (safeAreaVisible.value)
      viewportStore.toggleSafeArea()
    if (!pageOutlineVisible.value)
      viewportStore.togglePageOutline()
    if (!snapEnabled.value)
      viewportStore.toggleSnap()
    return
  }
  if (mode === 'print') {
    if (!guidesVisible.value)
      viewportStore.toggleGuides()
    if (gridVisible.value)
      viewportStore.toggleGrid()
    if (!safeAreaVisible.value)
      viewportStore.toggleSafeArea()
    if (!pageOutlineVisible.value)
      viewportStore.togglePageOutline()
    if (!snapEnabled.value)
      viewportStore.toggleSnap()
    return
  }
  if (guidesVisible.value)
    viewportStore.toggleGuides()
  if (gridVisible.value)
    viewportStore.toggleGrid()
  if (safeAreaVisible.value)
    viewportStore.toggleSafeArea()
  if (pageOutlineVisible.value)
    viewportStore.togglePageOutline()
  if (!snapEnabled.value)
    viewportStore.toggleSnap()
}
</script>

<template>
  <div class="view-settings-panel">
    <header class="view-settings-panel__header">
      <div>
        <p class="view-settings-panel__eyebrow">
          视图设置
        </p>
        <h2 class="view-settings-panel__title">
          编辑视图
        </h2>
        <p class="view-settings-panel__description">
          这里只影响编辑器的显示方式，不会直接写入打印结果。
        </p>
      </div>
      <div class="view-settings-panel__badge">
        <strong>{{ activeOptionCount }}</strong>
        <span>项开启</span>
      </div>
    </header>

    <section class="view-settings-panel__section">
      <div class="view-settings-panel__section-title">
        模式预设
      </div>
      <div class="view-settings-panel__modes">
        <button type="button" class="view-settings-panel__mode" :class="{ 'is-active': activeMode === 'focus' }" @click="applyMode('focus')">
          <strong>专注编辑</strong>
          <span>保留必要辅助线，减少干扰。</span>
        </button>
        <button type="button" class="view-settings-panel__mode" :class="{ 'is-active': activeMode === 'print' }" @click="applyMode('print')">
          <strong>打印检查</strong>
          <span>更接近最终输出时的视觉状态。</span>
        </button>
        <button type="button" class="view-settings-panel__mode" :class="{ 'is-active': activeMode === 'simple' }" @click="applyMode('simple')">
          <strong>简洁视图</strong>
          <span>关闭大多数辅助层，便于快速浏览。</span>
        </button>
      </div>
    </section>

    <section class="view-settings-panel__section">
      <div class="view-settings-panel__section-title">
        编辑辅助
      </div>
      <label class="view-settings-panel__toggle">
        <span>显示参考线</span>
        <PdSwitch :model-value="guidesVisible" @change="viewportStore.toggleGuides" />
      </label>
      <label class="view-settings-panel__toggle">
        <span>显示网格</span>
        <PdSwitch :model-value="gridVisible" @change="viewportStore.toggleGrid" />
      </label>
      <label class="view-settings-panel__toggle">
        <span>显示边距线</span>
        <PdSwitch :model-value="safeAreaVisible" @change="viewportStore.toggleSafeArea" />
      </label>
      <label class="view-settings-panel__toggle">
        <span>显示页面边框</span>
        <PdSwitch :model-value="pageOutlineVisible" @change="viewportStore.togglePageOutline" />
      </label>
      <label class="view-settings-panel__toggle">
        <span>吸附</span>
        <PdSwitch :model-value="snapEnabled" @change="viewportStore.toggleSnap" />
      </label>
    </section>

    <section class="view-settings-panel__section">
      <div class="view-settings-panel__section-title">
        交互偏好
      </div>
      <label class="view-settings-panel__toggle">
        <span>允许元素拖出画布</span>
        <PdSwitch :model-value="allowOverflowDrag" @change="viewportStore.toggleAllowOverflowDrag" />
      </label>
      <label class="view-settings-panel__toggle">
        <span>文本快捷操作条</span>
        <PdSwitch :model-value="textQuickToolbarVisible" @change="viewportStore.toggleTextQuickToolbar" />
      </label>
    </section>

    <p class="view-settings-panel__hint">
      这些设置只影响编辑器视图，不会直接改写模板数据。
    </p>
  </div>
</template>

<style scoped lang="scss">
.view-settings-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

.view-settings-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.view-settings-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.view-settings-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.view-settings-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.view-settings-panel__badge {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #f8fafc;
  text-align: center;
}

.view-settings-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.view-settings-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.view-settings-panel__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: var(--pd-panel-bg);
}

.view-settings-panel__section-title {
  color: var(--pd-strong);
  font-size: 12px;
  font-weight: 700;
}

.view-settings-panel__modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.view-settings-panel__mode {
  display: flex;
  min-height: 72px;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
}

.view-settings-panel__mode:hover {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.view-settings-panel__mode.is-active {
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

.view-settings-panel__hint {
  margin: 0;
  color: var(--pd-muted);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .view-settings-panel__header {
    flex-direction: column;
  }

  .view-settings-panel__modes {
    grid-template-columns: 1fr;
  }
}
</style>
