import { defineStore } from "pinia";
import { computed, ref } from "vue";
export const useEditorSelectionStore = defineStore("printDesignerSelection", (): any => {
    const selectedIds = ref([]) as any;
    const hoverObjectId = ref(null) as any;
    const focusedPageId = ref("page-1") as any;
    const activeHandle = ref(null) as any;
    const tableSelection = ref(null) as any;
    const activeGroupId = ref(null) as any;
    const selectedCount = computed((): any => selectedIds.value.length) as any;
    function select(ids: any): any {
        selectedIds.value = Array.isArray(ids) ? [...ids] : [ids];
        activeGroupId.value = null;
        if (!tableSelection.value || !selectedIds.value.includes(tableSelection.value.tableId)) {
            tableSelection.value = null;
        }
    }
    function selectGroup(group: any): any {
        selectedIds.value = Array.isArray(group?.elementIds) ? [...group.elementIds] : [];
        activeGroupId.value = group?.id || null;
        tableSelection.value = null;
    }
    function clearSelection(): any {
        selectedIds.value = [];
        tableSelection.value = null;
        activeGroupId.value = null;
    }
    function setTableSelection(tableId: any, cells: any = [], section: any = "body"): any {
        const normalizedCells = (Array.isArray(cells) ? cells : [])
            .map((cell: any): any => ({
            rowIndex: Math.max(0, Math.floor(Number(cell?.rowIndex) || 0)),
            colField: String(cell?.colField || ""),
            section: cell?.section === "footer" ? "footer" : section === "footer" ? "footer" : "body",
        }))
            .filter((cell: any): any => cell.colField) as any;
        tableSelection.value = normalizedCells.length
            ? { tableId, section: section === "footer" ? "footer" : "body", cells: normalizedCells }
            : null;
    }
    function clearTableSelection(tableId: any = ""): any {
        if (!tableId || tableSelection.value?.tableId === tableId) {
            tableSelection.value = null;
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
    };
}) as any;
