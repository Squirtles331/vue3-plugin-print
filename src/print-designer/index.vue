<template>
  <div class="print-designer-page">
    <EditorRoot />
  </div>
</template>

<script setup>
import EditorRoot from "./editor/EditorRoot.vue";
</script>

<style scoped lang="scss">
.print-designer-page {
  width: 100vw;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}
</style>
