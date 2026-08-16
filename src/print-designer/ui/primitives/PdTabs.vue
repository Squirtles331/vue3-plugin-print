<script setup lang="ts">import { computed, provide, shallowRef } from "vue";
const props = defineProps({
    modelValue: { type: String, default: "" },
    stretch: { type: Boolean, default: false },
}) as any;
const emit = defineEmits(["update:modelValue", "change"]) as any;
const tabs = shallowRef([]) as any;
const tabsClass = computed((): any => ["pd-tabs", { "pd-tabs--stretch": props.stretch }]) as any;
function setActive(name: any): any {
    emit("update:modelValue", name);
    emit("change", name);
}
function registerTab(tab: any): any {
    if (tabs.value.some((item: any): any => item.name === tab.name)) {
        return;
    }
    tabs.value = [...tabs.value, tab];
}
provide("pdTabs", { activeName: computed((): any => props.modelValue), registerTab });
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
