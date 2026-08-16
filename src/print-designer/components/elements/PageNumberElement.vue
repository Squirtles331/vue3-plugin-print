<template>
  <div class="pd-page-number-element" :style="contentStyle">
    <span class="pd-page-number-element__value">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">import { computed } from "vue";
import { pageNumberValue, textStyle } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const value = computed((): any => pageNumberValue(props.object)) as any;
const contentStyle = computed((): any => textStyle(props.object)) as any;
</script>

<style scoped lang="scss">
.pd-page-number-element {
  min-width: 0;
  min-height: 0;
  color: #475569;
  font-variant-numeric: tabular-nums;
}

.pd-page-number-element__value {
  padding-bottom: 1px;
  border-bottom: 1px solid currentColor;
}
</style>
