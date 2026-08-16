<template>
  <div class="runtime-qrcode" :class="{ 'is-empty': !hasValue, 'has-error': error }" v-bind="{ 'data-runtime-status': runtimeStatus } as any">
    <img v-if="dataUrl" :src="dataUrl" alt="" />
    <span v-else-if="mode !== 'print'">{{ error || placeholder }}</span>
  </div>
</template>

<script setup lang="ts">import QRCode from "qrcode";
import { computed, ref, watch } from "vue";
const props = defineProps({
    value: { type: String, default: "" },
    status: { type: String, default: "empty" },
    eccLevel: { type: String, default: "M" },
    foreground: { type: String, default: "#111827" },
    background: { type: String, default: "#ffffff" },
    margin: { type: Number, default: 0 },
    mode: { type: String, default: "preview" },
}) as any;
const dataUrl = ref("") as any;
const error = ref("") as any;
const runtimeStatus = ref("empty") as any;
const hasValue = computed((): any => !!props.value && !["empty", "missing"].includes(props.status)) as any;
const placeholder = computed((): any => (props.status === "missing" ? props.value : "Unbound QR code")) as any;
function machineColor(value: any, fallback: any): any { return typeof value === "string" && /^#[\da-f]{3,8}$/i.test(value) ? value : fallback; }
async function render(): Promise<any> {
    dataUrl.value = "";
    error.value = "";
    if (!hasValue.value) {
        runtimeStatus.value = "empty";
        return;
    }
    runtimeStatus.value = "pending";
    try {
        dataUrl.value = await QRCode.toDataURL(props.value, { errorCorrectionLevel: props.eccLevel, margin: Math.max(0, Math.min(40, Number(props.margin) || 0)), width: 320, color: { dark: machineColor(props.foreground, "#111827"), light: machineColor(props.background, "#ffffff") } });
        runtimeStatus.value = "ready";
    }
    catch {
        error.value = "Invalid QR code value";
        runtimeStatus.value = "error";
    }
}
watch((): any => [props.value, props.status, props.eccLevel, props.foreground, props.background, props.margin], render, { immediate: true });
</script>

<style scoped>
.runtime-qrcode { display: grid; width: 100%; height: 100%; place-items: center; overflow: hidden; }
.runtime-qrcode img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
.runtime-qrcode.is-empty, .runtime-qrcode.has-error { border: 1px dashed currentColor; color: #64748b; font-size: 10px; text-align: center; }
.runtime-qrcode.has-error { color: #b91c1c; }
</style>
