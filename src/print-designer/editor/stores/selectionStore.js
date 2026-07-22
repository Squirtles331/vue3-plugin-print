import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useEditorSelectionStore = defineStore("printDesignerSelection", () => {
  const selectedIds = ref([]);
  const hoverObjectId = ref(null);
  const focusedPageId = ref("page-1");
  const activeHandle = ref(null);

  const selectedCount = computed(() => selectedIds.value.length);

  function select(ids) {
    selectedIds.value = Array.isArray(ids) ? [...ids] : [ids];
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  return {
    selectedIds,
    hoverObjectId,
    focusedPageId,
    activeHandle,
    selectedCount,
    select,
    clearSelection,
  };
});
