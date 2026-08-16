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
        <LeftDock @bind="onBindPath" @runtime-data="setRuntimeData" />
        <div class="editor-root__workspace-shell">
          <WorkspaceRoot />
        </div>
        <RightPanelDock @bind="onBindPath" />
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
      :initial-data="previewRuntimeData"
      :print-policy="activePrintPolicy"
      @focus-issue="onFocusIssue"
      @print-error="onPrintError"
    />
  </div>
</template>

<script setup>
import { PdMessage, PdMessageBox } from "../ui/feedback.js";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import HeaderBar from "./shell/HeaderBar.vue";
import LeftDock from "./shell/LeftDock.vue";
import RightPanelDock from "./shell/RightPanelDock.vue";
import StatusBar from "./shell/StatusBar.vue";
import { useEditorDocumentStore } from "./stores/documentStore";
import { useEditorPreviewStore } from "./stores/previewStore";
import { useEditorShellStore } from "./stores/shellStore";
import { useEditorViewportStore } from "./stores/viewportStore";
import WorkspaceRoot from "./workspace/WorkspaceRoot.vue";
import { createLocalTemplateRepository } from "../template/templateRepository.js";
import { createLocalRuntimeDataDraftRepository } from "../template/runtimeDataDraftRepository.js";
import { createLocalElementPresetRepository, instantiateElementPreset } from "../template/elementPresetRepository.js";
import { instantiateStarterTemplate, listStarterTemplates } from "../template/templateCatalog.js";
import { downloadTemplateInterchange, parseTemplateInterchange } from "../template/templateInterchange.js";
import { createPublishReadyTemplatePayload, serializeTemplateDocument } from "../template/templateDocument.js";
import { validatePrintRuntime } from "../runtime/preflight.js";
import { collectRuntimeBindingPaths } from "../runtime/bindingPaths.js";
import { resolveDataPath } from "../runtime/dataResolver.js";
import { createRemoveObjectsCommand, createUpdateObjectPropsCommand } from "./commands/documentCommands.js";
import { executeEditorCommand } from "./commands/executeCommand";
import { createDuplicateObjects, createPatchTransactionCommand } from "./commands/layoutCommands.js";
import { createGroupCommand, createUngroupCommand } from "./commands/groupCommands.js";
import { cloneDeep } from "../core/clone.js";
import TemplateLibraryDialog from "../template/TemplateLibraryDialog.vue";
import StarterTemplateDialog from "../template/StarterTemplateDialog.vue";
import ElementPresetDialog from "../template/ElementPresetDialog.vue";
import { useEditorHistoryStore } from "./stores/historyStore";
import { useEditorSelectionStore } from "./stores/selectionStore";

const RuntimePreviewDialog = defineAsyncComponent(() => import("../runtime/RuntimePreviewDialog.vue"));

const props = defineProps({
  repository: { type: Object, default: null },
  presetRepository: { type: Object, default: null },
  runtimeDataRepository: { type: Object, default: null },
  runtimeData: { type: Object, default: undefined },
  printPolicy: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["template-change", "template-migrated", "update:runtimeData", "error"]);

const editorRootRef = ref(null);
const shellStore = useEditorShellStore();
const viewportStore = useEditorViewportStore();
const documentStore = useEditorDocumentStore();
const previewStore = useEditorPreviewStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const repository = props.repository || createLocalTemplateRepository();
const presetRepository = props.presetRepository || createLocalElementPresetRepository();
const runtimeDataRepository = props.runtimeDataRepository || createLocalRuntimeDataDraftRepository();
const activePrintPolicy = ref(props.printPolicy);
const templateLibraryVisible = ref(false);
const templateLibraryLoading = ref(false);
const savedTemplates = ref([]);
const starterCatalogVisible = ref(false);
const starterTemplates = listStarterTemplates();
const presetLibraryVisible = ref(false);
const savedPresets = ref([]);
const previewVisible = ref(false);
const previewDocument = shallowRef(null);
const hostRuntimeData = ref(props.runtimeData);
const hasHostRuntimeData = ref(props.runtimeData !== undefined && props.runtimeData !== null);
let runtimeDataRevision = 0;
let runtimeDraftTimer = null;

const { statusbarVisible } = storeToRefs(shellStore);
const { templateModel, templateId, objectsById, currentPage, currentPageGroups, pageWidthMm, pageHeightMm } = storeToRefs(documentStore);
const { runtimeData: previewRuntimeData } = storeToRefs(previewStore);
const { selectedIds } = storeToRefs(selectionStore);
const { allowOverflowDrag } = storeToRefs(viewportStore);
let elementClipboard = null;

function reportError(scope, error, fallback) {
  const message = error?.message || fallback;
  PdMessage.error(message);
  emit("error", {
    scope,
    error,
    message,
    ...(Array.isArray(error?.issues) ? { issues: error.issues } : {}),
  });
}

function currentTemplateResult() {
  return serializeTemplateDocument(templateModel.value, { id: templateId.value });
}

function emitMigration(result) {
  if (!result?.document || !Number.isFinite(result.fromVersion) || result.fromVersion >= result.document.schemaVersion) {
    return;
  }
  emit("template-migrated", { fromVersion: result.fromVersion, document: result.document, issues: result.issues || [] });
}

function scheduleRuntimeDataDraftSave(data) {
  window.clearTimeout(runtimeDraftTimer);
  const templateIdForDraft = templateId.value;
  runtimeDraftTimer = window.setTimeout(async () => {
    try {
      await runtimeDataRepository.save(templateIdForDraft, data);
    } catch (error) {
      reportError("runtime-data-draft.save", error, "无法保存测试数据草稿");
    }
  }, 180);
}

async function restoreRuntimeDataForTemplate() {
  const revision = runtimeDataRevision;
  if (hasHostRuntimeData.value) {
    setRuntimeData(hostRuntimeData.value, { persist: false, emitChange: false });
    return;
  }
  try {
    const draft = await runtimeDataRepository.get(templateId.value);
    if (revision === runtimeDataRevision) {
      setRuntimeData(draft || {}, { persist: false, emitChange: false });
    }
  } catch (error) {
    reportError("runtime-data-draft.get", error, "无法恢复测试数据草稿");
  }
}

watch(templateModel, () => {
  const result = currentTemplateResult();
  if (result.valid) {
    emit("template-change", result.document);
  }
}, { flush: "post" });

watch(selectedIds, (nextIds) => {
  if (nextIds.length > 0) {
    shellStore.openRightDock("properties");
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
  const command = createRemoveObjectsCommand(documentStore, expandedSelectedIds());

  if (!command) {
    return false;
  }

  executeEditorCommand(historyStore, command);
  selectionStore.clearSelection();
  return true;
}

function expandedSelectedIds(ids = selectedIds.value) {
  const expanded = new Set(ids);
  currentPageGroups.value.forEach((group) => {
    if (group.elementIds?.some((id) => expanded.has(id))) {
      group.elementIds.forEach((id) => expanded.add(id));
    }
  });
  return [...expanded];
}

function selectedCurrentPageObjects({ editable = false } = {}) {
  const pageId = currentPage.value?.id;
  return expandedSelectedIds()
    .map((id) => objectsById.value[id])
    .filter((object) => object && object.pageId === pageId && (!editable || !object.locked));
}

function copySelectedObjects() {
  const objects = selectedCurrentPageObjects();
  if (!objects.length) {
    return false;
  }
  const selected = new Set(objects.map((object) => object.id));
  elementClipboard = {
    objects: cloneDeep(objects),
    groups: cloneDeep(currentPageGroups.value.filter((group) => group.elementIds?.every((id) => selected.has(id)))),
  };
  return true;
}

function pasteCopiedObjects() {
  if (!elementClipboard?.objects?.length || !currentPage.value) {
    return false;
  }
  const pageId = currentPage.value.id;
  const copies = createDuplicateObjects(elementClipboard.objects, {
    widthMm: pageWidthMm.value,
    heightMm: pageHeightMm.value,
  }, { allowOverflow: allowOverflowDrag.value });
  const originalGroups = cloneDeep(currentPageGroups.value);
  const copiedIds = new Map(elementClipboard.objects.map((object, index) => [object.id, copies[index]?.id]));
  const copiedGroups = elementClipboard.groups
    .map((group, index) => ({
      id: `${group.id}-copy-${Date.now()}-${index}`,
      name: `${group.name || "Group"} 副本`,
      elementIds: group.elementIds.map((id) => copiedIds.get(id)).filter(Boolean),
    }))
    .filter((group) => group.elementIds.length >= 2);
  const command = {
    id: `paste-elements-${Date.now()}`,
    label: "Paste elements",
    execute() {
      documentStore.addObjects(copies);
      if (copiedGroups.length) {
        documentStore.setPageGroups(pageId, [...originalGroups, ...copiedGroups]);
      }
    },
    undo() {
      documentStore.removeObjects(copies.map((object) => object.id));
      documentStore.setPageGroups(pageId, originalGroups);
    },
  };
  executeEditorCommand(historyStore, command);
  selectionStore.select(copies.map((object) => object.id));
  return true;
}

function nudgeSelection(event) {
  const objects = selectedCurrentPageObjects({ editable: true });
  if (!objects.length) {
    return false;
  }
  const step = event.altKey ? 0.1 : event.shiftKey ? 10 : 1;
  const deltas = {
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 },
    ArrowUp: { x: 0, y: -step },
    ArrowDown: { x: 0, y: step },
  };
  const delta = deltas[event.key];
  if (!delta) {
    return false;
  }
  const clamp = (value, size, pageSize) => allowOverflowDrag.value
    ? +value.toFixed(2)
    : +Math.min(Math.max(0, value), Math.max(0, pageSize - size)).toFixed(2);
  const patches = objects.map((object) => ({
    id: object.id,
    patch: {
      x: clamp(object.x + delta.x, object.width, pageWidthMm.value),
      y: clamp(object.y + delta.y, object.height, pageHeightMm.value),
    },
  }));
  executeEditorCommand(historyStore, createPatchTransactionCommand(documentStore, "Nudge selection", patches));
  return true;
}

function groupSelectedObjects() {
  const objects = selectedCurrentPageObjects({ editable: true });
  const result = createGroupCommand(documentStore, currentPage.value?.id, objects.map((object) => object.id));
  if (!result) {
    return false;
  }
  executeEditorCommand(historyStore, result.command);
  selectionStore.selectGroup(result.group);
  return true;
}

function ungroupSelectedObjects() {
  const selected = new Set(expandedSelectedIds());
  const groupIds = currentPageGroups.value.filter((group) => group.elementIds?.some((id) => selected.has(id))).map((group) => group.id);
  const command = createUngroupCommand(documentStore, currentPage.value?.id, groupIds);
  if (!command) {
    return false;
  }
  executeEditorCommand(historyStore, command);
  return true;
}

function onWindowKeyDown(event) {
  if (event.defaultPrevented || event.isComposing) {
    return;
  }

  if (isEditableTarget(event.target)) {
    return;
  }

  const modifier = event.ctrlKey || event.metaKey;
  const key = String(event.key || "").toLowerCase();
  if (modifier && key === "z") {
    if (event.shiftKey) {
      historyStore.redo();
    } else {
      historyStore.undo();
    }
    event.preventDefault();
    return;
  }
  if (modifier && key === "y") {
    historyStore.redo();
    event.preventDefault();
    return;
  }
  if (modifier && key === "a") {
    selectionStore.select((documentStore.pageObjectMap[currentPage.value?.id] || []).filter(Boolean));
    event.preventDefault();
    return;
  }
  if (modifier && key === "c") {
    if (copySelectedObjects()) {
      event.preventDefault();
    }
    return;
  }
  if (modifier && key === "x") {
    if (copySelectedObjects() && deleteSelectedObjects()) {
      event.preventDefault();
    }
    return;
  }
  if (modifier && key === "v") {
    if (pasteCopiedObjects()) {
      event.preventDefault();
    }
    return;
  }
  if (modifier && key === "g") {
    const changed = event.shiftKey ? ungroupSelectedObjects() : groupSelectedObjects();
    if (changed) {
      event.preventDefault();
    }
    return;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    if (nudgeSelection(event)) {
      event.preventDefault();
    }
    return;
  }

  if (event.key !== "Delete" && event.key !== "Backspace") {
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
      await PdMessageBox.confirm("未保存的修改将丢失，是否继续新建？", "新建模板", { type: "warning" });
    } catch {
      return;
    }
  }

  try {
    loadTemplateDocument(instantiateStarterTemplate(starterId), { markAsDirty: true });
  } catch (error) {
    PdMessage.error(error?.message || "无法创建起始模板");
    return;
  }
  historyStore.reset();
  starterCatalogVisible.value = false;
  PdMessage.success("已创建新的可编辑模板");
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
    PdMessage[removed ? "success" : "warning"](removed ? "Saved template deleted from this browser" : "Saved template no longer exists");
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
    PdMessage.success("Saved templates cleared from this browser");
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
      PdMessage.error(imported.issues?.[0]?.message || "模板导入失败");
      return;
    }
    if (documentStore.dirty) {
      try {
        await PdMessageBox.confirm("未保存的修改将丢失，是否继续导入？", "导入模板", { type: "warning" });
      } catch {
        return;
      }
    }
    loadTemplateDocument(imported.document, { markAsDirty: true });
    historyStore.reset();
    PdMessage.success(imported.issues.length ? "模板已导入，已应用兼容迁移" : "模板已导入");
  }, { once: true });
  input.click();
}

function onExportTemplate() {
  const result = currentTemplateResult();
  if (!result.valid) {
    PdMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  const exported = downloadTemplateInterchange(result.document, `${result.document.meta.name || "print-template"}.json`);
  if (!exported.valid) {
    PdMessage.error(exported.issues[0]?.message || "模板导出失败");
    return;
  }
  PdMessage.success("模板 JSON 已导出");
}

async function refreshPresetLibrary() {
  try {
    savedPresets.value = await presetRepository.list();
  } catch (error) {
    PdMessage.error(error?.message || "无法读取元素预设");
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
      PdMessage.error("元素预设不存在或已删除");
      return;
    }
    const pageId = documentStore.currentPage?.id || "page-1";
    const nextObject = instantiateElementPreset(preset, { pageId, x: 10, y: 10, zIndex: documentStore.layers.length });
    documentStore.addObject(nextObject);
    selectionStore.select(nextObject.id);
    presetLibraryVisible.value = false;
    PdMessage.success("已插入元素预设");
  } catch (error) {
    PdMessage.error(error?.message || "插入元素预设失败");
  }
}

async function onRenamePreset(preset) {
  try {
    const { value } = await PdMessageBox.prompt("输入新的预设名称", "重命名元素预设", { inputValue: preset.name, inputPattern: /\S/, inputErrorMessage: "请输入名称" });
    await presetRepository.rename(preset.id, value);
    await refreshPresetLibrary();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      PdMessage.error(error?.message || "重命名元素预设失败");
    }
  }
}

async function onRemovePreset(preset) {
  try {
    await PdMessageBox.confirm(`删除预设“${preset.name}”后不可恢复，是否继续？`, "删除元素预设", { type: "warning" });
    await presetRepository.delete(preset.id);
    await refreshPresetLibrary();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      PdMessage.error(error?.message || "删除元素预设失败");
    }
  }
}

async function openTemplate(id) {
  try {
    const document = await repository.get(id);
    if (!document) {
      PdMessage.error("模板不存在或已被删除");
      return;
    }
    if (documentStore.dirty) {
      try {
        await PdMessageBox.confirm("未保存的修改将丢失，是否继续打开？", "打开模板", { type: "warning" });
      } catch {
        return;
      }
    }
    const result = loadTemplateDocument(document);
    if (!result.document) {
      PdMessage.error(result.issues?.[0]?.message || "模板无法加载");
      return;
    }
    historyStore.reset();
    templateLibraryVisible.value = false;
    PdMessage.success("模板已打开");
  } catch (error) {
    PdMessage.error(error.message || "打开模板失败");
  }
}

async function onSaveTemplate() {
  const result = currentTemplateResult();
  if (!result.valid) {
    PdMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }

  try {
    const saved = await repository.save(result.document);
    loadTemplateDocument(saved);
    await refreshTemplateLibrary();
    PdMessage.success("模板已保存到本地仓储");
  } catch (error) {
    reportError("repository.save", error, "保存模板失败");
  }
}

function onPreview() {
  const result = currentTemplateResult();
  if (!result.valid) {
    PdMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  previewDocument.value = result.document;
  previewVisible.value = true;
}

function onBeforeUnload(event) {
  if (!documentStore.dirty) {
    return;
  }
  event.preventDefault();
  event.returnValue = "";
}

function onFocusIssue(issue) {
  const elementId = issue?.elementId;
  const element = elementId ? documentStore.objectsById[elementId] : null;
  if (!element) {
    return;
  }
  documentStore.setCurrentPage(element.pageId);
  const group = documentStore.pages.find((page) => page.id === element.pageId)?.groups?.find((candidate) => candidate.elementIds?.includes(elementId));
  if (group) {
    selectionStore.selectGroup(group);
  } else {
    selectionStore.select(elementId);
  }
  selectionStore.focusedPageId = element.pageId;
  shellStore.openRightDock("properties");
}

async function onPrint() {
  const result = currentTemplateResult();
  if (!result.valid) {
    PdMessage.error(result.issues[0]?.message || "模板校验失败");
    return;
  }
  const preflight = validatePrintRuntime(result.document, previewRuntimeData.value, activePrintPolicy.value);
  if (!preflight.valid) {
    const issue = preflight.issues.find((item) => item.severity === "error") || preflight.issues[0];
    const error = new Error(issue?.message || "打印预检失败");
    error.issues = preflight.issues;
    onPrintError(error);
    return;
  }
  try {
    const { printRuntimeDocument } = await import("../runtime/print.js");
    await printRuntimeDocument({ document: preflight.document, runtimeData: previewRuntimeData.value });
  } catch (error) {
    onPrintError(error);
  }
}

function onPrintError(error) {
  reportError("print", error, "打印输出失败");
}

function onExportPdf() {
  PdMessage.info("PDF 导出不在当前首发范围内。");
}

function setRuntimeData(data, { persist = true, emitChange = true } = {}) {
  runtimeDataRevision += 1;
  previewStore.setRuntimeData(data);
  documentStore.setVariables(collectRuntimeBindingPaths(previewStore.runtimeData));
  if (persist) {
    scheduleRuntimeDataDraftSave(previewStore.runtimeData);
  }
  if (emitChange) {
    emit("update:runtimeData", previewStore.runtimeData);
  }
}

function setHostRuntimeData(data) {
  hasHostRuntimeData.value = data !== undefined && data !== null;
  hostRuntimeData.value = data;
  if (hasHostRuntimeData.value) {
    setRuntimeData(data, { persist: false, emitChange: false });
  }
}

function setPrintPolicy(policy) {
  activePrintPolicy.value = policy && typeof policy === "object" ? { ...policy } : {};
}

function bindingPatch(element, path) {
  if (["text", "image", "barcode", "qrcode"].includes(element?.type)) {
    return { variable: path };
  }
  if (["table", "multiLabel"].includes(element?.type)) {
    return { props: { ...(element.props || {}), dataVariable: path } };
  }
  return null;
}

function onBindPath(path) {
  const [selectedId] = selectedIds.value;
  if (selectedIds.value.length !== 1 || !selectedId) {
    PdMessage.warning("请先选择一个可绑定的元素。");
    return;
  }

  const element = documentStore.objectsById[selectedId];
  const resolved = resolveDataPath(previewRuntimeData.value, path);
  if (!resolved.found) {
    PdMessage.warning("字段已不存在，请检查测试数据。");
    return;
  }
  const requiresArray = ["table", "multiLabel"].includes(element?.type);
  const requiresScalar = ["text", "image", "barcode", "qrcode"].includes(element?.type);
  if (requiresArray && !Array.isArray(resolved.value)) {
    PdMessage.warning("表格和标签仅可绑定数组路径。");
    return;
  }
  if (requiresScalar && resolved.value !== null && typeof resolved.value === "object") {
    PdMessage.warning("文本、图片和码元素仅可绑定标量路径。");
    return;
  }
  const patch = bindingPatch(element, path);
  if (!patch) {
    PdMessage.warning("当前元素不支持运行数据绑定。");
    return;
  }

  executeEditorCommand(historyStore, createUpdateObjectPropsCommand(documentStore, selectedId, patch));
  shellStore.openRightDock("properties");
  PdMessage.success(`已绑定字段：${path}`);
}

function loadTemplateDocument(document, options = {}) {
  const result = documentStore.loadTemplateDocument(document, options);
  if (result.document) {
    runtimeDataRevision += 1;
    historyStore.reset();
    selectionStore.clearSelection();
    emitMigration(result);
    void restoreRuntimeDataForTemplate();
  }
  return result;
}

async function replaceTemplateDocument(document, options = {}) {
  if (documentStore.dirty && !options.force) {
    try {
      await PdMessageBox.confirm("未保存的修改将丢失，是否继续替换？", "替换模板", { type: "warning" });
    } catch {
      return null;
    }
  }
  return loadTemplateDocument(document, options);
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
  window.addEventListener("beforeunload", onBeforeUnload);
  void restoreRuntimeDataForTemplate();
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", onWindowWheel);
  window.removeEventListener("keydown", onWindowKeyDown);
  window.removeEventListener("beforeunload", onBeforeUnload);
  window.clearTimeout(runtimeDraftTimer);
});

defineExpose({ setRuntimeData, setHostRuntimeData, setPrintPolicy, getTemplateDocument, getPublishReadyTemplatePayload, loadTemplateDocument, replaceTemplateDocument, print: onPrint });
</script>

<style scoped lang="scss">
.editor-root {
  --pd-shell-bg: #f1f4f8;
  --pd-surface-bg: #ffffff;
  --pd-panel-bg: #ffffff;
  --pd-toolbar-bg: #ffffff;
  --pd-statusbar-bg: #ffffff;
  --pd-border: #d7dee8;
  --pd-divider: #dce3ec;
  --pd-muted: #66758a;
  --pd-text: #1f2328;
  --pd-strong: #1f2328;
  --pd-soft: #f8fafc;
  --pd-accent-bg: #edf4ff;
  --pd-accent-border: #c3d6f7;
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
