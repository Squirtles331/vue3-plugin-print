<template>
  <div class="binding-panel">
    <header class="binding-panel__header">
      <div>
        <p class="binding-panel__eyebrow">数据绑定</p>
        <h2 class="binding-panel__title">字段路径</h2>
        <p class="binding-panel__description">
          在这里快速查看可绑定字段，路径复制后可直接填入元素属性。
        </p>
      </div>
      <div class="binding-panel__badge">
        <strong>{{ variableCount }}</strong>
        <span>可用字段</span>
      </div>
    </header>

    <div class="binding-panel__summary">
      <div class="binding-panel__summary-chip">
        <strong>筛选</strong>
        <span>{{ toolbarNote }}</span>
      </div>
      <div class="binding-panel__summary-chip">
        <strong>用途</strong>
        <span>表格、多标签、条码、二维码都依赖这些路径</span>
      </div>
    </div>

    <div class="binding-panel__toolbar">
      <el-input
        v-model="searchQuery"
        clearable
        size="small"
        :prefix-icon="Search"
        placeholder="搜索字段路径"
      />
    </div>

    <div class="binding-panel__body">
      <DataPanel :variables="variables" :search-query="searchQuery" variant="embedded" />
    </div>
  </div>
</template>

<script setup>
import { computed, shallowRef } from "vue";
import { Search } from "@element-plus/icons-vue";
import DataPanel from "../../components/sidebar/DataPanel.vue";

const props = defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
});

const searchQuery = shallowRef("");
const variableCount = computed(() => props.variables.length);

const toolbarNote = computed(() => {
  const query = String(searchQuery.value || "").trim();

  return query ? `正在筛选：${query}` : "按字段路径查找可绑定数据";
});
</script>

<style scoped lang="scss">
.binding-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.binding-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.binding-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.binding-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.binding-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.binding-panel__badge {
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

.binding-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.binding-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.binding-panel__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.binding-panel__summary-chip {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.binding-panel__summary-chip strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.binding-panel__summary-chip span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.binding-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.binding-panel__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

:deep(.binding-panel .data-panel) {
  padding: 0;
  background: transparent;
}

@media (max-width: 480px) {
  .binding-panel__summary {
    grid-template-columns: 1fr;
  }

  .binding-panel__header {
    flex-direction: column;
  }
}
</style>
