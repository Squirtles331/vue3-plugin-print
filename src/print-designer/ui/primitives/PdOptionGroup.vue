<script setup>
defineProps({
  label: { type: String, default: "" },
});
</script>

<template>
  <optgroup :label="label">
    <slot />
  </optgroup>
</template>
