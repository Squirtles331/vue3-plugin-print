<template>
  <div class="history-panel">
    <header class="history-panel__header">
      <div>
        <p class="history-panel__eyebrow">编辑历史</p>
        <h2 class="history-panel__title">最近操作</h2>
        <p class="history-panel__description">保留最近的编辑步骤，方便快速撤销、重做和确认修改范围。</p>
      </div>
      <div class="history-panel__badge">
        <strong>{{ historyEntries.length }}</strong>
        <span>条记录</span>
      </div>
    </header>

    <div class="history-panel__actions">
      <PdButton :disabled="!canUndo" size="small" plain @click="historyStore.undo">
        <template #icon><PdIcon><RefreshLeft /></PdIcon></template>
        撤销
      </PdButton>
      <PdButton :disabled="!canRedo" size="small" plain @click="historyStore.redo">
        <template #icon><PdIcon><RefreshRight /></PdIcon></template>
        重做
      </PdButton>
      <span class="history-panel__hint">{{ historyHint }}</span>
    </div>

    <div class="history-panel__summary">
      <span :class="{ 'is-active': canUndo }">撤销 {{ canUndo ? "可用" : "不可用" }}</span>
      <span :class="{ 'is-active': canRedo }">重做 {{ canRedo ? "可用" : "不可用" }}</span>
    </div>

    <div class="history-panel__current">
      <strong>最近动作</strong>
      <span>{{ lastCommandName }}</span>
    </div>

    <div class="history-panel__stack">
      <div v-if="!historyEntries.length" class="history-panel__empty">
        <strong>暂无编辑记录</strong>
        <span>进行一次操作后，这里会开始记录。</span>
      </div>

      <div v-for="(entry, index) in historyEntries" :key="entry.id" class="history-panel__card">
        <span class="history-panel__index">#{{ historyEntries.length - index }}</span>
        <span class="history-panel__label">{{ entry.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { RefreshLeft, RefreshRight } from "../../ui/icons.js";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdIcon from "../../ui/primitives/PdIcon.vue";
import { useEditorHistoryStore } from "../stores/historyStore";

const historyStore = useEditorHistoryStore();
const { canRedo, canUndo, historyEntries, lastCommandName } = storeToRefs(historyStore);

const historyHint = computed(() => {
  if (canUndo.value && canRedo.value) {
    return "当前有前后两侧可回退步骤";
  }

  if (canUndo.value) {
    return "可以撤销最近一步";
  }

  if (canRedo.value) {
    return "可以重做已撤销步骤";
  }

  return "暂无可用历史";
});
</script>

<style scoped lang="scss">
.history-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
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
  font-size: 15px;
  line-height: 1.2;
}

.history-panel__description {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.history-panel__badge {
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

.history-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.history-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.history-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.history-panel__actions :deep(.pd-button) {
  border-color: var(--pd-border);
  color: #374151;
}

.history-panel__actions :deep(.pd-button:hover:not(:disabled)) {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.history-panel__hint {
  color: var(--pd-muted);
  font-size: 12px;
}

.history-panel__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.history-panel__summary span {
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

.history-panel__summary span.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.history-panel__current {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.history-panel__current strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.history-panel__current span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.4;
}

.history-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-panel__empty {
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

.history-panel__empty strong {
  color: var(--pd-strong);
  font-size: 13px;
}

.history-panel__card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
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
  color: var(--pd-strong);
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .history-panel__summary {
    grid-template-columns: 1fr;
  }

  .history-panel__header {
    flex-direction: column;
  }
}
</style>
