import { defineStore } from "pinia";
import { computed, ref } from "vue";
function normalizePaletteDragItem(item: any): any {
    const type = item?.type as any;
    if (!type) {
        return null;
    }
    return {
        source: "palette",
        type,
        label: item?.label || type,
    };
}
export const useEditorDragStore = defineStore("printDesignerDrag", (): any => {
    const activePaletteSession = ref(null) as any;
    const requestedPaletteInsert = ref(null) as any;
    const nextSessionId = ref(1) as any;
    const activePaletteItem = computed((): any => activePaletteSession.value?.item || null) as any;
    const isPaletteDragging = computed((): any => !!activePaletteSession.value) as any;
    function beginPaletteDrag(item: any): any {
        const normalizedItem = normalizePaletteDragItem(item) as any;
        if (!normalizedItem) {
            activePaletteSession.value = null;
            return null;
        }
        const session = {
            id: nextSessionId.value++,
            item: normalizedItem,
        } as any;
        activePaletteSession.value = session;
        return session;
    }
    function clearPaletteDrag(sessionId: any = null): any {
        if (sessionId !== null && activePaletteSession.value?.id !== sessionId) {
            return false;
        }
        activePaletteSession.value = null;
        return true;
    }
    function requestPaletteInsert(item: any): any {
        const normalizedItem = normalizePaletteDragItem(item) as any;
        if (!normalizedItem) {
            return false;
        }
        requestedPaletteInsert.value = { id: nextSessionId.value++, item: normalizedItem };
        return true;
    }
    function consumePaletteInsert(requestId: any): any {
        if (!requestedPaletteInsert.value || (requestId != null && requestedPaletteInsert.value.id !== requestId)) {
            return false;
        }
        requestedPaletteInsert.value = null;
        return true;
    }
    return {
        activePaletteSession,
        requestedPaletteInsert,
        activePaletteItem,
        isPaletteDragging,
        beginPaletteDrag,
        clearPaletteDrag,
        requestPaletteInsert,
        consumePaletteInsert,
    };
}) as any;
