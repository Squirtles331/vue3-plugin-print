<script setup lang="ts">
import { ICON_PATHS } from '../iconPaths.js'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: [Number, String], default: 16 },
  title: { type: String, default: '' },
})
const paths = computed(() => ICON_PATHS[props.name] || ICON_PATHS.Document)
const sizeValue = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span v-if="$slots.default" class="pd-icon">
    <slot />
  </span>
  <svg
    v-else
    class="pd-icon"
    :style="{ width: sizeValue, height: sizeValue }"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <title v-if="title">{{ title }}</title>
    <path v-for="path in paths" :key="path" :d="path" />
  </svg>
</template>
