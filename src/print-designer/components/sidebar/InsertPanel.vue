<template>
  <div class="insert-panel">
    <section
      v-for="group in groupedPalette"
      :key="group.label"
      class="insert-panel__group"
    >
      <div class="insert-panel__group-head">
        <span>{{ group.label }}</span>
      </div>

      <div class="insert-panel__card-grid">
        <button
          v-for="item in group.items"
          :key="item.type"
          class="insert-panel__card"
          type="button"
          draggable="true"
          @click="$emit('insert', item)"
          @dragstart="$emit('palette-dragstart', [item, $event])"
          @dragend="$emit('palette-dragend', $event)"
        >
          <span class="insert-panel__card-icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </span>
          <span class="insert-panel__card-label">{{ item.label }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  palette: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["insert", "palette-dragstart", "palette-dragend"]);

const GROUP_DEFINITIONS = [
  {
    label: "常用",
    types: ["text", "image", "table", "barcode", "qrcode"],
  },
  {
    label: "页面",
    types: ["pageNumber"],
  },
  {
    label: "图形",
    types: ["rect", "line", "circle"],
  },
  {
    label: "扩展",
    types: ["multiLabel"],
  },
];

const groupedPalette = computed(() => {
  return GROUP_DEFINITIONS.map((group) => ({
    label: group.label,
    items: group.types
      .map((type) => props.palette.find((item) => item.type === type))
      .filter(Boolean),
  })).filter((group) => group.items.length > 0);
});
</script>

<style scoped lang="scss">
.insert-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.insert-panel__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insert-panel__group-head {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--pd-strong);
}

.insert-panel__card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.insert-panel__card {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  background: var(--pd-panel-bg);
  cursor: move;
  text-align: center;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.insert-panel__card:hover {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.insert-panel__card-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--pd-border);
  background: var(--pd-surface-bg);
  color: var(--pd-accent-text);
  font-size: 18px;
}

.insert-panel__card-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--pd-strong);
}
</style>
