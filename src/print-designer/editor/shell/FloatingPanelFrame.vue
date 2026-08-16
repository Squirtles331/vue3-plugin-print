<template>
  <section
    class="floating-panel-frame"
    :style="panelStyle"
    @pointerdown="emit('focus', panelId)"
  >
    <header
      class="floating-panel-frame__header"
      @pointerdown="onHeaderPointerDown"
    >
      <div class="floating-panel-frame__title-group">
        <span v-if="eyebrow" class="floating-panel-frame__eyebrow">{{ eyebrow }}</span>
        <h2 class="floating-panel-frame__title">{{ title }}</h2>
      </div>

      <button
        class="floating-panel-frame__close"
        type="button"
        @pointerdown.stop
        @click.stop="emit('close', panelId)"
      >
        收起
      </button>
    </header>

    <div class="floating-panel-frame__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">import { computed } from "vue";
const props = defineProps({
    panelId: {
        type: String,
        required: true,
    },
    eyebrow: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        required: true,
    },
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    width: {
        type: Number,
        default: 360,
    },
    height: {
        type: Number,
        default: 520,
    },
    zIndex: {
        type: Number,
        default: 1,
    },
}) as any;
const emit = defineEmits(["close", "focus", "drag-start"]) as any;
const panelStyle = computed((): any => ({
    width: `${props.width}px`,
    height: `${props.height}px`,
    transform: `translate3d(${props.x}px, ${props.y}px, 0)`,
    zIndex: props.zIndex,
})) as any;
function onHeaderPointerDown(event: any): any {
    emit("focus", props.panelId);
    emit("drag-start", {
        panelId: props.panelId,
        event,
    });
}
</script>

<style scoped lang="scss">
.floating-panel-frame {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
  box-shadow: var(--pd-shadow-panel);
  pointer-events: auto;
}

.floating-panel-frame__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pd-divider);
  background: var(--pd-soft);
  cursor: move;
  user-select: none;
}

.floating-panel-frame__header:active {
  cursor: move;
}

.floating-panel-frame__title-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.floating-panel-frame__eyebrow {
  color: var(--pd-muted);
  font-size: 11px;
  letter-spacing: 0;
}

.floating-panel-frame__title {
  margin: 0;
  color: var(--pd-text);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.floating-panel-frame__close {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-control);
  background: var(--pd-surface-bg);
  color: var(--pd-muted);
  font-size: 12px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.floating-panel-frame__close:hover {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.floating-panel-frame__body {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--pd-panel-bg);
}
</style>
