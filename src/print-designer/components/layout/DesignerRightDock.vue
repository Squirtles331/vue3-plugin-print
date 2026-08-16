<script setup lang="ts">
import PropertiesPanel from '../inspector/PropertiesPanel.vue'
import StructurePanel from '../inspector/StructurePanel.vue'

defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
  variables: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <aside class="designer-right-dock">
    <section class="designer-right-dock__panel">
      <header class="designer-right-dock__header">
        <div>
          <p class="designer-right-dock__eyebrow">
            Structure
          </p>
          <h2 class="designer-right-dock__title">
            布局结构
          </h2>
        </div>
        <span class="designer-right-dock__count">{{ layers.length }}</span>
      </header>
      <div class="designer-right-dock__body">
        <StructurePanel :layers="layers" />
      </div>
    </section>

    <section class="designer-right-dock__panel">
      <header class="designer-right-dock__header">
        <div>
          <p class="designer-right-dock__eyebrow">
            Properties
          </p>
          <h2 class="designer-right-dock__title">
            属性面板
          </h2>
        </div>
        <span class="designer-right-dock__count">未选中</span>
      </header>
      <div class="designer-right-dock__body">
        <PropertiesPanel :variables="variables" />
      </div>
    </section>
  </aside>
</template>

<style scoped lang="scss">
.designer-right-dock {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  width: 480px;
  min-width: 480px;
  gap: 1px;
  background: rgba(5, 10, 18, 0.36);
  border-left: 1px solid var(--pd-border);
}

.designer-right-dock__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    linear-gradient(180deg, rgba(27, 36, 50, 0.98), rgba(24, 32, 45, 0.98)),
    var(--pd-panel);
}

.designer-right-dock__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--pd-border);
}

.designer-right-dock__eyebrow {
  margin: 0 0 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pd-muted);
}

.designer-right-dock__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--pd-strong);
}

.designer-right-dock__count {
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
}

.designer-right-dock__body {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow: auto;
}

@media (max-width: 1560px) {
  .designer-right-dock {
    width: 420px;
    min-width: 420px;
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, 1fr);
  }
}
</style>
