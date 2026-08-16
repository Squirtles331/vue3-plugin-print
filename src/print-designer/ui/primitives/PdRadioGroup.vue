<script setup lang="ts">import { provide } from "vue";
const props = defineProps({
    modelValue: { type: [String, Number, Boolean], default: "" },
}) as any;
const emit = defineEmits(["update:modelValue", "change"]) as any;
function setValue(value: any): any {
    emit("update:modelValue", value);
    emit("change", value);
}
provide("pdRadioGroup", { props, setValue });
</script>

<template>
  <div class="pd-radio-group" role="radiogroup">
    <slot />
  </div>
</template>
