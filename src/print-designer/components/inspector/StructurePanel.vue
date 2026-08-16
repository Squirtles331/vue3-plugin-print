<template>
  <section class="structure-panel">
    <header class="structure-panel__header">
      <div>
        <p class="structure-panel__eyebrow">图层结构</p>
        <h3 class="structure-panel__title">当前页元素</h3>
        <p class="structure-panel__description">点选图层可以定位到画布，状态标签会提示隐藏和锁定情况。</p>
      </div>
      <div class="structure-panel__badge">
        <strong>{{ layers.length }}</strong>
        <span>图层</span>
      </div>
    </header>

    <div class="structure-panel__summary">
      <span :class="{ 'is-active': selectedIds.length }">已选 {{ selectedIds.length }}</span>
      <span>可见 {{ visibleCount }}</span>
      <span>锁定 {{ lockedCount }}</span>
    </div>

    <div class="structure-panel__stack">
      <div v-if="!layers.length" class="structure-panel__empty">
        <strong>当前页面还没有图层</strong>
        <span>先从左侧插入元素，再回到这里查看结构和定位结果。</span>
      </div>

      <button
        v-for="(layer, index) in layers"
        :key="layer.id"
        type="button"
        class="structure-panel__card"
        :class="{ 'is-active': selectedIds.includes(layer.id), 'is-hidden': layer.visible === false, 'is-locked': layer.locked }"
        :aria-pressed="selectedIds.includes(layer.id)"
        :title="layer.name"
        @click="emit('select', layer.id)"
      >
        <span class="structure-panel__index">#{{ layers.length - index }}</span>
        <div class="structure-panel__content">
          <span class="structure-panel__name">{{ layer.name }}</span>
          <span class="structure-panel__meta">
            {{ layer.type }}
            <small v-if="layer.visible === false">隐藏</small>
            <small v-if="layer.locked">锁定</small>
          </span>
        </div>
        <span v-if="selectedIds.includes(layer.id)" class="structure-panel__state">已选中</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">import { computed } from "vue";
const props = defineProps({
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
const visibleCount = computed(() => props.layers.filter((layer) => layer.visible !== false).length);
const lockedCount = computed(() => props.layers.filter((layer) => layer.locked).length);
</script>

<style scoped lang="scss">
.structure-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  font-size: 15px;
  line-height: 1.2;
}

.structure-panel__description {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.structure-panel__badge {
  display: flex;
  min-width: 62px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 7px 10px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.structure-panel__summary span {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  font-weight: 700;
}

.structure-panel__summary span.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.structure-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.structure-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px;
  border: 1px dashed var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.structure-panel__empty strong {
  color: var(--pd-strong);
  font-size: 13px;
}

.structure-panel__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.structure-panel__card:hover,
.structure-panel__card:focus-visible {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
  outline: none;
}

.structure-panel__card.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.structure-panel__card.is-hidden {
  opacity: 0.72;
}

.structure-panel__card.is-locked .structure-panel__name {
  color: #334155;
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

.structure-panel__name {
  overflow: hidden;
  color: var(--pd-strong);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.structure-panel__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pd-muted);
  font-size: 12px;
}

.structure-panel__meta small,
.structure-panel__state {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.structure-panel__state {
  border-color: var(--pd-accent-border);
  background: #f5f9ff;
  color: var(--pd-accent-text);
}

@media (max-width: 480px) {
  .structure-panel__summary {
    grid-template-columns: 1fr;
  }

  .structure-panel__header {
    flex-direction: column;
  }
}
</style>
