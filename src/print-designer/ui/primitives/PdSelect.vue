<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change'])
const selectClass = computed(() => ['pd-select', `pd-select--${props.size}`])
function updateValue(event) {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <select :class="selectClass" :value="modelValue" :disabled="disabled" @change="updateValue">
    <option v-if="placeholder" value="" disabled>
      {{ placeholder }}
    </option>
    <slot />
  </select>
</template>
