<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: undefined },
  value: { type: [String, Number, Boolean], required: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);
const group = inject("pdRadioGroup", null);
const currentValue = computed(() => (group ? group.props.modelValue : props.modelValue));
const checked = computed(() => currentValue.value === props.value);

function selectValue() {
  if (props.disabled) {
    return;
  }
  if (group) {
    group.setValue(props.value);
    return;
  }
  emit("update:modelValue", props.value);
  emit("change", props.value);
}
</script>

<template>
  <label class="pd-radio" :class="{ 'pd-radio--checked': checked, 'pd-radio--disabled': disabled }">
    <input class="pd-radio__input" type="radio" :checked="checked" :disabled="disabled" @change="selectValue" />
    <span class="pd-radio__mark"></span>
    <span class="pd-radio__label">
      <slot />
    </span>
  </label>
</template>
