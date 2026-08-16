<script setup lang="ts">import { computed } from "vue";
import { ICON_PATHS } from "../iconPaths.js";
const props = defineProps({
    name: { type: String, default: "" },
    size: { type: [Number, String], default: 16 },
    title: { type: String, default: "" },
}) as any;
const paths = computed((): any => ICON_PATHS[props.name] || ICON_PATHS.Document) as any;
const sizeValue = computed((): any => (typeof props.size === "number" ? `${props.size}px` : props.size)) as any;
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
