<template>
  <div class="data-panel">
    <div class="data-panel__stack">
      <div class="data-panel__block">
        <div class="data-panel__head">
          <span>数据字段</span>
          <small>{{ variables.length }} 项</small>
        </div>
        <div class="data-panel__chips">
          <span v-for="variable in variables" :key="variable" class="data-panel__chip">
            {{ variable }}
          </span>
        </div>
      </div>

      <div class="data-panel__empty">
        <div class="data-panel__empty-title">测试数据面板待接入</div>
        <p>后续这里会承载变量树、示例数据和批量套打入口。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
});
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
