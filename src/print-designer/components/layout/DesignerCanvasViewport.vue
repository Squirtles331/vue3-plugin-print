<template>
  <div class="designer-canvas-viewport">
    <div class="designer-canvas-viewport__paper-shadow"></div>
    <div ref="paperShellRef" class="designer-canvas-viewport__page-stack-shell" :style="paperShellStyle">
      <div class="designer-canvas-viewport__page-stack" :style="pageStackStyle">
        <PaperCanvas class="designer-canvas-viewport__page-view" :pixels-per-unit="pagePixelsPerUnit" :zoom="zoom" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { computed, ref } from "vue";
import PaperCanvas from "./PaperCanvas.vue";
const props = defineProps({
    zoom: {
        type: Number,
        default: 1,
    },
    scaledPaperWidth: {
        type: Number,
        default: 0,
    },
    scaledPaperHeight: {
        type: Number,
        default: 0,
    },
    pageWidthPx: {
        type: Number,
        default: 0,
    },
    pageHeightPx: {
        type: Number,
        default: 0,
    },
    pagePixelsPerUnit: {
        type: Number,
        default: 1,
    },
});
const paperShellRef = ref(null);
const paperShellStyle = computed(() => ({
    width: `${props.scaledPaperWidth}px`,
    minHeight: `${props.scaledPaperHeight}px`,
}));
const pageStackStyle = computed(() => ({
    width: `${props.pageWidthPx}px`,
    minHeight: `${props.pageHeightPx}px`,
    transform: `scale(${props.zoom})`,
    transformOrigin: "top left",
}));
function getPageStackShellElement() {
    return paperShellRef.value;
}
defineExpose({
    getPageStackShellElement,
});
</script>

<style scoped lang="scss">
.designer-canvas-viewport {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 18px 72px 28px 32px;
}

.designer-canvas-viewport__paper-shadow {
  position: absolute;
  inset: 38px 18% 10px;
  border-radius: 32px;
  background: radial-gradient(circle at center, rgba(72, 84, 102, 0.18), transparent 70%);
  filter: blur(30px);
}

.designer-canvas-viewport__page-stack-shell {
  position: relative;
  flex: 0 0 auto;
}

.designer-canvas-viewport__page-stack {
  position: relative;
  z-index: 1;
}

.designer-canvas-viewport__page-view {
  transform-origin: top left;
}

@media (max-width: 1280px) {
  .designer-canvas-viewport {
    padding-right: 44px;
    padding-left: 12px;
  }
}
</style>
