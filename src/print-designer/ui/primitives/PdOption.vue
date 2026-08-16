<script setup lang="ts">
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number, Boolean], required: true },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <option :value="value" :disabled="disabled">
    <slot>{{ label }}</slot>
  </option>
</template>
