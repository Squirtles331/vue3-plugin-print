<template>
  <div class="layers-panel">
    <div class="layers-panel__stack">
      <div v-if="!filteredLayers.length" class="layers-panel__empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </div>

      <div v-for="layer in filteredLayers" :key="layer.id" class="layers-panel__card" :title="layer.name">
        <span class="layers-panel__title">{{ layer.name }}</span>
        <span class="layers-panel__meta">{{ layer.type }}</span>
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
const emptyDescription = computed(() => (props.layers.length ? "清空搜索条件后可查看全部图层。" : "从插入面板拖入元素后会出现在这里。"));
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

.layers-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px solid var(--pd-border);
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
