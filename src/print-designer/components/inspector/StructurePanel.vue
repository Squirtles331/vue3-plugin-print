<template>
  <div class="structure-panel">
    <header class="structure-panel__header">
      <div>
        <p class="structure-panel__eyebrow">图层结构</p>
        <h3 class="structure-panel__title">当前页面图层</h3>
        <p class="structure-panel__description">
          点击图层可直接定位到画布中的元素，右侧属性面板会同步到当前选择。
        </p>
      </div>
      <div class="structure-panel__badge">
        <strong>{{ layers.length }}</strong>
        <span>图层</span>
      </div>
    </header>

    <div class="structure-panel__summary">
      <div class="structure-panel__summary-chip">
        <strong>已选中</strong>
        <span>{{ selectedIds.length ? `${selectedIds.length} 个` : "无" }}</span>
      </div>
      <div class="structure-panel__summary-chip">
        <strong>可定位</strong>
        <span>{{ layers.length ? "点击任意图层" : "先添加元素" }}</span>
      </div>
    </div>

    <div class="structure-panel__stack">
      <div v-if="!layers.length" class="structure-panel__empty">
        <strong>当前页面还没有图层</strong>
        <span>先从左侧插入元素，再回到这里查看结构和定位。</span>
      </div>

      <button
        v-for="(layer, index) in layers"
        :key="layer.id"
        type="button"
        class="structure-panel__card"
        :class="{ 'is-active': selectedIds.includes(layer.id), 'is-first': index === 0 }"
        :aria-pressed="selectedIds.includes(layer.id)"
        @click="emit('select', layer.id)"
      >
        <span class="structure-panel__index">#{{ layers.length - index }}</span>
        <div class="structure-panel__content">
          <span class="structure-panel__title">{{ layer.name }}</span>
          <span class="structure-panel__meta">{{ layer.type }}</span>
        </div>
        <span v-if="selectedIds.includes(layer.id)" class="structure-panel__state">已选中</span>
      </button>
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

const emit = defineEmits(["select"]);
</script>

<style scoped lang="scss">
.structure-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.structure-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.structure-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.structure-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.structure-panel__badge {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  text-align: center;
}

.structure-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.structure-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.structure-panel__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.structure-panel__summary-chip {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.structure-panel__summary-chip strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.structure-panel__summary-chip span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.structure-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.structure-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px dashed var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.structure-panel__empty strong {
  color: var(--pd-strong);
  font-size: 14px;
}

.structure-panel__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.structure-panel__card:hover {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
}

.structure-panel__card.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.structure-panel__index {
  display: inline-flex;
  min-width: 24px;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
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

.structure-panel__state {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--pd-accent-border);
  background: #f5f9ff;
  color: var(--pd-accent-text);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
