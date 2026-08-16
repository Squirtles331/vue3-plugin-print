<script setup lang="ts">
const props = defineProps({
  'type': { type: String, default: 'default' },
  'nativeType': { type: String, default: 'button' },
  'size': { type: String, default: 'default' },
  'plain': { type: Boolean, default: false },
  'text': { type: Boolean, default: false },
  'loading': { type: Boolean, default: false },
  'disabled': { type: Boolean, default: false },
  'ariaLabel': { type: String, default: undefined },
  'aria-label': { type: String, default: undefined },
  'title': { type: String, default: '' },
})
const emit = defineEmits(['click'])
const buttonClass = computed(() => [
  'pd-button',
  `pd-button--${props.type}`,
  `pd-button--${props.size}`,
  {
    'pd-button--plain': props.plain,
    'pd-button--text': props.text,
    'pd-button--loading': props.loading,
  },
])
const nativeButtonType = computed(() => ['button', 'reset', 'submit'].includes(props.nativeType) ? props.nativeType : 'button')
</script>

<template>
  <button :type="nativeButtonType" :aria-label="ariaLabel || props['aria-label']" :title="title" :class="buttonClass" :disabled="disabled || loading" @click="emit('click', $event)">
    <span v-if="loading" class="pd-button__spinner" aria-hidden="true" />
    <span v-if="$slots.icon" class="pd-button__icon">
      <slot name="icon" />
    </span>
    <span class="pd-button__content">
      <slot />
    </span>
  </button>
</template>
