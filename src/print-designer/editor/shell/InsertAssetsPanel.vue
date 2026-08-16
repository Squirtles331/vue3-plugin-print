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
    <RuntimeDataPanel
      v-else
      :runtime-data="runtimeData"
      :variables="variables"
      :selected-count="selectedIds.length"
      :search-query="searchQuery"
      @update:runtime-data="emit('runtime-data', $event)"
      @bind="emit('bind', $event)"
    />
  </section>
</template>

<script setup lang="ts">import { computed, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import InsertPanel from "../../components/sidebar/InsertPanel.vue";
import LayersPanel from "../../components/sidebar/LayersPanel.vue";
import PagesPanel from "../../components/sidebar/PagesPanel.vue";
import RuntimeDataPanel from "../panels/RuntimeDataPanel.vue";
import { createRemoveObjectsCommand, createUpdateObjectPropsCommand } from "../commands/documentCommands.js";
import { executeEditorCommand } from "../commands/executeCommand.js";
import { createDuplicateCommand, createDuplicateObjects, createReorderObjectCommand } from "../commands/layoutCommands.js";
import { createAddPageCommand, createDuplicatePageCommand, createMovePageCommand, createRemovePageCommand, createRenamePageCommand, } from "../commands/pageCommands.js";
import { writePaletteDragPayload } from "../drag/paletteDragPayload.js";
import { useEditorDragStore } from "../stores/dragStore";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorShellStore } from "../stores/shellStore";
import { useEditorViewportStore } from "../stores/viewportStore.js";
import { useEditorPreviewStore } from "../stores/previewStore.js";
const props = defineProps({
    panelKey: {
        type: String,
        default: "pages",
    },
    searchQuery: {
        type: String,
        default: "",
    },
}) as any;
const emit = defineEmits(["bind", "runtime-data"]) as any;
const documentStore = useEditorDocumentStore() as any;
const dragStore = useEditorDragStore() as any;
const historyStore = useEditorHistoryStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const shellStore = useEditorShellStore() as any;
const viewportStore = useEditorViewportStore() as any;
const previewStore = useEditorPreviewStore() as any;
const { palette, pages, layers, variables, objectsById, pageWidthMm, pageHeightMm } = storeToRefs(documentStore) as any;
const { selectedIds } = storeToRefs(selectionStore) as any;
const { runtimeData } = storeToRefs(previewStore) as any;
const { allowOverflowDrag } = storeToRefs(viewportStore) as any;
const resolvedPanelKey = computed((): any => {
    if (props.panelKey === "insert") {
        return "template";
    }
    return props.panelKey || "pages";
}) as any;
const currentPageSize = computed((): any => ({ widthMm: pageWidthMm.value, heightMm: pageHeightMm.value })) as any;
function runCommand(command: any): any {
    if (!command) {
        return false;
    }
    executeEditorCommand(historyStore, command);
    return true;
}
function onPaletteDragStart(payload: any): any {
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
function onPaletteDragEnd(): any {
    dragStore.clearPaletteDrag();
}
function onPaletteInsert(item: any): any {
    dragStore.requestPaletteInsert(item);
    shellStore.openRightDock("properties");
}
function onPageSelect(page: any): any {
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
function syncPageFocus(): any {
    selectionStore.clearSelection();
    selectionStore.focusedPageId = documentStore.currentPage?.id || "page-1";
    selectionStore.hoverObjectId = null;
}
function onCreatePage(): any {
    if (runCommand(createAddPageCommand(documentStore, { afterPageId: documentStore.currentPage?.id }))) {
        syncPageFocus();
    }
}
function onDuplicatePage(page: any): any {
    if (runCommand(createDuplicatePageCommand(documentStore, page?.id))) {
        syncPageFocus();
    }
}
function onRemovePage(page: any): any {
    if (runCommand(createRemovePageCommand(documentStore, page?.id))) {
        syncPageFocus();
    }
}
function onRenamePage({ page, title }: any): any {
    runCommand(createRenamePageCommand(documentStore, page?.id, title));
}
function onMovePage({ page, direction }: any): any {
    runCommand(createMovePageCommand(documentStore, page?.id, direction));
}
function onLayerSelect(layerId: any): any {
    const group = documentStore.currentPage?.groups?.find((candidate: any): any => candidate.elementIds?.includes(layerId));
    if (group) {
        selectionStore.selectGroup(group);
    }
    else {
        selectionStore.select(layerId);
    }
    selectionStore.focusedPageId = documentStore.currentPage?.id || "page-1";
    selectionStore.hoverObjectId = null;
}
function onToggleLayerVisible(layer: any): any {
    if (!layer?.id) {
        return;
    }
    runCommand(createUpdateObjectPropsCommand(documentStore, layer.id, { visible: !layer.visible }));
    selectionStore.select(layer.id);
}
function onToggleLayerLock(layer: any): any {
    if (!layer?.id) {
        return;
    }
    runCommand(createUpdateObjectPropsCommand(documentStore, layer.id, { locked: !layer.locked }));
    selectionStore.select(layer.id);
}
function onMoveLayer({ layer, action }: any): any {
    if (runCommand(createReorderObjectCommand(documentStore, layer?.id, action))) {
        selectionStore.select(layer.id);
    }
}
function onDuplicateLayer(layer: any): any {
    const object = objectsById.value[layer?.id];
    if (!object || object.locked) {
        return;
    }
    const copies = createDuplicateObjects([object], currentPageSize.value, { allowOverflow: allowOverflowDrag.value });
    if (runCommand(createDuplicateCommand(documentStore, copies))) {
        selectionStore.select(copies.map((copy: any): any => copy.id));
    }
}
function onRemoveLayer(layer: any): any {
    if (runCommand(createRemoveObjectsCommand(documentStore, [layer?.id]))) {
        selectionStore.clearSelection();
    }
}
onBeforeUnmount((): any => {
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
