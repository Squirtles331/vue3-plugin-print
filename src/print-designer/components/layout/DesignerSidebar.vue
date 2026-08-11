<template>
  <aside class="designer-sidebar">
    <SidebarTabs v-model="activeTab" :tabs="tabs" />

    <div class="designer-sidebar__panel">
      <header class="designer-sidebar__header">
        <div>
          <p class="designer-sidebar__eyebrow">{{ currentSection.eyebrow }}</p>
          <h2 class="designer-sidebar__title">{{ currentSection.title }}</h2>
        </div>
        <PdButton
          v-if="activeTab === 'pages'"
          size="small"
          type="primary"
          plain
        >
          新增页面
        </PdButton>
      </header>

      <div class="designer-sidebar__body">
        <InsertPanel
          v-if="activeTab === 'insert'"
          :palette="palette"
          @palette-dragstart="$emit('palette-dragstart', $event[0], $event[1])"
        />
        <PagesPanel v-else-if="activeTab === 'pages'" :pages="pages" @select="onPageSelect" />
        <LayersPanel v-else-if="activeTab === 'layers'" :layers="layers" />
        <DataPanel v-else :variables="variables" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useEditorDocumentStore } from "../../editor/stores/documentStore";
import { useEditorSelectionStore } from "../../editor/stores/selectionStore";
import PdButton from "../../ui/primitives/PdButton.vue";
import DataPanel from "../sidebar/DataPanel.vue";
import InsertPanel from "../sidebar/InsertPanel.vue";
import LayersPanel from "../sidebar/LayersPanel.vue";
import PagesPanel from "../sidebar/PagesPanel.vue";
import SidebarTabs from "../sidebar/SidebarTabs.vue";

const props = defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
  sections: {
    type: Array,
    default: () => [],
  },
  palette: {
    type: Array,
    default: () => [],
  },
  pages: {
    type: Array,
    default: () => [],
  },
  layers: {
    type: Array,
    default: () => [],
  },
  variables: {
    type: Array,
    default: () => [],
  },
  initialTab: {
    type: String,
    default: "insert",
  },
});

const emit = defineEmits(["palette-dragstart", "tab-change"]);
const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();

const activeTab = ref(props.initialTab);

watch(
  () => props.initialTab,
  (value) => {
    activeTab.value = value;
  }
);

watch(activeTab, (value) => {
  emit("tab-change", value);
});

const currentSection = computed(
  () => props.sections.find((item) => item.key === activeTab.value) || props.sections[0] || {}
);

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
</script>

<style scoped lang="scss">
.designer-sidebar {
  display: flex;
  min-width: 320px;
  width: 320px;
  border-right: 1px solid var(--pd-border);
  background:
    linear-gradient(180deg, rgba(26, 35, 48, 0.98), rgba(22, 30, 41, 0.98)),
    var(--pd-panel);
}

.designer-sidebar__panel {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.designer-sidebar__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--pd-border);
  background: rgba(255, 255, 255, 0.02);
}

.designer-sidebar__eyebrow {
  margin: 0 0 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pd-muted);
}

.designer-sidebar__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--pd-strong);
}

.designer-sidebar__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.designer-sidebar :deep(.pd-button--primary.pd-button--plain) {
  border-color: rgba(115, 165, 255, 0.3);
  background: rgba(79, 140, 255, 0.12);
  color: #cfe0ff;
}
</style>
