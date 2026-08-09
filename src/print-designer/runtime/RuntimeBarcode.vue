<template>
  <div class="runtime-barcode" :class="{ 'is-empty': !hasValue, 'has-error': error }">
    <svg v-if="hasValue && !error" ref="svgRef" class="runtime-barcode__svg"></svg>
    <span v-else>{{ error || placeholder }}</span>
    <small v-if="showValue && hasValue">{{ value }}</small>
  </div>
</template>

<script setup>
import JsBarcode from "jsbarcode";
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  value: { type: String, default: "" },
  status: { type: String, default: "empty" },
  format: { type: String, default: "CODE128" },
  showValue: { type: Boolean, default: true },
});

const svgRef = ref(null);
const error = ref("");
const hasValue = computed(() => !!props.value && !["empty", "missing"].includes(props.status));
const placeholder = computed(() => (props.status === "missing" ? props.value : "Unbound barcode"));

async function render() {
  error.value = "";
  if (!hasValue.value) {
    return;
  }

  await nextTick();
  try {
    JsBarcode(svgRef.value, props.value, {
      format: props.format,
      displayValue: false,
      margin: 0,
      width: 1.4,
      height: 42,
    });
  } catch {
    error.value = "Invalid barcode value";
  }
}

watch(() => [props.value, props.status, props.format], render, { immediate: true });
</script>

<style scoped>
.runtime-barcode { display: flex; width: 100%; height: 100%; min-width: 0; flex-direction: column; align-items: center; justify-content: center; gap: 2px; overflow: hidden; }
.runtime-barcode__svg { width: 100%; min-height: 0; flex: 1; }
.runtime-barcode small { max-width: 100%; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.runtime-barcode.is-empty, .runtime-barcode.has-error { border: 1px dashed currentColor; color: #64748b; font-size: 10px; }
.runtime-barcode.has-error { color: #b91c1c; }
</style>
