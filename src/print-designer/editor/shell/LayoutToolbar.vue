<template>
  <section class="layout-toolbar" aria-label="布局命令">
    <span class="layout-toolbar__label">布局</span>
    <div class="layout-toolbar__group">
      <button type="button" :disabled="!hasEditableSelection" title="复制选中的未锁定元素" @click="duplicate">复制</button>
      <button type="button" :disabled="!canArrange" title="置于顶层" @click="order('front')">置顶</button>
      <button type="button" :disabled="!canArrange" title="置于底层" @click="order('back')">置底</button>
    </div>
    <div class="layout-toolbar__group">
      <button v-for="action in alignActions" :key="action.key" type="button" :disabled="!canAlign" :title="action.label" @click="align(action.key)">
        {{ action.short }}
      </button>
    </div>
    <div class="layout-toolbar__group">
      <button type="button" :disabled="!canDistribute" title="水平分布（保持最外侧元素位置）" @click="distribute('horizontal')">横分</button>
      <button type="button" :disabled="!canDistribute" title="垂直分布（保持最外侧元素位置）" @click="distribute('vertical')">纵分</button>
    </div>
    <small v-if="selectedIds.length && !hasEditableSelection">所选元素已锁定</small>
    <small v-else-if="hasEditableSelection && !canAlign">选择至少两个未锁定元素以对齐</small>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  createAlignmentPatches,
  createDistributionPatches,
  createDuplicateCommand,
  createDuplicateObjects,
  createOrderIds,
  createOrderTransactionCommand,
  createPatchTransactionCommand,
  getEditableSelection,
} from "../commands/layoutCommands.js";
import { executeEditorCommand } from "../commands/executeCommand.js";
import { useEditorDocumentStore } from "../stores/documentStore.js";
import { useEditorHistoryStore } from "../stores/historyStore.js";
import { useEditorSelectionStore } from "../stores/selectionStore.js";
import { useEditorViewportStore } from "../stores/viewportStore.js";

const documentStore = useEditorDocumentStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const viewportStore = useEditorViewportStore();
const { objectsById, currentPage, pageObjectMap, pageWidthMm, pageHeightMm } = storeToRefs(documentStore);
const { selectedIds } = storeToRefs(selectionStore);
const { allowOverflowDrag } = storeToRefs(viewportStore);

const page = computed(() => ({ widthMm: pageWidthMm.value, heightMm: pageHeightMm.value }));
const selectedObjects = computed(() => getEditableSelection(objectsById.value, selectedIds.value, currentPage.value?.id));
const hasEditableSelection = computed(() => selectedObjects.value.length > 0);
const canAlign = computed(() => selectedObjects.value.length >= 2);
const canDistribute = computed(() => selectedObjects.value.length >= 3);
const canArrange = computed(() => selectedObjects.value.length > 0);
const alignActions = [
  { key: "left", short: "左齐", label: "左对齐" },
  { key: "center", short: "中齐", label: "水平居中对齐" },
  { key: "right", short: "右齐", label: "右对齐" },
  { key: "top", short: "上齐", label: "顶端对齐" },
  { key: "middle", short: "中线", label: "垂直居中对齐" },
  { key: "bottom", short: "下齐", label: "底端对齐" },
];

function run(command) {
  if (command) {
    executeEditorCommand(historyStore, command);
  }
}

function duplicate() {
  const copies = createDuplicateObjects(selectedObjects.value, page.value, { allowOverflow: allowOverflowDrag.value });
  const command = createDuplicateCommand(documentStore, copies);
  run(command);
  if (command) {
    selectionStore.select(copies.map((object) => object.id));
  }
}

function align(action) {
  const patches = createAlignmentPatches(selectedObjects.value, action, page.value, { allowOverflow: allowOverflowDrag.value });
  run(createPatchTransactionCommand(documentStore, `Align ${action}`, patches));
}

function distribute(axis) {
  const patches = createDistributionPatches(selectedObjects.value, axis, page.value, { allowOverflow: allowOverflowDrag.value });
  run(createPatchTransactionCommand(documentStore, `Distribute ${axis}`, patches));
}

function order(action) {
  const pageId = currentPage.value?.id;
  if (!pageId) {
    return;
  }
  const nextIds = createOrderIds(pageObjectMap.value[pageId] || [], objectsById.value, selectedIds.value, action);
  run(createOrderTransactionCommand(documentStore, pageId, nextIds, action === "front" ? "Bring to front" : "Send to back"));
}
</script>

<style scoped lang="scss">
.layout-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 6px 14px;
  border-top: 1px solid var(--pd-divider);
  background: #ffffff;
}

.layout-toolbar__label,
.layout-toolbar small {
  color: var(--pd-muted);
  font-size: 11px;
}

.layout-toolbar__label {
  font-weight: 700;
}

.layout-toolbar__group {
  display: flex;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid var(--pd-divider);
}

.layout-toolbar button {
  height: 26px;
  padding: 0 7px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-control);
  background: #ffffff;
  color: #374151;
  font-size: 11px;
  cursor: pointer;
}

.layout-toolbar button:hover:not(:disabled) {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.layout-toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

@media (max-width: 1800px) {
  .layout-toolbar {
    flex-wrap: wrap;
  }
}
</style>
