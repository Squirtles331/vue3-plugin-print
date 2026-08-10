<template>
  <div ref="editorRootRef" class="editor-root">
    <div class="editor-root__frame">
      <HeaderBar
        @new-template="onNewTemplate"
        @open-template="onOpenTemplate"
        @import-template="onImportTemplate"
        @export-template="onExportTemplate"
        @open-presets="onOpenPresets"
        @save-template="onSaveTemplate"
        @preview="onPreview"
        @print="onPrint"
        @export-pdf="onExportPdf"
      />

      <div class="editor-root__body">
        <div class="editor-root__workspace-shell">
          <WorkspaceRoot />
          <FloatingPanelsLayer />
        </div>
      </div>

      <StatusBar v-if="statusbarVisible" />
    </div>

    <TemplateLibraryDialog
      v-model:visible="templateLibraryVisible"
      :templates="savedTemplates"
      :loading="templateLibraryLoading"
      @refresh="refreshTemplateLibrary"
      @select="openTemplate"
      @remove="onDeleteTemplate"
      @clear="onClearTemplateLibrary"
    />
    <StarterTemplateDialog
      v-model:visible="starterCatalogVisible"
      :templates="starterTemplates"
      @create="onCreateStarter"
    />
    <ElementPresetDialog
      v-model:visible="presetLibraryVisible"
      :presets="savedPresets"
      @insert="onInsertPreset"
      @rename="onRenamePreset"
      @remove="onRemovePreset"
    />
    <RuntimePreviewDialog
      v-model:visible="previewVisible"
      :document="previewDocument"
      :initial-data="runtimeData"
      @update:runtime-data="setRuntimeData"
      @print-error="onPrintError"
    />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import FloatingPanelsLayer from "./shell/FloatingPanelsLayer.vue";
import HeaderBar from "./shell/HeaderBar.vue";
import StatusBar from "./shell/StatusBar.vue";
import { useEditorDocumentStore } from "./stores/documentStore";
import { useEditorPreviewStore } from "./stores/previewStore";
import { useEditorShellStore } from "./stores/shellStore";
import { useEditorViewportStore } from "./stores/viewportStore";
import WorkspaceRoot from "./workspace/WorkspaceRoot.vue";
import { createLocalTemplateRepository } from "../template/templateRepository.js";
import { createLocalElementPresetRepository, instantiateElementPreset } from "../template/elementPresetRepository.js";
import { instantiateStarterTemplate, listStarterTemplates } from "../template/templateCatalog.js";
import { downloadTemplateInterchange, parseTemplateInterchange } from "../template/templateInterchange.js";
import { createPublishReadyTemplatePayload, serializeTemplateDocument } from "../template/templateDocument.js";
import { createRemoveObjectsCommand } from "./commands/documentCommands.js";
import { executeEditorCommand } from "./commands/executeCommand";
import TemplateLibraryDialog from "../template/TemplateLibraryDialog.vue";
import StarterTemplateDialog from "../template/StarterTemplateDialog.vue";
import ElementPresetDialog from "../template/ElementPresetDialog.vue";
import { useEditorHistoryStore } from "./stores/historyStore";
import { useEditorSelectionStore } from "./stores/selectionStore";

const RuntimePreviewDialog = defineAsyncComponent(() => import("../runtime/RuntimePreviewDialog.vue"));

const props = defineProps({
  repository: { type: Object, default: null },
  presetRepository: { type: Object, default: null },
});
const emit = defineEmits(["template-change", "update:runtimeData", "error"]);

const editorRootRef = ref(null);
const shellStore = useEditorShellStore();
const viewportStore = useEditorViewportStore();
const documentStore = useEditorDocumentStore();
const previewStore = useEditorPreviewStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const repository = props.repository || createLocalTemplateRepository();
const presetRepository = props.presetRepository || createLocalElementPresetRepository();
const templateLibraryVisible = ref(false);
const templateLibraryLoading = ref(false);
const savedTemplates = ref([]);
const starterCatalogVisible = ref(false);
const starterTemplates = listStarterTemplates();
const presetLibraryVisible = ref(false);
const savedPresets = ref([]);
const previewVisible = ref(false);
const previewDocument = shallowRef(null);

const { statusbarVisible } = storeToRefs(shellStore);
const { templateModel, templateId } = storeToRefs(documentStore);
const { runtimeData } = storeToRefs(previewStore);
const { selectedIds } = storeToRefs(selectionStore);

function reportError(scope, error, fallback) {
  const message = error?.message || fallback;
  ElMessage.error(message);
  emit("error", { scope, error, message });
}

function currentTemplateResult() {
  return serializeTemplateDocument(templateModel.value, { id: templateId.value });
}

watch(templateModel, () => {
  const result = currentTemplateResult();
  if (result.valid) {
    emit("template-change", result.document);
  }
}, { flush: "post" });

watch(selectedIds, (nextIds) => {
  if (nextIds.length > 0) {
    shellStore.openPanel("properties");
  }
});

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only']")) {
    return true;
  }

  return target.isContentEditable;
}

function deleteSelectedObjects() {
  const command = createRemoveObjectsCommand(documentStore, selectedIds.value);

  if (!command) {
    return false;
  }

  executeEditorCommand(historyStore, command);
  selectionStore.clearSelection();
  return true;
}

function onWindowKeyDown(event) {
  if (event.defaultPrevented || event.isComposing) {
    return;
  }

  if (event.key !== "Delete" && event.key !== "Backspace") {
    return;
  }

  if (isEditableTarget(event.target)) {
    return;
  }

  if (!selectedIds.value.length) {
    return;
  }

  if (deleteSelectedObjects()) {
    event.preventDefault();
  }
}

async function onNewTemplate() {
  starterCatalogVisible.value = true;
}

async function onCreateStarter(starterId) {
  if (documentStore.dirty) {
    try {
      await ElMessageBox.confirm("未保存的修改将丢失，是否继续新建？", "新建模板", { type: "warning" });
    } catch {
      return;
    }
  }

  try {
    documentStore.loadTemplateDocument(instantiateStarterTemplate(starterId), { markAsDirty: true });
  } catch (error) {
    ElMessage.error(error?.message || "无法创建起始模板");
    return;
  }
  historyStore.reset();
  previewStore.setRuntimeData({});
  starterCatalogVisible.value = false;
  ElMessage.success("已创建新的可编辑模板");
}

async function refreshTemplateLibrary() {
  templateLibraryLoading.value = true;
  try {
    savedTemplates.value = await repository.list();
  } catch (error) {
    reportError("repository.list", error, "无法读取模板列表");
  } finally {
    templateLibraryLoading.value = false;
  }
}

async function onOpenTemplate() {
  await refreshTemplateLibrary();
  templateLibraryVisible.value = true;
}

async function onDeleteTemplate(id) {
  try {
    const removed = await repository.delete(id);
    await refreshTemplateLibrary();
    ElMessage[removed ? "success" : "warning"](removed ? "Saved template deleted from this browser" : "Saved template no longer exists");
  } catch (error) {
    reportError("repository.delete", error, "Unable to delete the saved template");
  }
}

async function onClearTemplateLibrary() {
  if (typeof repository.clear !== "function") {
    reportError("repository.clear", null, "This template repository does not support clearing all templates.");
    return;
  }
  try {
    await repository.clear();
    await refreshTemplateLibrary();
    ElMessage.success("Saved templates cleared from this browser");
  } catch (error) {
    reportError("repository.clear", error, "Unable to clear saved templates");
  }
}

function onImportTemplate() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const imported = parseTemplateInterchange(await file.text());
    if (!imported.document) {
      ElMessage.error(imported.issues?.[0]?.message || "模板导入失败");
      return;
    }
    if (documentStore.dirty) {
      try {
        await ElMessageBox.confirm("未保存的修改将丢失，是否继续导入？", "导入模板", { type: "warning" });
      } catch {
        return;
      }
    }
    documentStore.loadTemplateDocument(imported.document, { markAsDirty: true });
    historyStore.reset();
    previewStore.setRuntimeData({});
    ElMessage.success(imported.issues.length ? "模板已导入，已应用兼容迁移" : "模板已导入");
  }, { once: true });
  input.click();
}

function onExportTemplate() {
  const result = currentTemplateResult();
  if (!result.valid) {
    ElMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  const exported = downloadTemplateInterchange(result.document, `${result.document.meta.name || "print-template"}.json`);
  if (!exported.valid) {
    ElMessage.error(exported.issues[0]?.message || "模板导出失败");
    return;
  }
  ElMessage.success("模板 JSON 已导出");
}

async function refreshPresetLibrary() {
  try {
    savedPresets.value = await presetRepository.list();
  } catch (error) {
    ElMessage.error(error?.message || "无法读取元素预设");
  }
}

async function onOpenPresets() {
  await refreshPresetLibrary();
  presetLibraryVisible.value = true;
}

async function onInsertPreset(id) {
  try {
    const preset = await presetRepository.get(id);
    if (!preset) {
      ElMessage.error("元素预设不存在或已删除");
      return;
    }
    const pageId = documentStore.currentPage?.id || "page-1";
    const nextObject = instantiateElementPreset(preset, { pageId, x: 10, y: 10, zIndex: documentStore.layers.length });
    documentStore.addObject(nextObject);
    selectionStore.select(nextObject.id);
    presetLibraryVisible.value = false;
    ElMessage.success("已插入元素预设");
  } catch (error) {
    ElMessage.error(error?.message || "插入元素预设失败");
  }
}

async function onRenamePreset(preset) {
  try {
    const { value } = await ElMessageBox.prompt("输入新的预设名称", "重命名元素预设", { inputValue: preset.name, inputPattern: /\S/, inputErrorMessage: "请输入名称" });
    await presetRepository.rename(preset.id, value);
    await refreshPresetLibrary();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error?.message || "重命名元素预设失败");
    }
  }
}

async function onRemovePreset(preset) {
  try {
    await ElMessageBox.confirm(`删除预设“${preset.name}”后不可恢复，是否继续？`, "删除元素预设", { type: "warning" });
    await presetRepository.delete(preset.id);
    await refreshPresetLibrary();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error?.message || "删除元素预设失败");
    }
  }
}

async function openTemplate(id) {
  try {
    const document = await repository.get(id);
    if (!document) {
      ElMessage.error("模板不存在或已被删除");
      return;
    }
    const result = documentStore.loadTemplateDocument(document);
    if (!result.document) {
      ElMessage.error(result.issues?.[0]?.message || "模板无法加载");
      return;
    }
    historyStore.reset();
    templateLibraryVisible.value = false;
    ElMessage.success("模板已打开");
  } catch (error) {
    ElMessage.error(error.message || "打开模板失败");
  }
}

async function onSaveTemplate() {
  const result = currentTemplateResult();
  if (!result.valid) {
    ElMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }

  try {
    const saved = await repository.save(result.document);
    documentStore.loadTemplateDocument(saved);
    await refreshTemplateLibrary();
    ElMessage.success("模板已保存到本地仓储");
  } catch (error) {
    reportError("repository.save", error, "保存模板失败");
  }
}

function onPreview() {
  const result = currentTemplateResult();
  if (!result.valid) {
    ElMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  previewDocument.value = result.document;
  previewVisible.value = true;
}

async function onPrint() {
  const result = currentTemplateResult();
  if (!result.valid) {
    ElMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  try {
    const { printRuntimeDocument } = await import("../runtime/print.js");
    await printRuntimeDocument({ document: result.document, runtimeData: runtimeData.value });
  } catch (error) {
    onPrintError(error);
  }
}

function onPrintError(error) {
  reportError("print", error, "打印输出失败");
}

function onExportPdf() {
  ElMessage.info("PDF 导出不在当前首发范围内。");
}

function setRuntimeData(data) {
  previewStore.setRuntimeData(data);
  emit("update:runtimeData", previewStore.runtimeData);
}

function loadTemplateDocument(document) {
  const result = documentStore.loadTemplateDocument(document);
  if (result.document) {
    historyStore.reset();
    selectionStore.clearSelection();
  }
  return result;
}

function getTemplateDocument() {
  return currentTemplateResult();
}

function getPublishReadyTemplatePayload() {
  const result = currentTemplateResult();
  return result.valid ? createPublishReadyTemplatePayload(result.document) : { ...result, payload: null };
}

function onWindowWheel(event) {
  if (!event.ctrlKey) {
    return;
  }

  if (!editorRootRef.value?.contains(event.target)) {
    return;
  }

  event.preventDefault();

  if (event.deltaY < 0) {
    viewportStore.zoomIn({
      mode: "pointer",
      clientX: event.clientX,
      clientY: event.clientY,
    });
    return;
  }

  viewportStore.zoomOut({
    mode: "pointer",
    clientX: event.clientX,
    clientY: event.clientY,
  });
}

onMounted(() => {
  window.addEventListener("wheel", onWindowWheel, { passive: false });
  window.addEventListener("keydown", onWindowKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", onWindowWheel);
  window.removeEventListener("keydown", onWindowKeyDown);
});

defineExpose({ setRuntimeData, getTemplateDocument, getPublishReadyTemplatePayload, loadTemplateDocument, print: onPrint });
</script>

<style scoped lang="scss">
.editor-root {
  --pd-shell-bg: #f3f4f6;
  --pd-surface-bg: #ffffff;
  --pd-panel-bg: #ffffff;
  --pd-toolbar-bg: #ffffff;
  --pd-statusbar-bg: #ffffff;
  --pd-border: #dcdfe4;
  --pd-divider: #dcdfe4;
  --pd-muted: #6b7280;
  --pd-text: #1f2328;
  --pd-strong: #1f2328;
  --pd-soft: #f8fafc;
  --pd-accent-bg: #e8f0fe;
  --pd-accent-border: #b6c8f9;
  --pd-accent-text: #1d4ed8;
  --pd-radius-panel: 0;
  --pd-radius-section: 0;
  --pd-radius-control: 2px;
  --pd-radius-chip: 2px;
  --pd-shadow-panel: none;

  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--pd-shell-bg);
  color: var(--pd-text);
}

.editor-root__frame {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.editor-root__body {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--pd-shell-bg);
}

.editor-root__workspace-shell {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

:deep(*) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(*::-webkit-scrollbar) {
  width: 0;
  height: 0;
}
</style>
