<template>
  <div class="binding-panel">
    <header class="binding-panel__header">
      <div>
        <p class="binding-panel__eyebrow">绑定面板</p>
        <h2 class="binding-panel__title">数据字段</h2>
        <p class="binding-panel__description">
          在这里检查模板可绑定字段，复制路径后填入元素属性即可完成数据接入。
        </p>
      </div>
      <div class="binding-panel__badge">
        <strong>{{ variableCount }}</strong>
        <span>可用字段</span>
      </div>
    </header>

    <div class="binding-panel__toolbar">
      <el-input
        v-model="searchQuery"
        clearable
        size="small"
        :prefix-icon="Search"
        placeholder="搜索字段路径"
      />
      <span class="binding-panel__toolbar-note">{{ toolbarNote }}</span>
    </div>

    <div class="binding-panel__tips">
      <span>字段可以直接复制到变量绑定属性</span>
      <span>表格、多标签、条码和二维码都依赖这些路径</span>
    </div>

    <div class="binding-panel__body">
      <DataPanel :variables="variables" :search-query="searchQuery" />
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

  if (query) {
    return `正在筛选：${query}`;
  }

  return "按字段路径查找可绑定数据";
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

.binding-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.binding-panel__toolbar-note {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.binding-panel__tips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e40af;
  font-size: 12px;
  line-height: 1.5;
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
  .binding-panel__header {
    flex-direction: column;
  }

  .binding-panel__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
