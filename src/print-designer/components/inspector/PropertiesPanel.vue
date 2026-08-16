<script setup lang="ts">
import InspectorEmpty from './InspectorEmpty.vue'

defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="properties-panel">
    <div class="properties-panel__switcher">
      <button class="is-active" type="button">
        Basic
      </button>
      <button type="button">
        Style
      </button>
      <button type="button">
        Data
      </button>
    </div>

    <InspectorEmpty />

    <div class="properties-panel__stack">
      <div class="properties-panel__card">
        <span>Transform</span>
        <small>Position, size, rotation, and align controls will plug in here.</small>
      </div>
      <div class="properties-panel__card">
        <span>Appearance</span>
        <small>Typography, stroke, fill, opacity, and effect controls belong here.</small>
      </div>
      <div class="properties-panel__card">
        <span>Bindings</span>
        <div class="properties-panel__chips">
          <div v-for="variable in variables" :key="variable" class="properties-panel__chip">
            {{ variable }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.properties-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
}

.properties-panel__switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.properties-panel__switcher button {
  height: 30px;
  border: 1px solid rgba(141, 163, 196, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--pd-muted);
  font-size: 12px;
  font-weight: 600;
}

.properties-panel__switcher button.is-active {
  border-color: rgba(79, 140, 255, 0.36);
  background: rgba(79, 140, 255, 0.1);
  color: #dce8ff;
}

.properties-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.properties-panel__card {
  padding: 16px 14px;
  border: 1px solid rgba(141, 163, 196, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.properties-panel__card span {
  display: block;
  margin-bottom: 6px;
  color: var(--pd-strong);
  font-size: 14px;
  font-weight: 700;
}

.properties-panel__card small {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.7;
}

.properties-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.properties-panel__chip {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(79, 140, 255, 0.14);
  color: #d7e4fd;
  font-size: 12px;
  font-weight: 700;
}
</style>
