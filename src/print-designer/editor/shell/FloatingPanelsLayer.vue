<script setup lang="ts">
import ViewSettingsPanel from '../panels/ViewSettingsPanel.vue'
import { useEditorShellStore } from '../stores/shellStore'
import FloatingPanelFrame from './FloatingPanelFrame.vue'
import InsertAssetsPanel from './InsertAssetsPanel.vue'
import InspectorPanelContent from './InspectorPanelContent.vue'

const shellStore = useEditorShellStore()
const { activeFloatingPanel, panels } = storeToRefs(shellStore)
const hostRef = ref(null)
let resizeObserver = null
let currentDrag = null
const visiblePanels = computed(() => Object.values(panels.value)
  .filter(panel => panel.visible)
  .sort((a, b) => a.zIndex - b.zIndex)
  .reduce((list, panel) => {
    if (activeFloatingPanel.value) {
      return panel.key === activeFloatingPanel.value ? [panel] : list
    }
    return [panel]
  }, []))
function getHostBounds() {
  const host = hostRef.value
  if (!host) {
    return null
  }
  return {
    width: host.clientWidth,
    height: host.clientHeight,
  }
}
function syncPanelBounds() {
  shellStore.ensurePanelBounds(getHostBounds())
}
function onDragMove(event) {
  if (!currentDrag) {
    return
  }
  const deltaX = event.clientX - currentDrag.startClientX
  const deltaY = event.clientY - currentDrag.startClientY
  shellStore.setPanelPosition(currentDrag.panelId, currentDrag.startX + deltaX, currentDrag.startY + deltaY, getHostBounds())
}
function stopDrag() {
  currentDrag = null
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', stopDrag)
}
function onDragStart(payload) {
  if (!payload?.event || payload.event.button !== 0) {
    return
  }
  stopDrag()
  const panel = panels.value[payload.panelId]
  if (!panel) {
    return
  }
  currentDrag = {
    panelId: payload.panelId,
    startClientX: payload.event.clientX,
    startClientY: payload.event.clientY,
    startX: panel.x,
    startY: panel.y,
  }
  payload.event.preventDefault()
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', stopDrag)
}
onMounted(async () => {
  await nextTick()
  syncPanelBounds()
  if (hostRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncPanelBounds()
    })
    resizeObserver.observe(hostRef.value)
  }
})
onBeforeUnmount(() => {
  stopDrag()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div ref="hostRef" class="floating-panels-layer">
    <FloatingPanelFrame
      v-for="panel in visiblePanels"
      :key="panel.key"
      :panel-id="panel.key"
      eyebrow=""
      :title="panel.title"
      :x="panel.x"
      :y="panel.y"
      :width="panel.width"
      :height="panel.height"
      :z-index="panel.zIndex"
      @close="shellStore.closePanel(panel.key)"
      @focus="shellStore.focusPanel(panel.key)"
      @drag-start="onDragStart"
    >
      <InsertAssetsPanel v-if="panel.key === 'template'" panel-key="template" />
      <InspectorPanelContent v-else-if="panel.key === 'pages'" active-key="page" />
      <ViewSettingsPanel v-else-if="panel.key === 'view'" />
      <InspectorPanelContent v-else active-key="properties" />
    </FloatingPanelFrame>
  </div>
</template>

<style scoped lang="scss">
.floating-panels-layer {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
}
</style>
