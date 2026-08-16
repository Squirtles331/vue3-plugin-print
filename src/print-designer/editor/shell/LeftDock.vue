<script setup lang="ts">
import { CollectionTag, DataLine, Document, Files, Search } from '../../ui/icons.js'
import PdButton from '../../ui/primitives/PdButton.vue'
import PdIcon from '../../ui/primitives/PdIcon.vue'
import PdInput from '../../ui/primitives/PdInput.vue'
import { useEditorDocumentStore } from '../stores/documentStore'
import { useEditorShellStore } from '../stores/shellStore'
import InsertAssetsPanel from './InsertAssetsPanel.vue'

const emit = defineEmits(['bind', 'runtime-data'])
const shellStore = useEditorShellStore()
const documentStore = useEditorDocumentStore()
const { activeLeftPanel, leftDockCollapsed, leftPanelWidth } = storeToRefs(shellStore)
const { palette, pages, layers, variables } = storeToRefs(documentStore)
const leftDockRef = ref(null)
const searchQuery = shallowRef('')
const panelItems = [
  { key: 'pages', label: '页面', title: '管理模板页面', icon: Document },
  { key: 'insert', label: '插入', title: '插入元素和常用控件', icon: CollectionTag },
  { key: 'layers', label: '图层', title: '查看并定位页面元素', icon: Files },
  { key: 'data', label: '数据', title: '查看可绑定的字段路径', icon: DataLine },
]
const panelTitle = computed(() => {
  const map = {
    pages: '页面管理',
    insert: '插入元素',
    layers: '图层结构',
    data: '数据字段',
  }
  return map[activeLeftPanel.value] || '左侧面板'
})
const panelDescription = computed(() => {
  const map = {
    pages: '切换页面、重命名、复制或删除。',
    insert: '拖入元素后继续排版和绑定。',
    layers: '查看层级、状态和排序入口。',
    data: '按字段路径查找可绑定数据。',
  }
  return map[activeLeftPanel.value] || ''
})
const panelCounts = computed(() => ({
  pages: pages.value.length,
  insert: palette.value.length,
  layers: layers.value.length,
  data: variables.value.length,
}))
const searchPlaceholder = computed(() => {
  const map = {
    pages: '搜索页面',
    insert: '搜索元素',
    layers: '搜索图层',
    data: '搜索字段路径',
  }
  return map[activeLeftPanel.value] || '搜索'
})
const panelCountLabel = computed(() => `${panelCounts.value[activeLeftPanel.value] || 0} 项`)
function onPointerMove(event) {
  const dockElement = leftDockRef.value
  if (!dockElement) {
    return
  }
  const dockRect = dockElement.getBoundingClientRect()
  shellStore.setLeftPanelWidth(event.clientX - dockRect.left)
}
function stopResize() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopResize)
}
function startResize(event) {
  event.preventDefault()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopResize)
}
onBeforeUnmount(() => {
  stopResize()
})
</script>

<template>
  <aside
    v-if="!leftDockCollapsed"
    ref="leftDockRef"
    class="left-dock"
    :style="{ width: `${leftPanelWidth}px` }"
  >
    <section class="left-dock__surface">
      <header class="left-dock__header">
        <div>
          <p class="left-dock__eyebrow">
            左侧工具
          </p>
          <h2 class="left-dock__title">
            {{ panelTitle }}
          </h2>
          <p class="left-dock__description">
            {{ panelDescription }}
          </p>
        </div>
        <PdButton class="left-dock__close" native-type="button" @click="shellStore.toggleLeftDock()">
          收起
        </PdButton>
      </header>

      <div class="left-dock__main">
        <nav class="left-dock__tabs" aria-label="左侧面板">
          <PdButton
            v-for="item in panelItems"
            :key="item.key"
            class="left-dock__tab"
            :class="{ 'is-active': item.key === activeLeftPanel }"
            native-type="button"
            :title="item.title"
            @click="shellStore.toggleLeftDockPanel(item.key)"
          >
            <template #icon>
              <PdIcon class="left-dock__tab-icon">
                <component :is="item.icon" />
              </PdIcon>
            </template>
            <span class="left-dock__tab-label">{{ item.label }}</span>
            <small class="left-dock__tab-count">{{ panelCounts[item.key] }}</small>
          </PdButton>
        </nav>

        <div class="left-dock__content">
          <div class="left-dock__tools">
            <PdInput
              v-model="searchQuery"
              size="small"
              clearable
              :prefix-icon="Search"
              :placeholder="searchPlaceholder"
            />
            <span class="left-dock__count">{{ panelCountLabel }}</span>
          </div>

          <div class="left-dock__body">
            <InsertAssetsPanel
              :panel-key="activeLeftPanel"
              :search-query="searchQuery"
              @bind="emit('bind', $event)"
              @runtime-data="emit('runtime-data', $event)"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="left-dock__resizer" @pointerdown="startResize" />
  </aside>
</template>

<style scoped lang="scss">
.left-dock {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  border-right: 1px solid #dce3ec;
  background: #ffffff;
}

.left-dock__surface {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.left-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 68px;
  padding: 10px 12px;
  border-bottom: 1px solid #e4eaf1;
  background: #ffffff;
}

.left-dock__eyebrow {
  margin: 0 0 3px;
  color: #7c8ca1;
  font-size: 10px;
  letter-spacing: 0.04em;
}

.left-dock__title {
  margin: 0;
  color: #172033;
  font-size: 14px;
  line-height: 1.2;
}

.left-dock__description {
  margin: 4px 0 0;
  max-width: 240px;
  color: #728096;
  font-size: 11px;
  line-height: 1.35;
}

.left-dock__close {
  height: 27px;
  padding: 0 8px;
  border: 1px solid #d8e1ed;
  border-radius: 3px;
  background: #ffffff;
  color: #5d6b7e;
  font-size: 11px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.left-dock__close:hover {
  border-color: #bfd3f3;
  background: #f4f8ff;
  color: #2456c7;
}

.left-dock__main {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.left-dock__tabs {
  display: flex;
  width: 76px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  padding: 8px 5px;
  border-right: 1px solid #e4eaf1;
  background: #f7f9fc;
}

.left-dock__tab {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 54px;
  padding: 5px 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #6d7c91;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.left-dock__tab-label {
  min-width: 36px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
}

.left-dock__tab :deep(.pd-button__content) {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.left-dock__tab-count {
  display: none;
}

.left-dock__tab:hover,
.left-dock__tab.is-active {
  border-color: #c9daf6;
  background: #eaf2ff;
  color: #2563c8;
  box-shadow: none;
}

.left-dock__tab-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 16px;
  color: currentColor;
}

.left-dock__content {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.left-dock__tools {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid #e4eaf1;
  background: #ffffff;
}

.left-dock__count {
  flex: 0 0 auto;
  color: #6e7d91;
  font-size: 11px;
  font-weight: 700;
}

.left-dock__body {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  background: #ffffff;
}

.left-dock__resizer {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.left-dock__resizer::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 1px;
  background: transparent;
}

.left-dock__resizer:hover::before {
  background: #93b7ed;
}
</style>
