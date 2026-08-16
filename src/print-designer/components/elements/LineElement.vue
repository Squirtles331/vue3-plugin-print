<template>
  <div class="pd-line-element" :style="lineStyle"></div>
</template>

<script setup lang="ts">import { computed } from "vue";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const lineStyle = computed((): any => ({
    borderTopWidth: `${props.object.style?.borderWidth ?? 1}px`,
    borderTopStyle: props.object.style?.borderStyle || "solid",
    borderTopColor: props.object.style?.borderColor || "#172033",
    opacity: Number.isFinite(Number(props.object.style?.opacity)) ? Number(props.object.style.opacity) : 1,
})) as any;
</script>

<style scoped lang="scss">
.pd-line-element {
  width: 100%;
  margin: auto 0;
  box-sizing: border-box;
}
</style>
