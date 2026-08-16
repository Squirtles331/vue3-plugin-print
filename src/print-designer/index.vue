<template>
  <div class="print-template-studio" :style="containerStyle">
    <div ref="mountTargetRef" class="print-template-studio__mount" />
  </div>
</template>

<script setup lang="ts">import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import EditorRoot from "./editor/EditorRoot.vue";
import { createLocalTemplateRepository } from "./template/templateRepository.js";
import { createLocalRuntimeDataDraftRepository } from "./template/runtimeDataDraftRepository.js";
import { createLocalElementPresetRepository } from "./template/elementPresetRepository.js";
import { serializeTemplateDocument } from "./template/templateDocument.js";
import { registerPrintDesignerUi } from "./ui/index.js";
defineOptions({ name: "PrintTemplateStudio" });
const props = defineProps({
    template: { type: Object, default: null },
    runtimeData: { type: Object, default: undefined },
    repository: { type: Object, default: null },
    storageKey: { type: String, default: "default" },
    height: { type: [String, Number], default: 720 },
    printPolicy: { type: Object, default: (): any => ({}) },
}) as any;
const emit = defineEmits(["update:template", "update:runtimeData", "template-change", "error", "ready"]) as any;
const mountTargetRef = ref(null) as any;
let editorApp = null as any;
let editorRoot = null as any;
let lastTemplateSignature = "" as any;
let lastRuntimeSignature = "" as any;
let resolveReady = null as any;
const readyPromise = new Promise((resolve: any): any => {
    resolveReady = resolve;
}) as any;
const containerStyle = computed((): any => ({
    height: typeof props.height === "number" ? `${props.height}px` : props.height || "720px",
})) as any;
function localStorageKeys(storageKey: any): any {
    if (!storageKey || storageKey === "default") {
        return {
            templates: "print-template-studio:templates:v2",
            presets: "print-template-studio:element-presets:v1",
            runtimeDataDrafts: "print-template-studio:runtime-data-drafts:v2",
        };
    }
    const namespace = storageKey.trim() || "default";
    return {
        templates: `print-template-studio:${namespace}:templates:v2`,
        presets: `print-template-studio:${namespace}:element-presets:v1`,
        runtimeDataDrafts: `print-template-studio:${namespace}:runtime-data-drafts:v2`,
    };
}
function templateSignature(value: any): any {
    if (!value || typeof value !== "object") {
        return "";
    }
    const result = serializeTemplateDocument(value);
    const document = result.document || value;
    const meta = document.meta && typeof document.meta === "object" ? document.meta : {};
    return JSON.stringify({ ...document, meta: { ...meta, createdAt: "", updatedAt: "" } });
}
function runtimeSignature(value: any): any {
    return JSON.stringify(value && typeof value === "object" && !Array.isArray(value) ? value : {});
}
async function applyTemplate(value: any): Promise<any> {
    const signature = templateSignature(value);
    if (!editorRoot || !value || signature === lastTemplateSignature) {
        return;
    }
    const result = await editorRoot.replaceTemplateDocument(value);
    if (result?.document) {
        lastTemplateSignature = signature;
    }
}
function applyRuntimeData(value: any): any {
    if (value === undefined || value === null) {
        return;
    }
    const signature = runtimeSignature(value);
    if (!editorRoot || signature === lastRuntimeSignature) {
        return;
    }
    lastRuntimeSignature = signature;
    editorRoot.setHostRuntimeData(value);
}
function applyPrintPolicy(value: any): any {
    editorRoot?.setPrintPolicy(value);
}
function onTemplateChange(document: any): any {
    lastTemplateSignature = templateSignature(document);
    emit("update:template", document);
    emit("template-change", document);
}
function onRuntimeDataChange(data: any): any {
    lastRuntimeSignature = runtimeSignature(data);
    emit("update:runtimeData", data);
}
function onError(payload: any): any {
    emit("error", payload);
}
onMounted((): any => {
    const keys = localStorageKeys(props.storageKey);
    const repository = props.repository || createLocalTemplateRepository({ key: keys.templates });
    const presetRepository = createLocalElementPresetRepository({ key: keys.presets });
    const runtimeDataRepository = createLocalRuntimeDataDraftRepository({ key: keys.runtimeDataDrafts });
    editorApp = createApp(EditorRoot, {
        repository,
        presetRepository,
        runtimeDataRepository,
        runtimeData: props.runtimeData,
        printPolicy: props.printPolicy,
        onTemplateChange,
        onUpdateRuntimeData: onRuntimeDataChange,
        onError,
    });
    editorApp.use(createPinia());
    registerPrintDesignerUi(editorApp);
    editorRoot = editorApp.mount(mountTargetRef.value);
    void applyTemplate(props.template);
    applyRuntimeData(props.runtimeData);
    emit("ready", editorRoot);
    resolveReady?.(editorRoot);
    resolveReady = null;
});
onBeforeUnmount((): any => {
    editorApp?.unmount();
    editorApp = null;
    editorRoot = null;
});
watch((): any => props.template, (value: any): any => { void applyTemplate(value); }, { deep: true });
watch((): any => props.runtimeData, applyRuntimeData, { deep: true });
watch((): any => props.printPolicy, applyPrintPolicy, { deep: true });
defineExpose({
    whenReady(): any {
        return readyPromise;
    },
    loadTemplateDocument(document: any): any {
        lastTemplateSignature = templateSignature(document);
        return editorRoot?.loadTemplateDocument(document);
    },
    async replaceTemplateDocument(document: any): Promise<any> {
        const result = await editorRoot?.replaceTemplateDocument(document) as any;
        if (result?.document) {
            lastTemplateSignature = templateSignature(document);
        }
        return result;
    },
    getTemplateDocument(): any {
        return editorRoot?.getTemplateDocument();
    },
    getPublishReadyTemplatePayload(): any {
        return editorRoot?.getPublishReadyTemplatePayload();
    },
    setRuntimeData(data: any): any {
        lastRuntimeSignature = runtimeSignature(data);
        return editorRoot?.setHostRuntimeData(data);
    },
    async print(data: any): Promise<any> {
        const root = editorRoot || await readyPromise as any;
        if (data !== undefined) {
            lastRuntimeSignature = runtimeSignature(data);
            root.setHostRuntimeData(data);
        }
        return root.print();
    },
});
</script>

<style scoped lang="scss">
.print-template-studio,
.print-template-studio__mount,
.print-template-studio__mount :deep(.editor-root) {
  width: 100%;
  min-height: 0;
}

.print-template-studio {
  overflow: hidden;
}

.print-template-studio__mount,
.print-template-studio__mount :deep(.editor-root) {
  height: 100%;
}
</style>
