<script setup lang="ts">
import { pageNumberValue, textStyle } from './elementPreview.js'

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
})
const value = computed(() => pageNumberValue(props.object))
const contentStyle = computed(() => textStyle(props.object))
</script>

<template>
  <div class="pd-page-number-element" :style="contentStyle">
    <span class="pd-page-number-element__value">{{ value }}</span>
  </div>
</template>

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
