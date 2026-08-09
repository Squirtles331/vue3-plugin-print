<template>
  <div ref="editorRootRef" class="editor-root">
    <div class="editor-root__frame">
      <HeaderBar
        @new-template="onNewTemplate"
        @open-template="onOpenTemplate"
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
    />
    <RuntimePreviewDialog
      v-model:visible="previewVisible"
      :document="previewDocument"
      :initial-data="runtimeData"
      @update:runtime-data="previewStore.setRuntimeData"
      @print-error="onPrintError"
    />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, ref } from "vue";
import FloatingPanelsLayer from "./shell/FloatingPanelsLayer.vue";
import HeaderBar from "./shell/HeaderBar.vue";
import StatusBar from "./shell/StatusBar.vue";
import { useEditorDocumentStore } from "./stores/documentStore";
import { useEditorPreviewStore } from "./stores/previewStore";
import { useEditorShellStore } from "./stores/shellStore";
import { useEditorViewportStore } from "./stores/viewportStore";
import WorkspaceRoot from "./workspace/WorkspaceRoot.vue";
import { createLocalTemplateRepository } from "../template/templateRepository.js";
import { serializeTemplateDocument } from "../template/templateDocument.js";
import TemplateLibraryDialog from "../template/TemplateLibraryDialog.vue";
import RuntimePreviewDialog from "../runtime/RuntimePreviewDialog.vue";
import { printRuntimeDocument } from "../runtime/print.js";
import { useEditorHistoryStore } from "./stores/historyStore";

const editorRootRef = ref(null);
const shellStore = useEditorShellStore();
const viewportStore = useEditorViewportStore();
const documentStore = useEditorDocumentStore();
const previewStore = useEditorPreviewStore();
const historyStore = useEditorHistoryStore();
const repository = createLocalTemplateRepository();
const templateLibraryVisible = ref(false);
const templateLibraryLoading = ref(false);
const savedTemplates = ref([]);
const previewVisible = ref(false);
const previewDocument = ref(null);

const { statusbarVisible } = storeToRefs(shellStore);
const { templateModel, templateId } = storeToRefs(documentStore);
const { runtimeData } = storeToRefs(previewStore);

function currentTemplateResult() {
  return serializeTemplateDocument(templateModel.value, { id: templateId.value });
}

async function onNewTemplate() {
  if (documentStore.dirty) {
    try {
      await ElMessageBox.confirm("未保存的修改将丢失，是否继续新建？", "新建模板", { type: "warning" });
    } catch {
      return;
    }
  }

  documentStore.createNewTemplate();
  historyStore.reset();
  previewStore.setRuntimeData({});
  ElMessage.success("已创建空白模板");
}

async function refreshTemplateLibrary() {
  templateLibraryLoading.value = true;
  try {
    savedTemplates.value = await repository.list();
  } catch (error) {
    ElMessage.error(error.message || "无法读取模板列表");
  } finally {
    templateLibraryLoading.value = false;
  }
}

async function onOpenTemplate() {
  await refreshTemplateLibrary();
  templateLibraryVisible.value = true;
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
    ElMessage.error(error.message || "保存模板失败");
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
    await printRuntimeDocument({ document: result.document, runtimeData: runtimeData.value });
  } catch (error) {
    onPrintError(error);
  }
}

function onPrintError(error) {
  ElMessage.error(error?.message || "打印输出失败");
}

function onExportPdf() {
  ElMessage.info("PDF 导出不在当前首发范围内。");
}

function setRuntimeData(data) {
  previewStore.setRuntimeData(data);
}

function getTemplateDocument() {
  return currentTemplateResult();
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
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", onWindowWheel);
});

defineExpose({ setRuntimeData, getTemplateDocument, loadTemplateDocument: documentStore.loadTemplateDocument });
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
