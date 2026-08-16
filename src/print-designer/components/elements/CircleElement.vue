<template>
  <div class="pd-circle-element" :style="shapeStyle"></div>
</template>

<script setup lang="ts">import { computed } from "vue";
import { previewPanelStyle } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
});
const shapeStyle = computed(() => ({
    ...previewPanelStyle(props.object, "transparent"),
    borderRadius: "50%",
}));
</script>

<style scoped lang="scss">
.pd-circle-element {
  overflow: hidden;
}
</style>
