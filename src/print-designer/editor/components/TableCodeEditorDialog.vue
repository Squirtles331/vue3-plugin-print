<template>
  <PdDialog
    class="table-code-editor-dialog"
    :model-value="visible"
    :close-on-click-modal="false"
    width="min(1280px, calc(100vw - 48px))"
    @update:model-value="onDialogVisibleChange"
  >
    <template #header>
      <div class="table-code-editor-dialog__header">
        <div class="table-code-editor-dialog__title">
          <strong>{{ title }}</strong>
          <span>{{ languageLabel }}</span>
        </div>
        <button type="button" class="table-code-editor-dialog__mode">读写</button>
      </div>
    </template>

    <div class="table-code-editor-dialog__body">
      <div ref="editorHost" class="table-code-editor-dialog__editor"></div>
    </div>

    <template #footer>
      <div class="table-code-editor-dialog__footer">
        <PdButton @click="emit('cancel')">取消</PdButton>
        <PdButton type="primary" @click="emit('save')">保存</PdButton>
      </div>
    </template>
  </PdDialog>
</template>

<script setup lang="ts">import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdDialog from "../../ui/primitives/PdDialog.vue";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    modelValue: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
    language: {
        type: String,
        default: "json",
    },
});
const emit = defineEmits(["update:modelValue", "update:visible", "save", "cancel"]);
const editorHost = ref(null);
const languageLabel = computed(() => (props.language === "javascript" ? "JAVASCRIPT" : "JSON"));
let editorView = null;
function languageExtension() {
    return props.language === "javascript" ? javascript() : json();
}
function buildEditorState(doc = "") {
    return EditorState.create({
        doc,
        extensions: [
            basicSetup,
            EditorView.lineWrapping,
            oneDark,
            languageExtension(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    emit("update:modelValue", update.state.doc.toString());
                }
            }),
        ],
    });
}
async function ensureEditor() {
    if (!props.visible) {
        return;
    }
    await nextTick();
    if (!editorHost.value) {
        return;
    }
    if (!editorView) {
        editorView = new EditorView({
            state: buildEditorState(props.modelValue),
            parent: editorHost.value,
        });
        return;
    }
    syncEditorContent(props.modelValue);
}
function syncEditorContent(value) {
    if (!editorView) {
        return;
    }
    const current = editorView.state.doc.toString();
    if (current === value) {
        return;
    }
    editorView.dispatch({
        changes: {
            from: 0,
            to: current.length,
            insert: value,
        },
    });
}
function recreateEditor() {
    if (editorView) {
        editorView.destroy();
        editorView = null;
    }
    if (props.visible) {
        ensureEditor();
    }
}
function onDialogVisibleChange(value) {
    if (!value) {
        emit("cancel");
        return;
    }
    emit("update:visible", true);
}
watch(() => props.visible, (visible) => {
    if (!visible) {
        if (editorView) {
            editorView.destroy();
            editorView = null;
        }
        return;
    }
    ensureEditor();
}, { immediate: true });
watch(() => props.modelValue, (value) => {
    syncEditorContent(value);
});
watch(() => props.language, () => {
    recreateEditor();
});
onBeforeUnmount(() => {
    if (editorView) {
        editorView.destroy();
        editorView = null;
    }
});
</script>

<style scoped lang="scss">
.table-code-editor-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-code-editor-dialog__title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.table-code-editor-dialog__title strong {
  color: #1f2937;
  font-size: 16px;
}

.table-code-editor-dialog__title span {
  padding: 3px 8px;
  border-radius: 999px;
  background: #e5eefc;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.table-code-editor-dialog__mode {
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font-size: 12px;
  cursor: default;
}

.table-code-editor-dialog__body {
  min-height: 68vh;
}

.table-code-editor-dialog__editor {
  min-height: 68vh;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}

.table-code-editor-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.table-code-editor-dialog .cm-editor) {
  height: 68vh;
  font-size: 14px;
}

:deep(.table-code-editor-dialog .cm-scroller) {
  font-family: "Cascadia Code", "Consolas", "SFMono-Regular", monospace;
}
</style>
