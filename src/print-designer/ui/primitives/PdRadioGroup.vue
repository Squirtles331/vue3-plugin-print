<script setup>
import { provide } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

function setValue(value) {
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
