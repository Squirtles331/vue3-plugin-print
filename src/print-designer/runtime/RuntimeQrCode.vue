<template>
  <div class="runtime-qrcode" :class="{ 'is-empty': !hasValue, 'has-error': error }">
    <img v-if="dataUrl" :src="dataUrl" alt="" />
    <span v-else>{{ error || placeholder }}</span>
  </div>
</template>

<script setup>
import QRCode from "qrcode";
import { computed, ref, watch } from "vue";

const props = defineProps({
  value: { type: String, default: "" },
  status: { type: String, default: "empty" },
  eccLevel: { type: String, default: "M" },
});

const dataUrl = ref("");
const error = ref("");
const hasValue = computed(() => !!props.value && !["empty", "missing"].includes(props.status));
const placeholder = computed(() => (props.status === "missing" ? props.value : "Unbound QR code"));

async function render() {
  dataUrl.value = "";
  error.value = "";
  if (!hasValue.value) {
    return;
  }

  try {
    dataUrl.value = await QRCode.toDataURL(props.value, { errorCorrectionLevel: props.eccLevel, margin: 0, width: 320 });
  } catch {
    error.value = "Invalid QR code value";
  }
}

watch(() => [props.value, props.status, props.eccLevel], render, { immediate: true });
</script>

<style scoped>
.runtime-qrcode { display: grid; width: 100%; height: 100%; place-items: center; overflow: hidden; }
.runtime-qrcode img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
.runtime-qrcode.is-empty, .runtime-qrcode.has-error { border: 1px dashed currentColor; color: #64748b; font-size: 10px; text-align: center; }
.runtime-qrcode.has-error { color: #b91c1c; }
</style>
