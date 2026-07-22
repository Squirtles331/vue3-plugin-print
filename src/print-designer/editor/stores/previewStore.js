import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { createPreviewStateModel } from "../documentModel.js";

export const useEditorPreviewStore = defineStore("printDesignerPreview", () => {
  const variables = ref({});
  const sampleData = ref({});
  const computedState = ref({});
  const pagination = ref({});
  const renderCache = ref({});

  const previewStateModel = computed(() =>
    createPreviewStateModel({
      variables: variables.value,
      sampleData: sampleData.value,
      computedState: computedState.value,
      pagination: pagination.value,
      renderCache: renderCache.value,
    })
  );

  return {
    variables,
    sampleData,
    computedState,
    pagination,
    renderCache,
    previewStateModel,
  };
});
