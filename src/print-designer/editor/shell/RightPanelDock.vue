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
          <p class="right-panel-dock__eyebrow">右侧面板</p>
          <h2 class="right-panel-dock__title">{{ panelTitle }}</h2>
        </div>
        <button class="right-panel-dock__close" type="button" @click="shellStore.toggleRightDock()">
          收起
        </button>
      </header>

      <div class="right-panel-dock__main">
        <div class="right-panel-dock__tabs">
          <button
            v-for="panel in panels"
            :key="panel.key"
            class="right-panel-dock__tab"
            :class="{ 'is-active': panel.key === activeRightPanel }"
            type="button"
            @click="shellStore.toggleRightDockPanel(panel.key)"
          >
            <el-icon class="right-panel-dock__tab-icon"><component :is="panel.icon" /></el-icon>
            <span>{{ panel.label }}</span>
          </button>
        </div>

        <div class="right-panel-dock__body">
          <PageSettingsPanel v-if="activeRightPanel === 'page'" />
          <StructurePanel
            v-else-if="activeRightPanel === 'layers'"
            :layers="layers"
            :selected-ids="selectedIds"
            @select="selectionStore.select($event)"
          />
          <BindingPanel v-else-if="activeRightPanel === 'bindings'" :variables="variables" />
          <HistoryPanel v-else />
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { Clock, DataLine, Files, Setting } from "@element-plus/icons-vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import StructurePanel from "../../components/inspector/StructurePanel.vue";
import BindingPanel from "../panels/BindingPanel.vue";
import HistoryPanel from "../panels/HistoryPanel.vue";
import PageSettingsPanel from "../panels/PageSettingsPanel.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";

const shellStore = useEditorShellStore();
const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();

const { activeRightPanel, rightDockCollapsed, rightPanelWidth } = storeToRefs(shellStore);
const { layers, variables } = storeToRefs(documentStore);
const { selectedIds } = storeToRefs(selectionStore);
const rightDockRef = ref(null);

const panels = [
  { key: "page", label: "属性", icon: Setting },
  { key: "layers", label: "图层", icon: Files },
  { key: "bindings", label: "数据", icon: DataLine },
  { key: "history", label: "历史", icon: Clock },
];

const panelTitle = computed(() => {
  const map = {
    page: "页面与对象属性",
    layers: "图层结构",
    bindings: "数据绑定",
    history: "历史记录",
  };

  return map[activeRightPanel.value] || "右侧面板";
});

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
  border-left: 1px solid #dbe4ef;
  background: #edf2f7;
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
  gap: 12px;
  padding: 12px 14px 8px;
  border-bottom: 1px solid #e6ebf2;
  background: linear-gradient(180deg, #fbfcfe 0%, #f5f8fc 100%);
}

.right-panel-dock__eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.right-panel-dock__title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  line-height: 1.1;
}

.right-panel-dock__close {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
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
  width: 112px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-right: 1px solid #e9eef5;
  background: #f8fafd;
}

.right-panel-dock__tab {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #66758c;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.right-panel-dock__tab:hover,
.right-panel-dock__tab.is-active {
  border-color: #c8d9f5;
  background: linear-gradient(180deg, #ffffff 0%, #eef5ff 100%);
  color: #2456c7;
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.12);
}

.right-panel-dock__tab-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 15px;
  color: currentColor;
}

.right-panel-dock__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow: auto;
  background: #ffffff;
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
  background: #d2dbe8;
}
</style>
