<script setup lang="ts">import { computed, inject, onMounted } from "vue";
const props = defineProps({
    label: { type: String, default: "" },
    name: { type: String, required: true },
}) as any;
const tabs = inject("pdTabs", null) as any;
const isActive = computed((): any => tabs?.activeName?.value === props.name) as any;
onMounted((): any => {
    tabs?.registerTab({ label: props.label, name: props.name });
});
</script>

<template>
  <section v-show="isActive" class="pd-tab-pane" role="tabpanel">
    <slot />
  </section>
</template>
