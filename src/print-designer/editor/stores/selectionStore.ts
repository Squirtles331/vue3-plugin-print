export const useEditorSelectionStore = defineStore('printDesignerSelection', () => {
  const selectedIds = ref([])
  const hoverObjectId = ref(null)
  const focusedPageId = ref('page-1')
  const activeHandle = ref(null)
  const tableSelection = ref(null)
  const activeGroupId = ref(null)
  const selectedCount = computed(() => selectedIds.value.length)
  function select(ids) {
    selectedIds.value = Array.isArray(ids) ? [...ids] : [ids]
    activeGroupId.value = null
    if (!tableSelection.value || !selectedIds.value.includes(tableSelection.value.tableId)) {
      tableSelection.value = null
    }
  }
  function selectGroup(group) {
    selectedIds.value = Array.isArray(group?.elementIds) ? [...group.elementIds] : []
    activeGroupId.value = group?.id || null
    tableSelection.value = null
  }
  function clearSelection() {
    selectedIds.value = []
    tableSelection.value = null
    activeGroupId.value = null
  }
  function setTableSelection(tableId, cells = [], section = 'body') {
    const normalizedCells = (Array.isArray(cells) ? cells : [])
      .map(cell => ({
        rowIndex: Math.max(0, Math.floor(Number(cell?.rowIndex) || 0)),
        colField: String(cell?.colField || ''),
        section: cell?.section === 'footer' ? 'footer' : section === 'footer' ? 'footer' : 'body',
      }))
      .filter(cell => cell.colField)
    tableSelection.value = normalizedCells.length
      ? { tableId, section: section === 'footer' ? 'footer' : 'body', cells: normalizedCells }
      : null
  }
  function clearTableSelection(tableId = '') {
    if (!tableId || tableSelection.value?.tableId === tableId) {
      tableSelection.value = null
    }
  }
  return {
    selectedIds,
    hoverObjectId,
    focusedPageId,
    activeHandle,
    activeGroupId,
    tableSelection,
    selectedCount,
    select,
    selectGroup,
    clearSelection,
    setTableSelection,
    clearTableSelection,
  }
})
