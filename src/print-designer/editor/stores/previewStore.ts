import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { createPreviewStateModel } from "../documentModel.js";
export const useEditorPreviewStore = defineStore("printDesignerPreview", (): any => {
    const variables = ref({}) as any;
    const sampleData = ref({}) as any;
    const computedState = ref({}) as any;
    const pagination = ref({}) as any;
    const renderCache = ref({}) as any;
    const runtimeData = ref({}) as any;
    const previewStateModel = computed((): any => createPreviewStateModel({
        variables: variables.value,
        sampleData: sampleData.value,
        computedState: computedState.value,
        pagination: pagination.value,
        renderCache: renderCache.value,
    })) as any;
    return {
        variables,
        sampleData,
        computedState,
        pagination,
        renderCache,
        runtimeData,
        setRuntimeData(value: any): any {
            runtimeData.value = value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
        },
        previewStateModel,
    };
}) as any;
