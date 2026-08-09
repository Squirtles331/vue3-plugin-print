<template>
  <div class="print-designer-page">
    <EditorRoot ref="editorRootRef" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import EditorRoot from "./editor/EditorRoot.vue";

const editorRootRef = ref(null);

defineExpose({
  setRuntimeData(data) {
    editorRootRef.value?.setRuntimeData(data);
  },
  getTemplateDocument() {
    return editorRootRef.value?.getTemplateDocument();
  },
  getPublishReadyTemplatePayload() {
    return editorRootRef.value?.getPublishReadyTemplatePayload();
  },
  loadTemplateDocument(document) {
    return editorRootRef.value?.loadTemplateDocument(document);
  },
});
</script>

<style scoped lang="scss">
.print-designer-page {
  width: 100vw;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
</style>
