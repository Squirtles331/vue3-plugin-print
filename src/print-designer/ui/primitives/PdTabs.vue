<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, default: '' },
  stretch: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])
const tabs = shallowRef([])
const tabsClass = computed(() => ['pd-tabs', { 'pd-tabs--stretch': props.stretch }])
function setActive(name) {
  emit('update:modelValue', name)
  emit('change', name)
}
function registerTab(tab) {
  if (tabs.value.some(item => item.name === tab.name)) {
    return
  }
  tabs.value = [...tabs.value, tab]
}
provide('pdTabs', { activeName: computed(() => props.modelValue), registerTab })
</script>

<template>
  <div :class="tabsClass">
    <div class="pd-tabs__nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="pd-tabs__tab"
        :class="{ 'pd-tabs__tab--active': modelValue === tab.name }"
        role="tab"
        :aria-selected="modelValue === tab.name"
        @click="setActive(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="pd-tabs__content">
      <slot />
    </div>
  </div>
</template>
