<script setup>
import { computed, onBeforeUnmount, watch } from "vue";
import PdButton from "./PdButton.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "min(640px, 92vw)" },
  closeOnClickModal: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "close"]);
const panelStyle = computed(() => ({ width: props.width }));

function closeDialog() {
  emit("update:modelValue", false);
  emit("close");
}

function onBackdropClick() {
  if (props.closeOnClickModal) {
    closeDialog();
  }
}

function onKeyDown(event) {
  if (event.key === "Escape" && props.modelValue) {
    closeDialog();
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    if (typeof window === "undefined") {
      return;
    }
    if (visible) {
      window.addEventListener("keydown", onKeyDown);
      return;
    }
    window.removeEventListener("keydown", onKeyDown);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onKeyDown);
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="pd-dialog" role="dialog" aria-modal="true" @click.self="onBackdropClick">
      <section class="pd-dialog__panel" :style="panelStyle">
        <header class="pd-dialog__header">
          <h2 class="pd-dialog__title">{{ title }}</h2>
          <PdButton text size="small" aria-label="关闭" @click="closeDialog">x</PdButton>
        </header>
        <div class="pd-dialog__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="pd-dialog__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
