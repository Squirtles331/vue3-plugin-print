<template>
  <div class="history-panel">
    <div class="history-panel__summary">
      <span>编辑记录</span>
      <small>{{ historyEntries.length }} 条</small>
    </div>

    <div class="history-panel__stack">
      <div v-if="!historyEntries.length" class="history-panel__empty">
        暂无可查看的编辑记录。
      </div>
      <div v-for="entry in historyEntries" :key="entry.id" class="history-panel__card">
        {{ entry.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useEditorHistoryStore } from "../stores/historyStore";

const historyStore = useEditorHistoryStore();
const { historyEntries } = storeToRefs(historyStore);
</script>

<style scoped lang="scss">
.history-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-panel__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.history-panel__summary span {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.history-panel__summary small {
  font-size: 11px;
  color: var(--pd-muted);
}

.history-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-panel__empty,
.history-panel__card {
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
  color: var(--pd-muted);
  font-size: 12px;
}

.history-panel__card {
  color: var(--pd-strong);
  font-weight: 600;
}
</style>
