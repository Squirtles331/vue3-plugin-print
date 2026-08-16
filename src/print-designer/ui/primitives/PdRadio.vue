<script setup lang="ts">import { computed, inject } from "vue";
const props = defineProps({
    modelValue: { type: [String, Number, Boolean], default: undefined },
    value: { type: [String, Number, Boolean], required: true },
    disabled: { type: Boolean, default: false },
}) as any;
const emit = defineEmits(["update:modelValue", "change"]) as any;
const group = inject("pdRadioGroup", null) as any;
const currentValue = computed((): any => (group ? group.props.modelValue : props.modelValue)) as any;
const checked = computed((): any => currentValue.value === props.value) as any;
function selectValue(): any {
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
