<template>
  <footer class="status-bar">
    <div class="status-bar__section">
      <span class="status-bar__label">状态</span>
      <span class="status-bar__state" :class="{ 'is-dirty': dirty }">{{ saveStatus }}</span>
      <span>{{ selectedHint }}</span>
    </div>

    <div class="status-bar__section">
      <span class="status-bar__label">坐标</span>
      <span>X {{ coordinateXLabel }}</span>
      <span>Y {{ coordinateYLabel }}</span>
      <span v-if="guideLabel">{{ guideLabel }}</span>
    </div>

    <div class="status-bar__section">
      <span class="status-bar__label">画布</span>
      <span>缩放 {{ zoomLabel }}</span>
      <span>页码 {{ currentPageNumber }}/{{ totalPages }}</span>
    </div>

    <div class="status-bar__section status-bar__section--meta">
      <span class="status-bar__label">输出</span>
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
const selectedHint = computed(() => (selectedCount.value ? `已选中 ${selectedCount.value} 个元素` : "未选中元素"));
const guideLabel = computed(() => {
  if (coordinateReadout.value.source !== "guide" || !coordinateReadout.value.guideOrientation) {
    return "";
  }

  const axis = coordinateReadout.value.guideOrientation === "vertical" ? "纵向参考线" : "横向参考线";
  return `${axis} ${formatCoordinate(coordinateReadout.value.guidePosition)}`;
});
</script>

<style scoped lang="scss">
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px 12px;
  min-height: 25px;
  padding: 0 12px;
  border-top: 1px solid #dce3ec;
  background: var(--pd-statusbar-bg);
  color: var(--pd-muted);
  font-size: 11px;
}

.status-bar__section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.status-bar__section--meta {
  margin-left: auto;
}

.status-bar__label {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
}

.status-bar__state {
  padding: 1px 5px;
  border: 1px solid #c4e7cf;
  border-radius: 3px;
  background: #f2fbf4;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
}

.status-bar__state.is-dirty {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

@media (max-width: 1200px) {
  .status-bar {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px 14px;
  }

  .status-bar__section--meta {
    margin-left: 0;
  }
}
</style>
