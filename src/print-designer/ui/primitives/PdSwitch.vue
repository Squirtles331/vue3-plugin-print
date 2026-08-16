<script setup lang="ts">import { computed } from "vue";
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    activeText: { type: String, default: "" },
    inactiveText: { type: String, default: "" },
}) as any;
const emit = defineEmits(["update:modelValue", "change"]) as any;
const switchClass = computed((): any => ["pd-switch", { "pd-switch--checked": props.modelValue }]) as any;
function toggleValue(): any {
    if (props.disabled) {
        return;
    }
    const next = !props.modelValue;
    emit("update:modelValue", next);
    emit("change", next);
}
</script>

<template>
  <button type="button" role="switch" :aria-checked="modelValue" :class="switchClass" :disabled="disabled" @click="toggleValue">
    <span class="pd-switch__thumb"></span>
  </button>
</template>
