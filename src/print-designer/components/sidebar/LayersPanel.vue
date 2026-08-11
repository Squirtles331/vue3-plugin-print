<template>
  <div class="layers-panel">
    <header class="layers-panel__header">
      <div>
        <p class="layers-panel__eyebrow">图层列表</p>
        <h3 class="layers-panel__title">页面元素</h3>
        <p class="layers-panel__description">
          这里列出当前页所有元素，方便快速确认顺序和名称。
        </p>
      </div>
      <div class="layers-panel__badge">
        <strong>{{ filteredLayers.length }}</strong>
        <span>{{ layers.length }} 项</span>
      </div>
    </header>

    <div class="layers-panel__stack">
      <div v-if="!filteredLayers.length" class="layers-panel__empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </div>

      <div v-for="(layer, index) in filteredLayers" :key="layer.id" class="layers-panel__card" :title="layer.name">
        <span class="layers-panel__card-head">
          <span class="layers-panel__index">#{{ layers.length - index }}</span>
          <span class="layers-panel__meta">{{ layer.type }}</span>
        </span>
        <span class="layers-panel__title">{{ layer.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: "",
  },
});

const normalizedQuery = computed(() => String(props.searchQuery || "").trim().toLowerCase());
const filteredLayers = computed(() => {
  const query = normalizedQuery.value;

  if (!query) {
    return props.layers;
  }

  return props.layers.filter((layer) => {
    const haystack = `${layer.name || ""} ${layer.type || ""}`.toLowerCase();
    return haystack.includes(query);
  });
});

const emptyTitle = computed(() => (props.layers.length ? "没有匹配的图层" : "当前页面还没有元素"));
const emptyDescription = computed(() =>
  props.layers.length ? "清空搜索条件后可查看全部图层。" : "从左侧插入元素后，这里会显示结构。"
);
</script>

<style scoped lang="scss">
.layers-panel {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.layers-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.layers-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.layers-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.layers-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.layers-panel__badge {
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

.layers-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.layers-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.layers-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layers-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px dashed var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.layers-panel__empty strong {
  color: var(--pd-strong);
  font-size: 14px;
}

.layers-panel__card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
}

.layers-panel__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.layers-panel__index {
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
}

.layers-panel__meta {
  color: var(--pd-muted);
  font-size: 12px;
}

.layers-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}
</style>
