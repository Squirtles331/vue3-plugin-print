<template>
  <div class="structure-panel">
    <div class="structure-panel__summary">图层结构 · {{ layers.length }}</div>
    <div class="structure-panel__toolbar">
      <button type="button">折叠</button>
      <button type="button">锁定</button>
      <button type="button">隐藏</button>
    </div>
    <div class="structure-panel__stack">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="structure-panel__card"
        :class="{ 'is-active': selectedIds.includes(layer.id) || (!selectedIds.length && index === 0) }"
        role="button"
        tabindex="0"
        @click="$emit('select', layer.id)"
      >
        <span class="structure-panel__node"></span>
        <div class="structure-panel__content">
          <span class="structure-panel__title">{{ layer.name }}</span>
          <span class="structure-panel__meta">{{ layer.type }}</span>
        </div>
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
  selectedIds: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["select"]);
</script>

<style scoped lang="scss">
.structure-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-panel__summary {
  font-size: 12px;
  font-weight: 700;
  color: var(--pd-muted);
}

.structure-panel__toolbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.structure-panel__toolbar button {
  height: 30px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-control);
  background: var(--pd-surface-bg);
  color: var(--pd-muted);
  font-size: 12px;
  font-weight: 600;
}

.structure-panel__toolbar button:hover {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.structure-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-panel__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  cursor: pointer;
}

.structure-panel__card:hover {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
}

.structure-panel__card.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.structure-panel__node {
  width: 10px;
  height: 10px;
  border-radius: 0;
  background: var(--pd-accent-border);
  box-shadow: none;
}

.structure-panel__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.structure-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.structure-panel__meta {
  font-size: 12px;
  color: var(--pd-muted);
}
</style>
