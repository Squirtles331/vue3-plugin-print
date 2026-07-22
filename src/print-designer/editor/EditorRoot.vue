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
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createPrintDesignerDocument } from "./documentModel.js";
import FloatingPanelsLayer from "./shell/FloatingPanelsLayer.vue";
import HeaderBar from "./shell/HeaderBar.vue";
import StatusBar from "./shell/StatusBar.vue";
import { useEditorDocumentStore } from "./stores/documentStore";
import { useEditorPreviewStore } from "./stores/previewStore";
import { useEditorShellStore } from "./stores/shellStore";
import { useEditorViewportStore } from "./stores/viewportStore";
import WorkspaceRoot from "./workspace/WorkspaceRoot.vue";

const editorRootRef = ref(null);
const shellStore = useEditorShellStore();
const viewportStore = useEditorViewportStore();
const documentStore = useEditorDocumentStore();
const previewStore = useEditorPreviewStore();

const { statusbarVisible } = storeToRefs(shellStore);
const { templateModel } = storeToRefs(documentStore);
const { viewStateModel } = storeToRefs(viewportStore);
const { previewStateModel } = storeToRefs(previewStore);

function onNewTemplate() {
  ElMessage.info("新建模板流程会在后续业务接入时补齐。");
}

function onOpenTemplate() {
  ElMessage.info("打开模板流程会在后续业务接入时补齐。");
}

function onSaveTemplate() {
  documentStore.markSaved();
  ElMessage.success("当前设计器框架已保存状态，后续会继续接入正式保存流程。");
}

function onPreview() {
  const previewDocument = createPrintDesignerDocument({
    template: templateModel.value,
    viewState: viewStateModel.value,
    previewState: previewStateModel.value,
  });

  console.debug("[print-designer] preview-document", previewDocument);
  ElMessage.info("预览流程会在打印元素渲染完成后继续补齐。");
}

function onPrint() {
  ElMessage.info("打印流程会在后续业务接入时补齐。");
}

function onExportPdf() {
  ElMessage.info("PDF 导出流程会在后续业务接入时补齐。");
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
