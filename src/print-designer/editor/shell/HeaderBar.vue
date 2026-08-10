<template>
  <header class="header-bar">
    <div class="header-bar__row">
      <div class="header-bar__brand">
        <div class="header-bar__logo">PD</div>
        <div class="header-bar__title-group">
          <strong class="header-bar__title">打印设计器</strong>
          <span class="header-bar__meta">{{ documentName }}</span>
          <span class="header-bar__status">{{ saveStatus }}</span>
        </div>
      </div>

      <div class="header-bar__divider"></div>

      <section class="header-bar__tool-group">
        <button type="button" class="header-bar__chip" :disabled="!canUndo" @click="historyStore.undo()">
          撤销
        </button>
        <button type="button" class="header-bar__chip" :disabled="!canRedo" @click="historyStore.redo()">
          恢复
        </button>
      </section>

      <div class="header-bar__divider"></div>

      <section class="header-bar__tool-group">
        <button
          class="header-bar__chip"
          :class="{ 'is-active': templatePanelActive }"
          type="button"
          @click="openTemplatePanel"
        >
          模板
        </button>
        <button class="header-bar__chip" :class="{ 'is-active': pagePanelActive }" type="button" @click="openPagesPanel">
          页面
        </button>
        <button class="header-bar__chip" :class="{ 'is-active': viewPanelActive }" type="button" @click="openViewPanel">
          视图
        </button>
        <button
          class="header-bar__chip"
          :class="{ 'is-active': propertiesPanelActive }"
          type="button"
          @click="openPropertiesPanel"
        >
          属性
        </button>
      </section>

      <div class="header-bar__spacer"></div>

      <section class="header-bar__tool-group">
        <button class="header-bar__chip" type="button" @click="$emit('new-template')">新建</button>
        <button class="header-bar__chip" type="button" @click="$emit('open-template')">打开</button>
        <button class="header-bar__chip" type="button" @click="$emit('import-template')">导入</button>
        <button class="header-bar__chip" type="button" @click="$emit('export-template')">导出</button>
        <button class="header-bar__chip" type="button" @click="$emit('open-presets')">预设</button>
        <button class="header-bar__chip" type="button" @click="$emit('preview')">预览</button>
        <button class="header-bar__chip" type="button" @click="$emit('print')">打印</button>
        <button class="header-bar__chip is-primary" type="button" @click="$emit('save-template')">保存</button>
      </section>
    </div>

    <TextFormatToolbar />
    <LayoutToolbar />
  </header>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import TextFormatToolbar from "./TextFormatToolbar.vue";
import LayoutToolbar from "./LayoutToolbar.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorShellStore } from "../stores/shellStore";

defineEmits(["new-template", "open-template", "import-template", "export-template", "open-presets", "save-template", "preview", "print", "export-pdf"]);

const historyStore = useEditorHistoryStore();
const shellStore = useEditorShellStore();

const { documentName, saveStatus } = storeToRefs(useEditorDocumentStore());
const { canUndo, canRedo } = storeToRefs(historyStore);
const { activeFloatingPanel } = storeToRefs(shellStore);

const templatePanelActive = computed(() => activeFloatingPanel.value === "template");
const pagePanelActive = computed(() => activeFloatingPanel.value === "pages");
const viewPanelActive = computed(() => activeFloatingPanel.value === "view");
const propertiesPanelActive = computed(() => activeFloatingPanel.value === "properties");

function openTemplatePanel() {
  shellStore.togglePanel("template");
}

function openPagesPanel() {
  shellStore.togglePanel("pages");
}

function openViewPanel() {
  shellStore.togglePanel("view");
}

function openPropertiesPanel() {
  shellStore.togglePanel("properties");
}
</script>

<style scoped lang="scss">
.header-bar {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-bottom: 1px solid var(--pd-divider);
  background: var(--pd-toolbar-bg);
}

.header-bar__row,
.header-bar__brand,
.header-bar__title-group,
.header-bar__tool-group {
  display: flex;
  align-items: center;
}

.header-bar__row {
  width: 100%;
  min-width: 0;
  gap: 10px;
  padding: 8px 14px;
}

.header-bar__brand {
  gap: 10px;
  flex: 0 0 auto;
}

.header-bar__logo {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid var(--pd-border);
  background: var(--pd-surface-bg);
  color: var(--pd-text);
  font-size: 11px;
  font-weight: 800;
}

.header-bar__title-group {
  gap: 8px;
  min-width: 0;
}

.header-bar__title {
  color: var(--pd-text);
  font-size: 13px;
}

.header-bar__meta,
.header-bar__status {
  color: var(--pd-muted);
  font-size: 11px;
}

.header-bar__tool-group {
  gap: 6px;
  flex: 0 0 auto;
}

.header-bar__divider {
  width: 1px;
  align-self: stretch;
  background: var(--pd-divider);
}

.header-bar__spacer {
  flex: 1;
  min-width: 12px;
}

.header-bar button {
  height: 28px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: var(--pd-radius-control);
  background: transparent;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.header-bar button:hover:not(:disabled),
.header-bar__chip.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.header-bar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.header-bar .is-primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

@media (max-width: 1800px) {
  .header-bar__row {
    flex-wrap: wrap;
  }

  .header-bar__spacer {
    display: none;
  }
}
</style>
