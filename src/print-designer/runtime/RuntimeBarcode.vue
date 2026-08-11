<template>
  <div class="runtime-barcode" :class="{ 'is-empty': !hasValue, 'has-error': error }" :data-runtime-status="runtimeStatus">
    <svg v-if="hasValue && !error" ref="svgRef" class="runtime-barcode__svg"></svg>
    <span v-else-if="mode !== 'print'">{{ error || placeholder }}</span>
    <small v-if="showValue && hasValue" :style="{ marginTop: `${Math.max(0, Math.min(40, Number(textMargin) || 0))}px`, fontSize: `${Math.max(6, Math.min(72, Number(textFontSize) || 10))}px` }">{{ value }}</small>
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
  foreground: { type: String, default: "#111827" },
  background: { type: String, default: "#ffffff" },
  margin: { type: Number, default: 0 },
  textMargin: { type: Number, default: 2 },
  textFontSize: { type: Number, default: 10 },
  mode: { type: String, default: "preview" },
});

const svgRef = ref(null);
const error = ref("");
const runtimeStatus = ref("empty");
const hasValue = computed(() => !!props.value && !["empty", "missing"].includes(props.status));
const placeholder = computed(() => (props.status === "missing" ? props.value : "Unbound barcode"));
function machineColor(value, fallback) { return typeof value === "string" && /^#[\da-f]{3,8}$/i.test(value) ? value : fallback; }

async function render() {
  error.value = "";
  if (!hasValue.value) {
    runtimeStatus.value = "empty";
    return;
  }

  runtimeStatus.value = "pending";
  await nextTick();
  try {
    JsBarcode(svgRef.value, props.value, {
      format: props.format,
      displayValue: false,
      margin: Math.max(0, Math.min(40, Number(props.margin) || 0)),
      width: 1.4,
      height: 42,
      lineColor: machineColor(props.foreground, "#111827"),
      background: machineColor(props.background, "#ffffff"),
    });
    runtimeStatus.value = "ready";
  } catch {
    error.value = "Invalid barcode value";
    runtimeStatus.value = "error";
  }
}

watch(() => [props.value, props.status, props.format, props.foreground, props.background, props.margin, props.textMargin, props.textFontSize], render, { immediate: true });
</script>

<style scoped>
.runtime-barcode { display: flex; width: 100%; height: 100%; min-width: 0; flex-direction: column; align-items: center; justify-content: center; gap: 2px; overflow: hidden; }
.runtime-barcode__svg { width: 100%; min-height: 0; flex: 1; }
.runtime-barcode small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.runtime-barcode.is-empty, .runtime-barcode.has-error { border: 1px dashed currentColor; color: #64748b; font-size: 10px; }
.runtime-barcode.has-error { color: #b91c1c; }
</style>
