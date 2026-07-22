<template>
  <footer class="status-bar">
    <div class="status-bar__section">
      <span>坐标 X：{{ coordinateXLabel }}</span>
      <span>坐标 Y：{{ coordinateYLabel }}</span>
      <span v-if="guideLabel">{{ guideLabel }}</span>
    </div>

    <div class="status-bar__section">
      <span>缩放：{{ zoomLabel }}</span>
      <span>对象：{{ selectedCount }}</span>
      <span>页面：{{ currentPageNumber }}/{{ totalPages }}</span>
    </div>

    <div class="status-bar__section">
      <span>吸附：{{ snapEnabled ? "开启" : "关闭" }}</span>
      <span>单位：{{ unit }}</span>
      <span>纸张：{{ currentPaperLabel }}</span>
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

const { currentPageNumber, totalPages, unit, currentPaperLabel } = storeToRefs(documentStore);
const { selectedCount } = storeToRefs(selectionStore);
const { zoom, snapEnabled, coordinateReadout } = storeToRefs(viewportStore);

function formatCoordinate(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)} mm` : "--";
}

const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);
const coordinateXLabel = computed(() => formatCoordinate(coordinateReadout.value.x));
const coordinateYLabel = computed(() => formatCoordinate(coordinateReadout.value.y));
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

.status-bar__section:last-child {
  margin-left: auto;
}
</style>
