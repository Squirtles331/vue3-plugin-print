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
    <PagesPanel v-else-if="resolvedPanelKey === 'pages'" :pages="pages" :search-query="searchQuery" />
    <LayersPanel v-else-if="resolvedPanelKey === 'layers'" :layers="layers" :search-query="searchQuery" />
    <DataPanel v-else :variables="variables" :search-query="searchQuery" />
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
import { createAddObjectCommand } from "../commands/documentCommands.js";
import { executeEditorCommand } from "../commands/executeCommand.js";
import { writePaletteDragPayload } from "../drag/paletteDragPayload.js";
import { useEditorDragStore } from "../stores/dragStore";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";

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

const documentStore = useEditorDocumentStore();
const dragStore = useEditorDragStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const shellStore = useEditorShellStore();
const { palette, pages, layers, variables } = storeToRefs(documentStore);
const resolvedPanelKey = computed(() => {
  if (props.panelKey === "insert") {
    return "template";
  }

  return props.panelKey || "pages";
});

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

  executeEditorCommand(historyStore, createAddObjectCommand(documentStore, nextObject));
  selectionStore.select(nextObject.id);
  selectionStore.focusedPageId = pageId;
  selectionStore.hoverObjectId = null;
  shellStore.openRightDock("properties");
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
