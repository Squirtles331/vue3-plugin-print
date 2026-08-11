<template>
  <div class="binding-panel">
    <header class="binding-panel__header">
      <div>
        <p class="binding-panel__eyebrow">数据绑定</p>
        <h2 class="binding-panel__title">字段路径</h2>
        <p class="binding-panel__description">先找路径，再回到属性面板填入字段名，适合快速绑定文本、表格和标签网格。</p>
      </div>
      <div class="binding-panel__badge">
        <strong>{{ variableCount }}</strong>
        <span>可用字段</span>
      </div>
    </header>

    <div class="binding-panel__summary">
      <span>筛选 {{ filteredCount }}</span>
      <span>总计 {{ variableCount }}</span>
      <span>{{ toolbarNote }}</span>
    </div>

    <div class="binding-panel__toolbar">
      <PdInput v-model="searchQuery" clearable size="small" :prefix-icon="Search" placeholder="搜索字段路径" />
    </div>

    <div class="binding-panel__body">
      <DataPanel :variables="variables" :search-query="searchQuery" variant="embedded" @select="emit('bind', $event)" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Search } from "../../ui/icons.js";
import PdInput from "../../ui/primitives/PdInput.vue";
import DataPanel from "../../components/sidebar/DataPanel.vue";

const props = defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["bind"]);

const searchQuery = ref("");
const variableCount = computed(() => props.variables.length);

const filteredCount = computed(() => {
  const query = String(searchQuery.value || "").trim().toLowerCase();

  if (!query) {
    return variableCount.value;
  }

  return props.variables.filter((variable) => String(variable).toLowerCase().includes(query)).length;
});

const toolbarNote = computed(() => {
  const query = String(searchQuery.value || "").trim();

  return query ? `正在筛选 “${query}”` : "按字段路径快速查找";
});
</script>

<style scoped lang="scss">
.binding-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
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
  font-size: 15px;
  line-height: 1.2;
}

.binding-panel__description {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.binding-panel__badge {
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.binding-panel__summary span {
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
