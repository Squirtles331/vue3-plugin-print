<template>
  <section class="data-panel" :class="{ 'data-panel--embedded': isEmbedded }">
    <header v-if="!isEmbedded" class="data-panel__header">
      <div>
        <p class="data-panel__eyebrow">数据字段</p>
        <h3 class="data-panel__title">可绑定路径</h3>
        <p class="data-panel__description">按字段路径查找可绑定数据，适合直接复制到属性面板。</p>
      </div>
      <div class="data-panel__badge">
        <strong>{{ filteredVariables.length }}</strong>
        <span>{{ variables.length }} 条</span>
      </div>
    </header>

    <div v-if="!isEmbedded" class="data-panel__summary">
      <span>当前 {{ filteredVariables.length }}</span>
      <span>总计 {{ variables.length }}</span>
      <span>{{ searchSummary }}</span>
    </div>

    <div class="data-panel__stack">
      <div v-if="!filteredVariables.length" class="data-panel__empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </div>

      <div
        v-for="(variable, index) in filteredVariables"
        :key="variable"
        class="data-panel__card"
        :title="`绑定路径：${variable}`"
        role="button"
        tabindex="0"
        @click="emit('select', variable)"
        @keydown.enter.prevent="emit('select', variable)"
        @keydown.space.prevent="emit('select', variable)"
      >
        <span class="data-panel__card-head">
          <span class="data-panel__index">#{{ index + 1 }}</span>
          <span class="data-panel__meta">字段路径</span>
        </span>
        <span class="data-panel__path">{{ variable }}</span>
      </div>
    </div>

    <div v-if="!isEmbedded" class="data-panel__note">
      <strong>提示</strong>
      <span>路径越短，编辑越快。列表只负责查找，不负责修改数据。</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "panel",
  },
});
const emit = defineEmits(["select"]);

const isEmbedded = computed(() => props.variant === "embedded");
const normalizedQuery = computed(() => String(props.searchQuery || "").trim().toLowerCase());

const filteredVariables = computed(() => {
  const query = normalizedQuery.value;

  if (!query) {
    return props.variables;
  }

  return props.variables.filter((variable) => String(variable).toLowerCase().includes(query));
});

const searchSummary = computed(() => {
  const query = String(props.searchQuery || "").trim();
  return query ? `筛选 “${query}”` : "全部路径";
});

const emptyTitle = computed(() => (props.variables.length ? "没有匹配的字段" : "当前还没有可绑定字段"));
const emptyDescription = computed(() =>
  props.variables.length ? "清空筛选条件后可以查看全部路径。" : "导入或生成业务数据后，这里会显示可绑定路径。"
);
</script>

<style scoped lang="scss">
.data-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  overflow: auto;
  background: #ffffff;
}

.data-panel--embedded {
  padding: 0;
  overflow: visible;
  background: transparent;
}

.data-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.data-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.data-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.2;
}

.data-panel__description {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.data-panel__badge {
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

.data-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.data-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.data-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.data-panel__summary span {
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

.data-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-panel__empty {
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

.data-panel__empty strong {
  color: var(--pd-strong);
  font-size: 13px;
}

.data-panel__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  cursor: pointer;
}

.data-panel__card:focus-visible {
  outline: 2px solid var(--pd-accent-text, #1d4ed8);
  outline-offset: 2px;
}

.data-panel__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.data-panel__index {
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
}

.data-panel__meta {
  color: var(--pd-muted);
  font-size: 11px;
}

.data-panel__path {
  color: var(--pd-strong);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.data-panel__note {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.data-panel__note strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.data-panel__note span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .data-panel__summary {
    grid-template-columns: 1fr;
  }
}
</style>
