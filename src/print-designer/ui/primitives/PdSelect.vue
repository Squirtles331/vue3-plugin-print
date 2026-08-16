<script setup lang="ts">import { computed } from "vue";
const props = defineProps({
    modelValue: { type: [String, Number, Boolean], default: "" },
    size: { type: String, default: "default" },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
}) as any;
const emit = defineEmits(["update:modelValue", "change"]) as any;
const selectClass = computed((): any => ["pd-select", `pd-select--${props.size}`]) as any;
function updateValue(event: any): any {
    const value = event.target.value;
    emit("update:modelValue", value);
    emit("change", value);
}
</script>

<template>
  <select :class="selectClass" :value="modelValue" :disabled="disabled" @change="updateValue">
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <slot />
  </select>
</template>
