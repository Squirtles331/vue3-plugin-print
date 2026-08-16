import { defineStore } from "pinia";
import { computed, ref } from "vue";

function normalizePaletteDragItem(item) {
  const type = item?.type;

  if (!type) {
    return null;
  }

  return {
    source: "palette",
    type,
    label: item?.label || type,
  };
}

export const useEditorDragStore = defineStore("printDesignerDrag", () => {
  const activePaletteSession = ref(null);
  const requestedPaletteInsert = ref(null);
  const nextSessionId = ref(1);

  const activePaletteItem = computed(() => activePaletteSession.value?.item || null);
  const isPaletteDragging = computed(() => !!activePaletteSession.value);

  function beginPaletteDrag(item) {
    const normalizedItem = normalizePaletteDragItem(item);

    if (!normalizedItem) {
      activePaletteSession.value = null;
      return null;
    }

    const session = {
      id: nextSessionId.value++,
      item: normalizedItem,
    };

    activePaletteSession.value = session;
    return session;
  }

  function clearPaletteDrag(sessionId = null) {
    if (sessionId !== null && activePaletteSession.value?.id !== sessionId) {
      return false;
    }

    activePaletteSession.value = null;
    return true;
  }

  function requestPaletteInsert(item) {
    const normalizedItem = normalizePaletteDragItem(item);
    if (!normalizedItem) {
      return false;
    }
    requestedPaletteInsert.value = { id: nextSessionId.value++, item: normalizedItem };
    return true;
  }

  function consumePaletteInsert(requestId) {
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
});
