<template>
  <footer class="status-bar">
    <div class="status-bar__section">
      <span class="status-bar__state" :class="{ 'is-dirty': dirty }">{{ saveStatus }}</span>
      <span>{{ selectedHint }}</span>
    </div>

    <div class="status-bar__section">
      <span>X：{{ coordinateXLabel }}</span>
      <span>Y：{{ coordinateYLabel }}</span>
      <span v-if="guideLabel">{{ guideLabel }}</span>
    </div>

    <div class="status-bar__section">
      <span>缩放 {{ zoomLabel }}</span>
      <span>页面 {{ currentPageNumber }}/{{ totalPages }}</span>
    </div>

    <div class="status-bar__section">
      <span>吸附 {{ snapEnabled ? "开启" : "关闭" }}</span>
      <span>单位 {{ unit }}</span>
      <span>纸张 {{ currentPaperLabel }}</span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorViewportStore } from "../stores/viewportStore";

const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();
const viewportStore = useEditorViewportStore();

const { currentPageNumber, dirty, saveStatus, totalPages, unit, currentPaperLabel } = storeToRefs(documentStore);
const { selectedCount } = storeToRefs(selectionStore);
const { zoom, snapEnabled, coordinateReadout } = storeToRefs(viewportStore);

function formatCoordinate(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)} mm` : "--";
}

const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);
const coordinateXLabel = computed(() => formatCoordinate(coordinateReadout.value.x));
const coordinateYLabel = computed(() => formatCoordinate(coordinateReadout.value.y));
const selectedHint = computed(() => (selectedCount.value ? `已选 ${selectedCount.value} 个元素` : "未选中元素"));
const guideLabel = computed(() => {
  if (coordinateReadout.value.source !== "guide" || !coordinateReadout.value.guideOrientation) {
    return "";
  }

  const axis = coordinateReadout.value.guideOrientation === "vertical" ? "纵向参考线" : "横向参考线";
  return `${axis}：${formatCoordinate(coordinateReadout.value.guidePosition)}`;
});
</script>

<style scoped lang="scss">
.status-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 28px;
  padding: 0 14px;
  border-top: 1px solid var(--pd-divider);
  background: var(--pd-statusbar-bg);
  color: var(--pd-muted);
  font-size: 12px;
}

.status-bar__section {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-bar__state {
  padding: 2px 7px;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
}

.status-bar__state.is-dirty {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.status-bar__section:last-child {
  margin-left: auto;
}
</style>
