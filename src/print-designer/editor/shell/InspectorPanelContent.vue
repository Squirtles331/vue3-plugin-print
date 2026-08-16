<template>
  <div class="inspector-panel-content">
    <PageSetupPanel v-if="activeKey === 'page'" />
    <ElementPropertiesPanel v-else-if="activeKey === 'properties'" />
    <ViewSettingsPanel v-else-if="activeKey === 'view'" />
    <StructurePanel
      v-else-if="activeKey === 'structure'"
      :layers="layers"
      :selected-ids="selectedIds"
      @select="selectionStore.select($event)"
    />
    <BindingPanel v-else :variables="variables" />
  </div>
</template>

<script setup lang="ts">import { storeToRefs } from "pinia";
import StructurePanel from "../../components/inspector/StructurePanel.vue";
import BindingPanel from "../panels/BindingPanel.vue";
import ElementPropertiesPanel from "../panels/ElementPropertiesPanel.vue";
import PageSetupPanel from "../panels/PageSetupPanel.vue";
import ViewSettingsPanel from "../panels/ViewSettingsPanel.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
defineProps({
    activeKey: {
        type: String,
        default: "properties",
    },
});
const documentStore = useEditorDocumentStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const { layers, variables } = storeToRefs(documentStore) as any;
const { selectedIds } = storeToRefs(selectionStore) as any;
</script>

<style scoped lang="scss">
.inspector-panel-content {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: transparent;
}
</style>
