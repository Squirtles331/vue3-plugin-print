<script setup>
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "default" },
  nativeType: { type: String, default: "button" },
  size: { type: String, default: "default" },
  plain: { type: Boolean, default: false },
  text: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const buttonClass = computed(() => [
  "pd-button",
  `pd-button--${props.type}`,
  `pd-button--${props.size}`,
  {
    "pd-button--plain": props.plain,
    "pd-button--text": props.text,
    "pd-button--loading": props.loading,
  },
]);
</script>

<template>
  <button :type="nativeType" :class="buttonClass" :disabled="disabled || loading">
    <span v-if="loading" class="pd-button__spinner" aria-hidden="true"></span>
    <span v-if="$slots.icon" class="pd-button__icon">
      <slot name="icon" />
    </span>
    <span class="pd-button__content">
      <slot />
    </span>
  </button>
</template>
