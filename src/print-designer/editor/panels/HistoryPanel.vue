<template>
  <div class="history-panel">
    <header class="history-panel__header">
      <div>
        <p class="history-panel__eyebrow">历史面板</p>
        <h2 class="history-panel__title">最近操作</h2>
        <p class="history-panel__description">
          这里展示当前会话的编辑历史。你可以快速确认最近做过什么，以及还能撤回多少步。
        </p>
      </div>
      <div class="history-panel__badge">
        <strong>{{ historyEntries.length }}</strong>
        <span>条记录</span>
      </div>
    </header>

    <div class="history-panel__summary">
      <div class="history-panel__summary-chip" :class="{ 'is-active': canUndo }">
        <strong>撤销</strong>
        <span>{{ canUndo ? "可用" : "不可用" }}</span>
      </div>
      <div class="history-panel__summary-chip" :class="{ 'is-active': canRedo }">
        <strong>重做</strong>
        <span>{{ canRedo ? "可用" : "不可用" }}</span>
      </div>
      <div class="history-panel__summary-chip history-panel__summary-chip--wide">
        <strong>最近动作</strong>
        <span>{{ lastCommandName }}</span>
      </div>
    </div>

    <div class="history-panel__stack">
      <div v-if="!historyEntries.length" class="history-panel__empty">
        暂无可查看的编辑记录。
      </div>
      <div v-for="(entry, index) in historyEntries" :key="entry.id" class="history-panel__card">
        <span class="history-panel__index">{{ historyEntries.length - index }}</span>
        <span class="history-panel__label">{{ entry.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useEditorHistoryStore } from "../stores/historyStore";

const historyStore = useEditorHistoryStore();
const { canRedo, canUndo, historyEntries, lastCommandName } = storeToRefs(historyStore);
</script>

<style scoped lang="scss">
.history-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.history-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.history-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.history-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.history-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.history-panel__badge {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  text-align: center;
}

.history-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.history-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.history-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.history-panel__summary-chip {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.history-panel__summary-chip.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.history-panel__summary-chip strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.history-panel__summary-chip span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.history-panel__summary-chip--wide {
  grid-column: span 1;
}

.history-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-panel__empty,
.history-panel__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
  color: var(--pd-muted);
  font-size: 12px;
}

.history-panel__empty {
  justify-content: center;
}

.history-panel__card {
  color: var(--pd-strong);
  font-weight: 600;
}

.history-panel__index {
  display: inline-flex;
  min-width: 24px;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.history-panel__label {
  min-width: 0;
  flex: 1;
}

@media (max-width: 480px) {
  .history-panel__header,
  .history-panel__summary {
    grid-template-columns: 1fr;
  }

  .history-panel__header {
    display: flex;
    flex-direction: column;
  }

  .history-panel__badge {
    align-items: flex-start;
  }
}
</style>
