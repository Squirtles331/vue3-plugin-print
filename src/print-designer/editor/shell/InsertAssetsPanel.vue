<template>
  <section class="insert-assets-panel">
    <InsertPanel
      v-if="resolvedPanelKey === 'template'"
      :palette="palette"
      :search-query="searchQuery"
      @insert="onPaletteInsert"
      @palette-dragstart="onPaletteDragStart"
      @palette-dragend="onPaletteDragEnd"
    />
    <PagesPanel
      v-else-if="resolvedPanelKey === 'pages'"
      :pages="pages"
      :search-query="searchQuery"
      show-actions
      @select="onPageSelect"
      @create="onCreatePage"
      @duplicate="onDuplicatePage"
      @remove="onRemovePage"
      @rename="onRenamePage"
      @move="onMovePage"
    />
    <LayersPanel
      v-else-if="resolvedPanelKey === 'layers'"
      :layers="layers"
      :selected-ids="selectedIds"
      :search-query="searchQuery"
      show-actions
      @select="onLayerSelect"
      @toggle-visible="onToggleLayerVisible"
      @toggle-lock="onToggleLayerLock"
      @move="onMoveLayer"
      @duplicate="onDuplicateLayer"
      @remove="onRemoveLayer"
    />
    <DataPanel v-else :variables="variables" :search-query="searchQuery" @select="emit('bind', $event)" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import DataPanel from "../../components/sidebar/DataPanel.vue";
import InsertPanel from "../../components/sidebar/InsertPanel.vue";
import LayersPanel from "../../components/sidebar/LayersPanel.vue";
import PagesPanel from "../../components/sidebar/PagesPanel.vue";
import { createElement } from "../../core/elementFactory.js";
import { createAddObjectCommand, createRemoveObjectsCommand, createUpdateObjectPropsCommand } from "../commands/documentCommands.js";
import { executeEditorCommand } from "../commands/executeCommand.js";
import { createDuplicateCommand, createDuplicateObjects, createReorderObjectCommand } from "../commands/layoutCommands.js";
import {
  createAddPageCommand,
  createDuplicatePageCommand,
  createMovePageCommand,
  createRemovePageCommand,
  createRenamePageCommand,
} from "../commands/pageCommands.js";
import { writePaletteDragPayload } from "../drag/paletteDragPayload.js";
import { useEditorDragStore } from "../stores/dragStore";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";
import { useEditorViewportStore } from "../stores/viewportStore.js";

const props = defineProps({
  panelKey: {
    type: String,
    default: "pages",
  },
  searchQuery: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["bind"]);

const documentStore = useEditorDocumentStore();
const dragStore = useEditorDragStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const shellStore = useEditorShellStore();
const viewportStore = useEditorViewportStore();
const { palette, pages, layers, variables, objectsById, pageWidthMm, pageHeightMm } = storeToRefs(documentStore);
const { selectedIds } = storeToRefs(selectionStore);
const { allowOverflowDrag } = storeToRefs(viewportStore);
const resolvedPanelKey = computed(() => {
  if (props.panelKey === "insert") {
    return "template";
  }

  return props.panelKey || "pages";
});
const currentPageSize = computed(() => ({ widthMm: pageWidthMm.value, heightMm: pageHeightMm.value }));

function runCommand(command) {
  if (!command) {
    return false;
  }

  executeEditorCommand(historyStore, command);
  return true;
}

function onPaletteDragStart(payload) {
  const [item, event] = Array.isArray(payload) ? payload : [payload];

  if (!item || !event) {
    return;
  }

  const session = dragStore.beginPaletteDrag(item);

  if (!session) {
    return;
  }

  writePaletteDragPayload(event, item);
}

function onPaletteDragEnd() {
  dragStore.clearPaletteDrag();
}

function onPaletteInsert(item) {
  if (!item?.type) {
    return;
  }

  const pageId = documentStore.currentPage?.id || "page-1";
  const nextObject = createElement(item.type, {
    pageId,
    zIndex: documentStore.layers.length,
  });

  runCommand(createAddObjectCommand(documentStore, nextObject));
  selectionStore.select(nextObject.id);
  selectionStore.focusedPageId = pageId;
  selectionStore.hoverObjectId = null;
  shellStore.openRightDock("properties");
}

function onPageSelect(page) {
  if (!page?.id) {
    return;
  }

  const switched = documentStore.setCurrentPage(page.id);

  if (!switched) {
    return;
  }

  selectionStore.clearSelection();
  selectionStore.focusedPageId = page.id;
  selectionStore.hoverObjectId = null;
}

function syncPageFocus() {
  selectionStore.clearSelection();
  selectionStore.focusedPageId = documentStore.currentPage?.id || "page-1";
  selectionStore.hoverObjectId = null;
}

function onCreatePage() {
  if (runCommand(createAddPageCommand(documentStore, { afterPageId: documentStore.currentPage?.id }))) {
    syncPageFocus();
  }
}

function onDuplicatePage(page) {
  if (runCommand(createDuplicatePageCommand(documentStore, page?.id))) {
    syncPageFocus();
  }
}

function onRemovePage(page) {
  if (runCommand(createRemovePageCommand(documentStore, page?.id))) {
    syncPageFocus();
  }
}

function onRenamePage({ page, title }) {
  runCommand(createRenamePageCommand(documentStore, page?.id, title));
}

function onMovePage({ page, direction }) {
  runCommand(createMovePageCommand(documentStore, page?.id, direction));
}

function onLayerSelect(layerId) {
  selectionStore.select(layerId);
  selectionStore.focusedPageId = documentStore.currentPage?.id || "page-1";
  selectionStore.hoverObjectId = null;
}

function onToggleLayerVisible(layer) {
  if (!layer?.id) {
    return;
  }
  runCommand(createUpdateObjectPropsCommand(documentStore, layer.id, { visible: !layer.visible }));
  selectionStore.select(layer.id);
}

function onToggleLayerLock(layer) {
  if (!layer?.id) {
    return;
  }
  runCommand(createUpdateObjectPropsCommand(documentStore, layer.id, { locked: !layer.locked }));
  selectionStore.select(layer.id);
}

function onMoveLayer({ layer, action }) {
  if (runCommand(createReorderObjectCommand(documentStore, layer?.id, action))) {
    selectionStore.select(layer.id);
  }
}

function onDuplicateLayer(layer) {
  const object = objectsById.value[layer?.id];

  if (!object || object.locked) {
    return;
  }

  const copies = createDuplicateObjects([object], currentPageSize.value, { allowOverflow: allowOverflowDrag.value });
  if (runCommand(createDuplicateCommand(documentStore, copies))) {
    selectionStore.select(copies.map((copy) => copy.id));
  }
}

function onRemoveLayer(layer) {
  if (runCommand(createRemoveObjectsCommand(documentStore, [layer?.id]))) {
    selectionStore.clearSelection();
  }
}

onBeforeUnmount(() => {
  dragStore.clearPaletteDrag();
});
</script>

<style scoped lang="scss">
.insert-assets-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: #ffffff;
}
</style>
