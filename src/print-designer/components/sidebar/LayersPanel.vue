<template>
  <div class="layers-panel">
    <div class="layers-panel__stack">
      <div v-for="layer in layers" :key="layer.id" class="layers-panel__card">
        <span class="layers-panel__title">{{ layer.name }}</span>
        <span class="layers-panel__meta">{{ layer.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped lang="scss">
.layers-panel {
  flex: 1;
  min-height: 0;
  padding: 18px;
  overflow: auto;
  background: #ffffff;
}

.layers-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layers-panel__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
}

.layers-panel__card:hover {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
}

.layers-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.layers-panel__meta {
  font-size: 12px;
  color: var(--pd-muted);
}
</style>
