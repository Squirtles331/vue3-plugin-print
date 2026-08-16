export const useEditorToolStore = defineStore('printDesignerTool', () => {
  const activeTool = ref('select')
  const previousTool = ref(null)
  const pointerMode = ref('default')
  const dragState = ref(null)
  function setActiveTool(tool) {
    previousTool.value = activeTool.value
    activeTool.value = tool
  }
  return {
    activeTool,
    previousTool,
    pointerMode,
    dragState,
    setActiveTool,
  }
})
