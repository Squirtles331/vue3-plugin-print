<template>
  <header class="header-bar">
    <div class="header-bar__row">
      <div class="header-bar__brand">
        <div class="header-bar__logo">PD</div>
        <div class="header-bar__title-group">
          <strong class="header-bar__title">{{ documentName }}</strong>
          <span class="header-bar__meta">{{ documentMeta }}</span>
          <span class="header-bar__status" :class="saveStatusClass">{{ saveStatus }}</span>
        </div>
      </div>

      <div class="header-bar__divider"></div>

      <section class="header-bar__tool-group" aria-label="编辑命令">
        <span class="header-bar__group-label">编辑</span>
        <PdButton native-type="button" class="header-bar__chip" :disabled="!canUndo" title="撤销上一步操作" @click="historyStore.undo()">
          <template #icon><PdIcon><RefreshLeft /></PdIcon></template>
          撤销
        </PdButton>
        <PdButton native-type="button" class="header-bar__chip" :disabled="!canRedo" title="重做刚才撤销的操作" @click="historyStore.redo()">
          <template #icon><PdIcon><RefreshRight /></PdIcon></template>
          重做
        </PdButton>
      </section>

      <div class="header-bar__divider"></div>

      <section class="header-bar__tool-group" aria-label="面板切换">
        <span class="header-bar__group-label">面板</span>
        <PdButton
          class="header-bar__chip"
          :class="{ 'is-active': templatePanelActive }"
          native-type="button"
          title="打开左侧插入面板"
          @click="openTemplatePanel"
        >
          <template #icon><PdIcon><CollectionTag /></PdIcon></template>
          插入
        </PdButton>
        <PdButton class="header-bar__chip" :class="{ 'is-active': pagePanelActive }" native-type="button" title="打开页面设置" @click="openPagesPanel">
          <template #icon><PdIcon><Document /></PdIcon></template>
          页面
        </PdButton>
        <PdButton class="header-bar__chip" :class="{ 'is-active': viewPanelActive }" native-type="button" title="打开视图设置" @click="openViewPanel">
          <template #icon><PdIcon><View /></PdIcon></template>
          视图
        </PdButton>
        <PdButton class="header-bar__chip" :class="{ 'is-active': propertiesPanelActive }" native-type="button" title="打开元素属性" @click="openPropertiesPanel">
          <template #icon><PdIcon><Setting /></PdIcon></template>
          属性
        </PdButton>
      </section>

      <div class="header-bar__spacer"></div>

      <p class="header-bar__hint">{{ workflowHint }}</p>

      <section class="header-bar__tool-group" aria-label="文件命令">
        <span class="header-bar__group-label">文件</span>
        <PdButton class="header-bar__chip" native-type="button" title="从起始模板创建新文档" @click="emit('new-template')">
          <template #icon><PdIcon><DocumentAdd /></PdIcon></template>
          新建
        </PdButton>
        <PdButton class="header-bar__chip" native-type="button" title="打开已保存模板" @click="emit('open-template')">
          <template #icon><PdIcon><FolderOpened /></PdIcon></template>
          打开
        </PdButton>
        <PdButton class="header-bar__chip" native-type="button" title="导入模板 JSON" @click="emit('import-template')">导入</PdButton>
        <PdButton class="header-bar__chip" native-type="button" title="导出模板 JSON" @click="emit('export-template')">
          <template #icon><PdIcon><Download /></PdIcon></template>
          导出
        </PdButton>
        <PdButton class="header-bar__chip" native-type="button" title="管理元素预设" @click="emit('open-presets')">预设</PdButton>
      </section>

      <section class="header-bar__tool-group header-bar__tool-group--primary" aria-label="输出命令">
        <PdButton class="header-bar__chip is-primary" native-type="button" title="保存当前模板" @click="emit('save-template')">
          <template #icon><PdIcon><Check /></PdIcon></template>
          保存
        </PdButton>
        <PdButton class="header-bar__chip" native-type="button" title="预览运行时输出" @click="emit('preview')">
          <template #icon><PdIcon><View /></PdIcon></template>
          预览
        </PdButton>
        <PdButton class="header-bar__chip is-emphasis" native-type="button" title="打开浏览器打印" @click="emit('print')">
          <template #icon><PdIcon><Printer /></PdIcon></template>
          打印
        </PdButton>
      </section>
    </div>

    <TextFormatToolbar />
    <LayoutToolbar />
  </header>
</template>

<script setup lang="ts">import { Check, CollectionTag, Document, DocumentAdd, Download, FolderOpened, Printer, RefreshLeft, RefreshRight, Setting, View, } from "../../ui/icons.js";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdIcon from "../../ui/primitives/PdIcon.vue";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import TextFormatToolbar from "./TextFormatToolbar.vue";
import LayoutToolbar from "./LayoutToolbar.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";
const emit = defineEmits(["new-template", "open-template", "import-template", "export-template", "open-presets", "save-template", "preview", "print", "export-pdf"]) as any;
const historyStore = useEditorHistoryStore() as any;
const shellStore = useEditorShellStore() as any;
const documentStore = useEditorDocumentStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const { currentPageNumber, currentPaperLabel, dirty, documentName, saveStatus, totalPages } = storeToRefs(documentStore) as any;
const { canUndo, canRedo } = storeToRefs(historyStore) as any;
const { selectedCount } = storeToRefs(selectionStore) as any;
const { activeLeftPanel, activeRightPanel, leftDockCollapsed, rightDockCollapsed } = storeToRefs(shellStore) as any;
const templatePanelActive = computed((): any => !leftDockCollapsed.value && activeLeftPanel.value === "insert") as any;
const pagePanelActive = computed((): any => !rightDockCollapsed.value && activeRightPanel.value === "page") as any;
const viewPanelActive = computed((): any => !rightDockCollapsed.value && activeRightPanel.value === "view") as any;
const propertiesPanelActive = computed((): any => !rightDockCollapsed.value && activeRightPanel.value === "properties") as any;
const documentMeta = computed((): any => `${currentPaperLabel.value} · 第 ${currentPageNumber.value}/${totalPages.value} 页`) as any;
const saveStatusClass = computed((): any => ({
    "is-dirty": dirty.value,
    "is-saved": !dirty.value,
})) as any;
const workflowHint = computed((): any => {
    if (selectedCount.value > 0) {
        return `已选中 ${selectedCount.value} 个元素，可继续在右侧调整属性。`;
    }
    return "从左侧插入元素，完成后先预览，再决定是否打印。";
}) as any;
function openTemplatePanel(): any {
    shellStore.toggleLeftDockPanel("insert");
}
function openPagesPanel(): any {
    shellStore.toggleLeftDockPanel("pages");
}
function openViewPanel(): any {
    shellStore.toggleRightDockPanel("view");
}
function openPropertiesPanel(): any {
    shellStore.toggleRightDockPanel("properties");
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
  min-height: 38px;
  gap: 5px;
  padding: 5px 12px;
  background: #ffffff;
}

.header-bar__brand {
  gap: 7px;
  flex: 0 1 310px;
  min-width: 230px;
}

.header-bar__logo {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid #cfd8e6;
  border-radius: 3px;
  background: #f8fbff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
}

.header-bar__title-group {
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.header-bar__title {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--pd-text);
  font-size: 12px;
}

.header-bar__meta,
.header-bar__status {
  color: #718096;
  font-size: 10px;
}

.header-bar__status {
  padding: 2px 6px;
  border: 1px solid #d6e7d9;
  border-radius: 3px;
  background: #f2fbf4;
  font-weight: 700;
}

.header-bar__status.is-dirty {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.header-bar__status.is-saved {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.header-bar__tool-group {
  gap: 2px;
  flex: 0 0 auto;
}

.header-bar__tool-group--primary {
  padding-left: 4px;
}

.header-bar__group-label {
  margin-right: 2px;
  color: #8a98aa;
  font-size: 10px;
  font-weight: 700;
}

.header-bar__divider {
  width: 1px;
  height: 20px;
  align-self: center;
  margin: 0 3px;
  background: #e2e8f0;
}

.header-bar__spacer {
  flex: 1;
  min-width: 12px;
}

.header-bar__hint {
  display: -webkit-box;
  max-width: 300px;
  margin: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
}

.header-bar__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  padding: 0 7px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: #374151;
  font-size: 11px;
  cursor: pointer;
}

.header-bar__chip:hover:not(:disabled),
.header-bar__chip.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.header-bar__chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.header-bar .is-primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
}

.header-bar .is-emphasis {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}

@media (max-width: 1580px) {
  .header-bar__hint {
    display: none;
  }

  .header-bar__spacer {
    display: none;
  }
}

@media (max-width: 1280px) {
  .header-bar__row {
    flex-wrap: wrap;
  }

  .header-bar__brand {
    flex-basis: 100%;
  }
}
</style>
