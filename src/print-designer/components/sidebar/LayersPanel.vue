<script setup lang="ts">
import { Bottom, CopyDocument, Delete, Hide, Lock, Top, Unlock, View } from '../../ui/icons.js'
import PdButton from '../../ui/primitives/PdButton.vue'
import PdConfirm from '../../ui/primitives/PdConfirm.vue'
import PdIcon from '../../ui/primitives/PdIcon.vue'

const props = defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['select', 'toggle-visible', 'toggle-lock', 'move', 'duplicate', 'remove'])
const normalizedQuery = computed(() => String(props.searchQuery || '').trim().toLowerCase())
const filteredLayers = computed(() => {
  const query = normalizedQuery.value
  if (!query) {
    return props.layers
  }
  return props.layers.filter((layer) => {
    const haystack = `${layer.name || ''} ${layer.type || ''}`.toLowerCase()
    return haystack.includes(query)
  })
})
const visibleCount = computed(() => props.layers.filter(layer => layer.visible !== false).length)
const lockedCount = computed(() => props.layers.filter(layer => layer.locked).length)
const emptyTitle = computed(() => (props.layers.length ? '没有匹配的图层' : '当前页面还没有元素'))
const emptyDescription = computed(() => props.layers.length ? '清空搜索条件后可查看全部图层。' : '从左侧插入元素后，这里会显示结构、状态和排序入口。')
function isSelected(layerId) {
  return props.selectedIds.includes(layerId)
}
function layerRank(layerId) {
  const index = props.layers.findIndex(layer => layer.id === layerId)
  return index >= 0 ? props.layers.length - index : 0
}
</script>

<template>
  <div class="layers-panel">
    <header class="layers-panel__header">
      <div>
        <p class="layers-panel__eyebrow">
          图层结构
        </p>
        <h3 class="layers-panel__title">
          当前页元素
        </h3>
        <p class="layers-panel__description">
          点选图层可定位到画布，常用的隐藏、锁定、复制和置顶操作放在同一行。
        </p>
      </div>
      <div class="layers-panel__badge">
        <strong>{{ filteredLayers.length }}</strong>
        <span>{{ layers.length }} 个</span>
      </div>
    </header>

    <div class="layers-panel__summary">
      <span>已选 {{ selectedIds.length }}</span>
      <span>可见 {{ visibleCount }}</span>
      <span>锁定 {{ lockedCount }}</span>
    </div>

    <div class="layers-panel__stack">
      <div v-if="!filteredLayers.length" class="layers-panel__empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </div>

      <article
        v-for="layer in filteredLayers"
        :key="layer.id"
        class="layers-panel__card"
        :class="{ 'is-active': isSelected(layer.id), 'is-hidden': !layer.visible, 'is-locked': layer.locked }"
        :title="layer.name"
        role="button"
        tabindex="0"
        :aria-pressed="isSelected(layer.id)"
        @click="emit('select', layer.id)"
        @keydown.enter.prevent="emit('select', layer.id)"
        @keydown.space.prevent="emit('select', layer.id)"
      >
        <div class="layers-panel__main">
          <span class="layers-panel__index">#{{ layerRank(layer.id) }}</span>
          <div class="layers-panel__content">
            <span class="layers-panel__name">{{ layer.name }}</span>
            <span class="layers-panel__meta">
              {{ layer.type }}
              <small v-if="!layer.visible">隐藏</small>
              <small v-if="layer.locked">锁定</small>
            </span>
          </div>
          <span v-if="isSelected(layer.id)" class="layers-panel__state">已选中</span>
        </div>

        <div v-if="showActions" class="layers-panel__actions" @click.stop>
          <PdButton size="small" text :title="layer.visible ? '隐藏图层' : '显示图层'" @click="emit('toggle-visible', layer)">
            <PdIcon><component :is="layer.visible ? View : Hide" /></PdIcon>
          </PdButton>
          <PdButton size="small" text :title="layer.locked ? '解除锁定' : '锁定图层'" @click="emit('toggle-lock', layer)">
            <PdIcon><component :is="layer.locked ? Unlock : Lock" /></PdIcon>
          </PdButton>
          <PdButton :disabled="layer.locked" size="small" text title="置于顶层" @click="emit('move', { layer, action: 'bringToFront' })">
            <PdIcon><Top /></PdIcon>
          </PdButton>
          <PdButton :disabled="layer.locked" size="small" text title="置于底层" @click="emit('move', { layer, action: 'sendToBack' })">
            <PdIcon><Bottom /></PdIcon>
          </PdButton>
          <PdButton :disabled="layer.locked" size="small" text title="复制图层" @click="emit('duplicate', layer)">
            <PdIcon><CopyDocument /></PdIcon>
          </PdButton>
          <PdConfirm
            title="删除此图层后无法恢复，继续吗？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            :disabled="layer.locked"
            @confirm="emit('remove', layer)"
          >
            <template #reference>
              <PdButton :disabled="layer.locked" size="small" text class="layers-panel__danger" title="删除图层">
                <PdIcon><Delete /></PdIcon>
              </PdButton>
            </template>
          </PdConfirm>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layers-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.layers-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.layers-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.layers-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.layers-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.layers-panel__badge {
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

.layers-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.layers-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.layers-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.layers-panel__summary span {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  font-weight: 700;
}

.layers-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layers-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px dashed var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.layers-panel__empty strong {
  color: var(--pd-strong);
  font-size: 14px;
}

.layers-panel__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.layers-panel__card:hover,
.layers-panel__card:focus-visible {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.08) inset;
  outline: none;
}

.layers-panel__card.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.layers-panel__card.is-hidden {
  opacity: 0.72;
}

.layers-panel__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.layers-panel__index {
  display: inline-flex;
  min-width: 28px;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.layers-panel__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.layers-panel__name {
  overflow: hidden;
  color: var(--pd-strong);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layers-panel__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--pd-muted);
  font-size: 12px;
}

.layers-panel__meta small,
.layers-panel__state {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.layers-panel__state {
  border-color: var(--pd-accent-border);
  background: #f5f9ff;
  color: var(--pd-accent-text);
}

.layers-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.layers-panel__actions :deep(.pd-button) {
  height: 28px;
  width: 28px;
  padding: 0;
  border-color: var(--pd-border);
  color: #475569;
}

.layers-panel__actions :deep(.pd-button:hover:not(:disabled)) {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.layers-panel__danger {
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .layers-panel__summary {
    grid-template-columns: 1fr;
  }
}
</style>
