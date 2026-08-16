<script setup lang="ts">
const props = defineProps({
  label: { type: String, default: '' },
  name: { type: String, required: true },
})
const tabs = inject('pdTabs', null)
const isActive = computed(() => tabs?.activeName?.value === props.name)
onMounted(() => {
  tabs?.registerTab({ label: props.label, name: props.name })
})
</script>

<template>
  <section v-show="isActive" class="pd-tab-pane" role="tabpanel">
    <slot />
  </section>
</template>
