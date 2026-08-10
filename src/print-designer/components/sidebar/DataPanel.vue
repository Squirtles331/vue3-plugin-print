<template>
  <div class="data-panel">
    <div class="data-panel__stack">
      <div class="data-panel__block">
        <div class="data-panel__head">
          <span>数据字段</span>
          <small>{{ filteredVariables.length }} / {{ variables.length }} 项</small>
        </div>
        <div v-if="filteredVariables.length" class="data-panel__chips">
          <span v-for="variable in filteredVariables" :key="variable" class="data-panel__chip" :title="`绑定路径：${variable}`">
            {{ variable }}
          </span>
        </div>
        <p v-else class="data-panel__no-results">{{ noResultsText }}</p>
      </div>

      <div class="data-panel__empty">
        <div class="data-panel__empty-title">绑定数据建议</div>
        <p>正式使用时，建议从业务 JSON 自动生成字段树，并在预览前提示缺失字段。</p>
      </div>
    </div>
  </div>
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
});

const filteredVariables = computed(() => {
  const query = String(props.searchQuery || "").trim().toLowerCase();

  if (!query) {
    return props.variables;
  }

  return props.variables.filter((variable) => String(variable).toLowerCase().includes(query));
});

const noResultsText = computed(() =>
  props.variables.length ? "没有匹配的字段，清空搜索后可查看全部。" : "还没有可绑定的数据字段。"
);
</script>

<style scoped lang="scss">
.data-panel {
  flex: 1;
  min-height: 0;
  padding: 18px;
  overflow: auto;
  background: #ffffff;
}

.data-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-panel__block {
  padding: 16px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
}

.data-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: var(--pd-strong);
}

.data-panel__head small {
  font-size: 11px;
  color: var(--pd-muted);
}

.data-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.data-panel__no-results {
  margin: 14px 0 0;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.data-panel__chip {
  padding: 7px 10px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-chip);
  background: #f8fafc;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}

.data-panel__empty {
  padding: 18px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
}

.data-panel__empty-title {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.data-panel__empty p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--pd-muted);
}
</style>
