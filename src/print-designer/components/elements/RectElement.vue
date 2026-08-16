<template>
  <div class="pd-rect-element" :style="shapeStyle"></div>
</template>

<script setup lang="ts">import { computed } from "vue";
import { previewPanelStyle } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const shapeStyle = computed((): any => previewPanelStyle(props.object, "transparent")) as any;
</script>

<style scoped lang="scss">
.pd-rect-element {
  position: relative;
  overflow: hidden;
}
</style>
