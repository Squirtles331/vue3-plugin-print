<template>
  <div class="pd-text-element" :class="{ 'is-placeholder': !hasValue }" :style="contentStyle">
    <span v-if="binding" class="pd-text-element__binding">{{ binding }}</span>
    <span class="pd-text-element__value">{{ previewValue }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { bindingLabel, textPreviewValue, textStyle } from "./elementPreview.js";

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const binding = computed(() => bindingLabel(props.object));
const hasValue = computed(() => Boolean(props.object?.variable || String(props.object?.content || "").trim()));
const previewValue = computed(() => textPreviewValue(props.object));
const contentStyle = computed(() => textStyle(props.object));
</script>

<style scoped lang="scss">
.pd-text-element {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.pd-text-element.is-placeholder {
  color: #94a3b8 !important;
}

.pd-text-element__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pd-text-element__binding {
  position: absolute;
  top: 3px;
  right: 4px;
  z-index: 1;
  max-width: calc(100% - 8px);
  padding: 1px 5px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 999px;
  background: rgba(239, 246, 255, 0.94);
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.35;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
