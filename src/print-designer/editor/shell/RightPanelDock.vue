<template>
  <aside
    v-if="!rightDockCollapsed"
    ref="rightDockRef"
    class="right-panel-dock"
    :style="{ width: `${rightPanelWidth}px` }"
  >
    <div class="right-panel-dock__resizer" @pointerdown="startResize"></div>

    <section class="right-panel-dock__surface">
      <header class="right-panel-dock__header">
        <div>
          <p class="right-panel-dock__eyebrow">右侧属性</p>
          <h2 class="right-panel-dock__title">{{ panelTitle }}</h2>
          <p class="right-panel-dock__description">{{ panelDescription }}</p>
        </div>
        <PdButton class="right-panel-dock__close" native-type="button" @click="shellStore.toggleRightDock()">收起</PdButton>
      </header>

      <div class="right-panel-dock__main">
        <nav class="right-panel-dock__tabs" aria-label="右侧面板">
          <PdButton
            v-for="panel in panels"
            :key="panel.key"
            class="right-panel-dock__tab"
            :class="{ 'is-active': panel.key === activeRightPanel }"
            native-type="button"
            @click="shellStore.toggleRightDockPanel(panel.key)"
          >
            <template #icon><PdIcon class="right-panel-dock__tab-icon"><component :is="panel.icon" /></PdIcon></template>
            <span>{{ panel.label }}</span>
            <small v-if="panelBadges[panel.key]" class="right-panel-dock__tab-badge">{{ panelBadges[panel.key] }}</small>
          </PdButton>
        </nav>

        <div class="right-panel-dock__body">
          <ElementPropertiesPanel v-if="activeRightPanel === 'properties'" />
          <PageSettingsPanel v-else-if="activeRightPanel === 'page'" />
          <ViewSettingsPanel v-else-if="activeRightPanel === 'view'" />
          <StructurePanel
            v-else-if="activeRightPanel === 'layers'"
            :layers="layers"
            :selected-ids="selectedIds"
            @select="selectionStore.select($event)"
          />
          <BindingPanel v-else-if="activeRightPanel === 'bindings'" :variables="variables" @bind="emit('bind', $event)" />
          <HistoryPanel v-else />
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { Clock, DataLine, Files, Setting, View } from "../../ui/icons.js";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdIcon from "../../ui/primitives/PdIcon.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import StructurePanel from "../../components/inspector/StructurePanel.vue";
import BindingPanel from "../panels/BindingPanel.vue";
import ElementPropertiesPanel from "../panels/ElementPropertiesPanel.vue";
import HistoryPanel from "../panels/HistoryPanel.vue";
import PageSettingsPanel from "../panels/PageSettingsPanel.vue";
import ViewSettingsPanel from "../panels/ViewSettingsPanel.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";

const emit = defineEmits(["bind"]);
const shellStore = useEditorShellStore();
const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();

const { activeRightPanel, rightDockCollapsed, rightPanelWidth } = storeToRefs(shellStore);
const { layers, variables } = storeToRefs(documentStore);
const { selectedIds } = storeToRefs(selectionStore);
const rightDockRef = ref(null);

const panels = [
  { key: "properties", label: "属性", icon: Setting },
  { key: "page", label: "页面", icon: Setting },
  { key: "view", label: "视图", icon: View },
  { key: "layers", label: "结构", icon: Files },
  { key: "bindings", label: "绑定", icon: DataLine },
  { key: "history", label: "历史", icon: Clock },
];

const panelTitle = computed(() => {
  const map = {
    properties: "元素属性",
    page: "页面设置",
    view: "视图设置",
    layers: "图层结构",
    bindings: "数据绑定",
    history: "历史记录",
  };

  return map[activeRightPanel.value] || "右侧面板";
});

const panelDescription = computed(() => {
  const map = {
    properties: !selectedIds.value.length
      ? "选中画布元素后，可在这里修改位置、样式和绑定。"
      : selectedIds.value.length === 1
        ? "正在编辑 1 个选中元素。"
        : `已选中 ${selectedIds.value.length} 个元素。可批量修改显示、打印、锁定和通用样式。`,
    page: "设置纸张、方向、边距和打印标记。",
    view: "控制辅助线、网格、吸附和编辑器显示。",
    layers: "查看当前页图层并定位到画布。",
    bindings: "查看可用字段并核对绑定结果。",
    history: "查看最近操作，确认可撤销范围。",
  };

  return map[activeRightPanel.value] || "";
});

const panelBadges = computed(() => ({
  properties: selectedIds.value.length,
  layers: layers.value.length,
  bindings: variables.value.length,
}));

function onPointerMove(event) {
  const dockElement = rightDockRef.value;

  if (!dockElement) {
    return;
  }

  const dockRect = dockElement.getBoundingClientRect();
  shellStore.setRightPanelWidth(dockRect.right - event.clientX);
}

function stopResize() {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", stopResize);
}

function startResize(event) {
  event.preventDefault();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", stopResize);
}

onBeforeUnmount(() => {
  stopResize();
});
</script>

<style scoped lang="scss">
.right-panel-dock {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  border-left: 1px solid #dce3ec;
  background: #ffffff;
}

.right-panel-dock__surface {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.right-panel-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 68px;
  padding: 10px 12px;
  border-bottom: 1px solid #e4eaf1;
  background: #ffffff;
}

.right-panel-dock__eyebrow {
  margin: 0 0 3px;
  color: #7c8ca1;
  font-size: 10px;
  letter-spacing: 0.04em;
}

.right-panel-dock__title {
  margin: 0;
  color: #172033;
  font-size: 14px;
  line-height: 1.2;
}

.right-panel-dock__description {
  margin: 4px 0 0;
  max-width: 260px;
  color: #728096;
  font-size: 11px;
  line-height: 1.35;
}

.right-panel-dock__close {
  height: 27px;
  padding: 0 8px;
  border: 1px solid #d8e1ed;
  border-radius: 3px;
  background: #ffffff;
  color: #5d6b7e;
  font-size: 11px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.right-panel-dock__close:hover {
  border-color: #bfd3f3;
  background: #f4f8ff;
  color: #2456c7;
}

.right-panel-dock__main {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.right-panel-dock__tabs {
  display: flex;
  width: 76px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  padding: 8px 5px;
  border-right: 1px solid #e4eaf1;
  background: #f7f9fc;
}

.right-panel-dock__tab {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 54px;
  padding: 5px 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #6d7c91;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.right-panel-dock__tab:hover,
.right-panel-dock__tab.is-active {
  border-color: #c9daf6;
  background: #eaf2ff;
  color: #2563c8;
  box-shadow: none;
}

.right-panel-dock__tab-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 16px;
  color: currentColor;
}

.right-panel-dock__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: #ffffff;
}

.right-panel-dock__tab span {
  min-width: 0;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
}

.right-panel-dock__tab :deep(.pd-button__content) {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.right-panel-dock__tab-badge {
  display: none;
}

.right-panel-dock__resizer {
  position: absolute;
  top: 0;
  left: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.right-panel-dock__resizer::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 1px;
  background: transparent;
}

.right-panel-dock__resizer:hover::before {
  background: #93b7ed;
}
</style>
