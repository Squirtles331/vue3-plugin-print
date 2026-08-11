<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);
const switchClass = computed(() => ["pd-switch", { "pd-switch--checked": props.modelValue }]);

function toggleValue() {
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
