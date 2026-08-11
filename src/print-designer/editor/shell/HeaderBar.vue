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
        <button type="button" class="header-bar__chip" :disabled="!canUndo" title="撤销上一步操作" @click="historyStore.undo()">
          <el-icon><RefreshLeft /></el-icon>
          撤销
        </button>
        <button type="button" class="header-bar__chip" :disabled="!canRedo" title="重做刚才撤销的操作" @click="historyStore.redo()">
          <el-icon><RefreshRight /></el-icon>
          重做
        </button>
      </section>

      <div class="header-bar__divider"></div>

      <section class="header-bar__tool-group" aria-label="面板切换">
        <span class="header-bar__group-label">面板</span>
        <button
          class="header-bar__chip"
          :class="{ 'is-active': templatePanelActive }"
          type="button"
          title="打开左侧插入面板"
          @click="openTemplatePanel"
        >
          <el-icon><CollectionTag /></el-icon>
          插入
        </button>
        <button class="header-bar__chip" :class="{ 'is-active': pagePanelActive }" type="button" title="打开页面设置" @click="openPagesPanel">
          <el-icon><Document /></el-icon>
          页面
        </button>
        <button class="header-bar__chip" :class="{ 'is-active': viewPanelActive }" type="button" title="打开视图设置" @click="openViewPanel">
          <el-icon><View /></el-icon>
          视图
        </button>
        <button class="header-bar__chip" :class="{ 'is-active': propertiesPanelActive }" type="button" title="打开元素属性" @click="openPropertiesPanel">
          <el-icon><Setting /></el-icon>
          属性
        </button>
      </section>

      <div class="header-bar__spacer"></div>

      <p class="header-bar__hint">{{ workflowHint }}</p>

      <section class="header-bar__tool-group" aria-label="文件命令">
        <span class="header-bar__group-label">文件</span>
        <button class="header-bar__chip" type="button" title="从起始模板创建新文档" @click="emit('new-template')">
          <el-icon><DocumentAdd /></el-icon>
          新建
        </button>
        <button class="header-bar__chip" type="button" title="打开已保存模板" @click="emit('open-template')">
          <el-icon><FolderOpened /></el-icon>
          打开
        </button>
        <button class="header-bar__chip" type="button" title="导入模板 JSON" @click="emit('import-template')">导入</button>
        <button class="header-bar__chip" type="button" title="导出模板 JSON" @click="emit('export-template')">
          <el-icon><Download /></el-icon>
          导出
        </button>
        <button class="header-bar__chip" type="button" title="管理元素预设" @click="emit('open-presets')">预设</button>
      </section>

      <section class="header-bar__tool-group header-bar__tool-group--primary" aria-label="输出命令">
        <button class="header-bar__chip is-primary" type="button" title="保存当前模板" @click="emit('save-template')">
          <el-icon><Check /></el-icon>
          保存
        </button>
        <button class="header-bar__chip" type="button" title="预览运行时输出" @click="emit('preview')">
          <el-icon><View /></el-icon>
          预览
        </button>
        <button class="header-bar__chip is-emphasis" type="button" title="打开浏览器打印" @click="emit('print')">
          <el-icon><Printer /></el-icon>
          打印
        </button>
      </section>
    </div>

    <TextFormatToolbar />
    <LayoutToolbar />
  </header>
</template>

<script setup>
import {
  Check,
  CollectionTag,
  Document,
  DocumentAdd,
  Download,
  FolderOpened,
  Printer,
  RefreshLeft,
  RefreshRight,
  Setting,
  View,
} from "@element-plus/icons-vue";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import TextFormatToolbar from "./TextFormatToolbar.vue";
import LayoutToolbar from "./LayoutToolbar.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";

const emit = defineEmits(["new-template", "open-template", "import-template", "export-template", "open-presets", "save-template", "preview", "print", "export-pdf"]);

const historyStore = useEditorHistoryStore();
const shellStore = useEditorShellStore();
const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();

const { currentPageNumber, currentPaperLabel, dirty, documentName, saveStatus, totalPages } = storeToRefs(documentStore);
const { canUndo, canRedo } = storeToRefs(historyStore);
const { selectedCount } = storeToRefs(selectionStore);
const { activeLeftPanel, activeRightPanel, leftDockCollapsed, rightDockCollapsed } = storeToRefs(shellStore);

const templatePanelActive = computed(() => !leftDockCollapsed.value && activeLeftPanel.value === "insert");
const pagePanelActive = computed(() => !rightDockCollapsed.value && activeRightPanel.value === "page");
const viewPanelActive = computed(() => !rightDockCollapsed.value && activeRightPanel.value === "view");
const propertiesPanelActive = computed(() => !rightDockCollapsed.value && activeRightPanel.value === "properties");

const documentMeta = computed(() => `${currentPaperLabel.value} · 第 ${currentPageNumber.value}/${totalPages.value} 页`);
const saveStatusClass = computed(() => ({
  "is-dirty": dirty.value,
  "is-saved": !dirty.value,
}));

const workflowHint = computed(() => {
  if (selectedCount.value > 0) {
    return `已选中 ${selectedCount.value} 个元素，可继续在右侧调整属性。`;
  }

  return "从左侧插入元素，完成后先预览，再决定是否打印。";
});

function openTemplatePanel() {
  shellStore.toggleLeftDockPanel("insert");
}

function openPagesPanel() {
  shellStore.toggleRightDockPanel("page");
}

function openViewPanel() {
  shellStore.toggleRightDockPanel("view");
}

function openPropertiesPanel() {
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
  gap: 8px;
  padding: 7px 12px;
}

.header-bar__brand {
  gap: 8px;
  flex: 0 1 300px;
  min-width: 220px;
}

.header-bar__logo {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 1px solid var(--pd-border);
  background: var(--pd-surface-bg);
  color: var(--pd-text);
  font-size: 11px;
  font-weight: 800;
}

.header-bar__title-group {
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.header-bar__title {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--pd-text);
  font-size: 12px;
}

.header-bar__meta,
.header-bar__status {
  color: var(--pd-muted);
  font-size: 10px;
}

.header-bar__status {
  padding: 2px 7px;
  border: 1px solid #d9dee8;
  border-radius: 999px;
  background: #ffffff;
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
  gap: 5px;
  flex: 0 0 auto;
}

.header-bar__tool-group--primary {
  padding-left: 4px;
}

.header-bar__group-label {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
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

.header-bar__hint {
  max-width: 240px;
  margin: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-bar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
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

.header-bar .is-emphasis {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
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
