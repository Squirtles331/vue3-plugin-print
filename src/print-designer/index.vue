<template>
  <div class="print-template-studio" :style="containerStyle">
    <div ref="mountTargetRef" class="print-template-studio__mount" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import EditorRoot from "./editor/EditorRoot.vue";
import { createLocalTemplateRepository } from "./template/templateRepository.js";
import { createLocalElementPresetRepository } from "./template/elementPresetRepository.js";
import { serializeTemplateDocument } from "./template/templateDocument.js";
import { registerPrintDesignerUi } from "./ui/index.js";

defineOptions({ name: "PrintTemplateStudio" });

const props = defineProps({
  template: { type: Object, default: null },
  runtimeData: { type: Object, default: () => ({}) },
  repository: { type: Object, default: null },
  storageKey: { type: String, default: "default" },
  height: { type: [String, Number], default: 720 },
  printPolicy: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:template", "update:runtimeData", "template-change", "error", "ready"]);
const mountTargetRef = ref(null);
let editorApp = null;
let editorRoot = null;
let lastTemplateSignature = "";
let lastRuntimeSignature = "";
let resolveReady = null;
const readyPromise = new Promise((resolve) => {
  resolveReady = resolve;
});

const containerStyle = computed(() => ({
  height: typeof props.height === "number" ? `${props.height}px` : props.height || "720px",
}));

function localStorageKeys(storageKey) {
  if (!storageKey || storageKey === "default") {
    return {
      templates: "print-template-studio:templates:v1",
      presets: "print-template-studio:element-presets:v1",
    };
  }

  const namespace = storageKey.trim() || "default";
  return {
    templates: `print-template-studio:${namespace}:templates:v1`,
    presets: `print-template-studio:${namespace}:element-presets:v1`,
  };
}

function templateSignature(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const result = serializeTemplateDocument(value);
  const document = result.document || value;
  const meta = document.meta && typeof document.meta === "object" ? document.meta : {};
  return JSON.stringify({ ...document, meta: { ...meta, createdAt: "", updatedAt: "" } });
}

function runtimeSignature(value) {
  return JSON.stringify(value && typeof value === "object" && !Array.isArray(value) ? value : {});
}

function applyTemplate(value) {
  const signature = templateSignature(value);
  if (!editorRoot || !value || signature === lastTemplateSignature) {
    return;
  }

  lastTemplateSignature = signature;
  editorRoot.loadTemplateDocument(value);
}

function applyRuntimeData(value) {
  const signature = runtimeSignature(value);
  if (!editorRoot || signature === lastRuntimeSignature) {
    return;
  }

  lastRuntimeSignature = signature;
  editorRoot.setRuntimeData(value);
}

function applyPrintPolicy(value) {
  editorRoot?.setPrintPolicy(value);
}

function onTemplateChange(document) {
  lastTemplateSignature = templateSignature(document);
  emit("update:template", document);
  emit("template-change", document);
}

function onRuntimeDataChange(data) {
  lastRuntimeSignature = runtimeSignature(data);
  emit("update:runtimeData", data);
}

function onError(payload) {
  emit("error", payload);
}

onMounted(() => {
  const keys = localStorageKeys(props.storageKey);
  const repository = props.repository || createLocalTemplateRepository({ key: keys.templates });
  const presetRepository = createLocalElementPresetRepository({ key: keys.presets });
  editorApp = createApp(EditorRoot, {
    repository,
    presetRepository,
    printPolicy: props.printPolicy,
    onTemplateChange,
    onUpdateRuntimeData: onRuntimeDataChange,
    onError,
  });
  editorApp.use(createPinia());
  registerPrintDesignerUi(editorApp);
  editorRoot = editorApp.mount(mountTargetRef.value);
  applyTemplate(props.template);
  applyRuntimeData(props.runtimeData);
  emit("ready", editorRoot);
  resolveReady?.(editorRoot);
  resolveReady = null;
});

onBeforeUnmount(() => {
  editorApp?.unmount();
  editorApp = null;
  editorRoot = null;
});

watch(() => props.template, applyTemplate, { deep: true });
watch(() => props.runtimeData, applyRuntimeData, { deep: true });
watch(() => props.printPolicy, applyPrintPolicy, { deep: true });

defineExpose({
  whenReady() {
    return readyPromise;
  },
  loadTemplateDocument(document) {
    lastTemplateSignature = templateSignature(document);
    return editorRoot?.loadTemplateDocument(document);
  },
  getTemplateDocument() {
    return editorRoot?.getTemplateDocument();
  },
  getPublishReadyTemplatePayload() {
    return editorRoot?.getPublishReadyTemplatePayload();
  },
  setRuntimeData(data) {
    lastRuntimeSignature = runtimeSignature(data);
    return editorRoot?.setRuntimeData(data);
  },
  async print(data) {
    const root = editorRoot || await readyPromise;
    if (data !== undefined) {
      lastRuntimeSignature = runtimeSignature(data);
      root.setRuntimeData(data);
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
