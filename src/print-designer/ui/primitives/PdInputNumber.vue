<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  precision: { type: Number, default: undefined },
  controlsPosition: { type: String, default: '' },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])
const inputClass = computed(() => ['pd-input-number', `pd-input-number--${props.size}`])
function normalizeValue(value) {
  let next = Number(value)
  if (!Number.isFinite(next)) {
    next = 0
  }
  if (typeof props.min === 'number') {
    next = Math.max(props.min, next)
  }
  if (typeof props.max === 'number') {
    next = Math.min(props.max, next)
  }
  if (typeof props.precision === 'number') {
    next = Number(next.toFixed(props.precision))
  }
  return next
}
function updateValue(event) {
  const next = normalizeValue(event.target.value)
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <input
    :class="inputClass"
    type="number"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @input="updateValue"
    @change="updateValue"
  >
</template>
