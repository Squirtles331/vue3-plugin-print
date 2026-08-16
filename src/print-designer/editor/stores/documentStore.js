import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { cloneDeep, createId } from "../../core/clone.js";
import { paletteItems } from "../../mock/palette";
import { pageCards } from "../../mock/pages";
import { createTemplateModel } from "../documentModel.js";
import { mmToRoundedCssPx } from "../measurement.js";
import { CUSTOM_PAPER_SIZE_KEY, getPaperPreset } from "../paperSizePresets";
import { createBlankTemplateDocument, migrateTemplateDocument } from "../../template/templateDocument.js";

const DEFAULT_PAPER_KEY = "A4";
const DEFAULT_PAPER_PRESET = getPaperPreset(DEFAULT_PAPER_KEY);

function createInitialObjects() {
  return {};
}

function updateCurrentPageMeta(pages, size, orientation) {
  return pages.map((page) => {
    if (!page.isCurrent) {
      return page;
    }

    return {
      ...page,
      size,
      orientation,
    };
  });
}

function syncCurrentPageFlags(pages, pageId) {
  const nextPageId = pages.some((page) => page.id === pageId) ? pageId : pages[0]?.id || "page-1";

  return {
    currentPageId: nextPageId,
    pages: pages.map((page) => ({
      ...page,
      isCurrent: page.id === nextPageId,
    })),
  };
}

export const useEditorDocumentStore = defineStore("printDesignerDocument", () => {
  const initialDocument = createBlankTemplateDocument();
  const templateId = ref(initialDocument.id);
  const documentName = ref(initialDocument.meta.name);
  const saveStatus = ref("未保存");
  const unit = ref("mm");
  const palette = shallowRef(paletteItems);
  const pages = ref([...pageCards]);
  const variables = ref([]);
  const objectsById = ref(createInitialObjects());
  const pageObjectMap = ref(Object.fromEntries(pages.value.map((page) => [page.id, []])));
  const dirty = ref(false);
  const currentPaperPresetKey = ref(DEFAULT_PAPER_KEY);
  const currentPageId = ref(initialDocument.pages?.find((page) => page.isCurrent)?.id || pageCards[0]?.id || "page-1");
  const pageWidthMm = ref(DEFAULT_PAPER_PRESET?.widthMm || 210);
  const pageHeightMm = ref(DEFAULT_PAPER_PRESET?.heightMm || 297);
  const marginTopMm = ref(8);
  const marginRightMm = ref(8);
  const marginBottomMm = ref(8);
  const marginLeftMm = ref(8);
  const pageBackground = ref("#ffffff");
  const pageCornerVisible = ref(true);
  const headerLineVisible = ref(false);
  const footerLineVisible = ref(false);
  const headerOffsetMm = ref(26.5);
  const footerOffsetMm = ref(26.5);
  const printMarksVisible = ref(false);

  const totalPages = computed(() => pages.value.length);
  const currentPage = computed(() => pages.value.find((page) => page.id === currentPageId.value) || pages.value[0] || null);
  const currentPageGroups = computed(() => Array.isArray(currentPage.value?.groups) ? currentPage.value.groups : []);
  const currentPageNumber = computed(() =>
    currentPage.value ? pages.value.findIndex((page) => page.id === currentPage.value.id) + 1 : 1
  );
  const orderedObjectIds = computed(() => pageObjectMap.value[currentPage.value?.id || currentPageId.value || "page-1"] || []);
  const layers = computed(() =>
    orderedObjectIds.value
      .map((id) => {
        const object = objectsById.value[id];

        if (!object) {
          return null;
        }

        return {
          id: object.id,
          name: object.name,
          type: object.type,
          locked: Boolean(object.locked),
          visible: object.visible !== false,
          printable: object.printable !== false,
          zIndex: Number.isFinite(Number(object.zIndex)) ? Number(object.zIndex) : 0,
        };
      })
      .filter(Boolean)
  );
  const currentPaperPreset = computed(() => getPaperPreset(currentPaperPresetKey.value));
  const currentPaperLabel = computed(() => {
    if (currentPaperPresetKey.value === CUSTOM_PAPER_SIZE_KEY) {
      return "自定义尺寸";
    }

    return currentPaperPreset.value?.label || "页面";
  });
  const pageWidthPx = computed(() => mmToRoundedCssPx(pageWidthMm.value));
  const pageHeightPx = computed(() => mmToRoundedCssPx(pageHeightMm.value));
  const pageOrientation = computed(() => (pageWidthMm.value > pageHeightMm.value ? "横向" : "纵向"));
  const currentPageTitle = computed(() => currentPage.value?.title || "Page 1");
  const templateModel = computed(() =>
    createTemplateModel({
      documentName: documentName.value,
      unit: unit.value,
      currentPaperPresetKey: currentPaperPresetKey.value,
      pageWidthMm: pageWidthMm.value,
      pageHeightMm: pageHeightMm.value,
      marginTopMm: marginTopMm.value,
      marginRightMm: marginRightMm.value,
      marginBottomMm: marginBottomMm.value,
      marginLeftMm: marginLeftMm.value,
      pageBackground: pageBackground.value,
      pageCornerVisible: pageCornerVisible.value,
      headerLineVisible: headerLineVisible.value,
      footerLineVisible: footerLineVisible.value,
      headerOffsetMm: headerOffsetMm.value,
      footerOffsetMm: footerOffsetMm.value,
      printMarksVisible: printMarksVisible.value,
      pages: pages.value,
      pageObjectMap: pageObjectMap.value,
      objectsById: objectsById.value,
    })
  );

  function syncCurrentPageMeta() {
    pages.value = updateCurrentPageMeta(pages.value, currentPaperLabel.value, pageOrientation.value);
  }

  function markDirty(nextStatus = "未保存") {
    dirty.value = true;
    saveStatus.value = nextStatus;
  }

  function markSaved() {
    dirty.value = false;
    saveStatus.value = "已保存";
  }

  function capturePageState() {
    return {
      pages: cloneDeep(pages.value),
      objectsById: cloneDeep(objectsById.value),
      pageObjectMap: cloneDeep(pageObjectMap.value),
      currentPageId: currentPageId.value,
    };
  }

  function applyPageState(snapshot) {
    const nextPages = Array.isArray(snapshot?.pages) ? cloneDeep(snapshot.pages) : [];
    const nextObjectsById = snapshot?.objectsById && typeof snapshot.objectsById === "object" ? cloneDeep(snapshot.objectsById) : {};
    const nextPageObjectMap = snapshot?.pageObjectMap && typeof snapshot.pageObjectMap === "object" ? cloneDeep(snapshot.pageObjectMap) : {};
    const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(
      nextPages,
      snapshot?.currentPageId || currentPageId.value
    );

    pages.value = normalizedPages;
    objectsById.value = nextObjectsById;
    pageObjectMap.value = Object.fromEntries(normalizedPages.map((page) => [page.id, [...(nextPageObjectMap[page.id] || [])]]));
    currentPageId.value = resolvedCurrentPageId;
    markDirty();
  }

  function loadTemplateDocument(source, { markAsDirty = false } = {}) {
    const { document, issues, fromVersion } = migrateTemplateDocument(source);

    if (!document) {
      return { document: null, issues, fromVersion };
    }

    templateId.value = document.id;
    documentName.value = document.meta.name;
    unit.value = document.meta.unit || "mm";
    currentPaperPresetKey.value = document.pageSettings.paper.preset || DEFAULT_PAPER_KEY;
    pageWidthMm.value = document.pageSettings.paper.widthMm;
    pageHeightMm.value = document.pageSettings.paper.heightMm;
    marginTopMm.value = document.pageSettings.margin.top;
    marginRightMm.value = document.pageSettings.margin.right;
    marginBottomMm.value = document.pageSettings.margin.bottom;
    marginLeftMm.value = document.pageSettings.margin.left;
    pageBackground.value = document.pageSettings.background || "#ffffff";
    pageCornerVisible.value = document.pageSettings.cornerMarks?.visible !== false;
    headerLineVisible.value = document.pageSettings.headerLine?.visible === true;
    footerLineVisible.value = document.pageSettings.footerLine?.visible === true;
    headerOffsetMm.value = Number(document.pageSettings.headerLine?.offsetMm) || 26.5;
    footerOffsetMm.value = Number(document.pageSettings.footerLine?.offsetMm) || 26.5;
    printMarksVisible.value = document.pageSettings.printMarks?.visible === true;

    const nextObjects = {};
    const nextPageObjectMap = {};
    pages.value = document.pages.map((page, index) => {
      const { elements = [], ...pageData } = page;
      const pageId = pageData.id || `page-${index + 1}`;
      nextPageObjectMap[pageId] = elements.map((element, elementIndex) => {
        const object = {
          ...element,
          id: element.id || `${pageId}-element-${elementIndex + 1}`,
          pageId,
          zIndex: Number.isFinite(Number(element.zIndex)) ? Number(element.zIndex) : elementIndex,
        };
        nextObjects[object.id] = object;
        return object.id;
      });

      return {
        ...pageData,
        id: pageId,
        isCurrent: index === 0,
      };
    });
    currentPageId.value = pages.value.find((page) => page.isCurrent)?.id || pages.value[0]?.id || "page-1";
    objectsById.value = nextObjects;
    pageObjectMap.value = nextPageObjectMap;
    variables.value = [];

    if (markAsDirty) {
      markDirty();
    } else {
      markSaved();
    }

    return { document, issues, fromVersion };
  }

  function createNewTemplate(overrides = {}) {
    return loadTemplateDocument(createBlankTemplateDocument(overrides), { markAsDirty: true });
  }

  function setVariables(nextVariables = []) {
    variables.value = [...new Set((Array.isArray(nextVariables) ? nextVariables : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean))];
  }

  function addObject(object) {
    objectsById.value = {
      ...objectsById.value,
      [object.id]: object,
    };

    const pageId = object.pageId || currentPage.value?.id || "page-1";
    const objectIds = pageObjectMap.value[pageId] || [];
    pageObjectMap.value = {
      ...pageObjectMap.value,
      [pageId]: [...objectIds, object.id],
    };
    markDirty();
  }

  function addObjects(objects = []) {
    const nextObjects = { ...objectsById.value };
    const nextPageObjectMap = Object.fromEntries(
      Object.entries(pageObjectMap.value).map(([pageId, ids]) => [pageId, [...ids]])
    );
    let added = 0;

    objects.forEach((object) => {
      if (!object?.id || nextObjects[object.id]) {
        return;
      }

      const pageId = object.pageId || currentPage.value?.id || "page-1";
      const ids = nextPageObjectMap[pageId] || [];
      nextObjects[object.id] = {
        ...object,
        pageId,
        zIndex: ids.length,
      };
      nextPageObjectMap[pageId] = [...ids, object.id];
      added += 1;
    });

    if (!added) {
      return false;
    }

    objectsById.value = nextObjects;
    pageObjectMap.value = nextPageObjectMap;
    markDirty();
    return true;
  }

  function removeObject(objectId) {
    if (objectsById.value[objectId]?.locked) {
      return false;
    }
    const nextObjects = { ...objectsById.value };
    delete nextObjects[objectId];
    objectsById.value = nextObjects;
    pageObjectMap.value = Object.fromEntries(
      Object.entries(pageObjectMap.value).map(([pageId, ids]) => [pageId, ids.filter((id) => id !== objectId)])
    );
    prunePageGroups([objectId]);
    markDirty();
    return true;
  }

  function removeObjects(objectIds = []) {
    const removableIds = [...new Set(objectIds)].filter((id) => objectsById.value[id] && !objectsById.value[id].locked);

    if (!removableIds.length) {
      return false;
    }

    const removable = new Set(removableIds);
    const nextObjects = { ...objectsById.value };
    removableIds.forEach((id) => delete nextObjects[id]);
    objectsById.value = nextObjects;
    pageObjectMap.value = Object.fromEntries(
      Object.entries(pageObjectMap.value).map(([pageId, ids]) => [pageId, ids.filter((id) => !removable.has(id))])
    );
    prunePageGroups(removableIds);
    markDirty();
    return true;
  }

  function reorderObject(objectId, action) {
    const object = objectsById.value[objectId];

    if (!object || object.locked) {
      return false;
    }

    const pageId = object.pageId || currentPage.value?.id || "page-1";
    const objectIds = [...(pageObjectMap.value[pageId] || [])];
    const currentIndex = objectIds.indexOf(objectId);

    if (currentIndex === -1) {
      return false;
    }

    const nextIds = [...objectIds];

    if (action === "bringForward" && currentIndex < nextIds.length - 1) {
      [nextIds[currentIndex], nextIds[currentIndex + 1]] = [nextIds[currentIndex + 1], nextIds[currentIndex]];
    } else if (action === "sendBackward" && currentIndex > 0) {
      [nextIds[currentIndex], nextIds[currentIndex - 1]] = [nextIds[currentIndex - 1], nextIds[currentIndex]];
    } else if (action === "bringToFront" && currentIndex < nextIds.length - 1) {
      nextIds.splice(currentIndex, 1);
      nextIds.push(objectId);
    } else if (action === "sendToBack" && currentIndex > 0) {
      nextIds.splice(currentIndex, 1);
      nextIds.unshift(objectId);
    } else {
      return;
    }

    pageObjectMap.value = {
      ...pageObjectMap.value,
      [pageId]: nextIds,
    };

    const nextObjectsById = { ...objectsById.value };
    nextIds.forEach((id, index) => {
      if (!nextObjectsById[id]) {
        return;
      }

      nextObjectsById[id] = {
        ...nextObjectsById[id],
        zIndex: index,
      };
    });
    objectsById.value = nextObjectsById;
    markDirty();
    return true;
  }

  function updateObjectProps(objectId, patch) {
    const object = objectsById.value[objectId];

    if (!object) {
      return false;
    }
    const patchKeys = Object.keys(patch || {});
    const lockSafePatch = patchKeys.length > 0 && patchKeys.every((key) => ["locked", "visible", "printable"].includes(key));
    if (object.locked && !lockSafePatch) {
      return false;
    }

    objectsById.value = {
      ...objectsById.value,
      [objectId]: {
        ...object,
        ...patch,
      },
    };
    markDirty();
    return true;
  }

  function restoreObjectSnapshot(objectId, snapshot) {
    if (!objectsById.value[objectId] || !snapshot || typeof snapshot !== "object") {
      return false;
    }

    objectsById.value = {
      ...objectsById.value,
      [objectId]: {
        ...cloneDeep(snapshot),
        id: objectId,
      },
    };
    markDirty();
    return true;
  }

  function applyObjectPatches(patches = []) {
    const nextObjects = { ...objectsById.value };
    let changed = false;

    patches.forEach(({ id, patch }) => {
      const object = nextObjects[id];
      if (!object || object.locked || !patch || !Object.keys(patch).length) {
        return;
      }
      nextObjects[id] = {
        ...object,
        ...patch,
      };
      changed = true;
    });

    if (!changed) {
      return false;
    }

    objectsById.value = nextObjects;
    markDirty();
    return true;
  }

  function setPageObjectOrder(pageId, objectIds = []) {
    const currentIds = pageObjectMap.value[pageId] || [];
    const currentSet = new Set(currentIds);
    const nextIds = [...objectIds];

    if (nextIds.length !== currentIds.length || new Set(nextIds).size !== nextIds.length || nextIds.some((id) => !currentSet.has(id))) {
      return false;
    }

    const nextObjects = { ...objectsById.value };
    nextIds.forEach((id, index) => {
      const object = nextObjects[id];
      if (object && !object.locked) {
        nextObjects[id] = { ...object, zIndex: index };
      }
    });
    objectsById.value = nextObjects;
    pageObjectMap.value = {
      ...pageObjectMap.value,
      [pageId]: nextIds,
    };
    markDirty();
    return true;
  }

  function setPageGroups(pageId, groups = []) {
    const knownIds = new Set(pageObjectMap.value[pageId] || []);
    const claimedIds = new Set();
    const groupIds = new Set();
    const normalizedGroups = (Array.isArray(groups) ? groups : []).reduce((result, group, index) => {
      const id = String(group?.id || `group-${index + 1}`).trim();
      if (!id || groupIds.has(id)) {
        return result;
      }
      const elementIds = [...new Set(Array.isArray(group?.elementIds) ? group.elementIds.map((item) => String(item || "").trim()) : [])]
        .filter((elementId) => elementId && knownIds.has(elementId) && !claimedIds.has(elementId));
      if (elementIds.length < 2) {
        return result;
      }
      groupIds.add(id);
      elementIds.forEach((elementId) => claimedIds.add(elementId));
      result.push({ id, name: String(group?.name || `Group ${result.length + 1}`).trim() || `Group ${result.length + 1}`, elementIds });
      return result;
    }, []);

    pages.value = pages.value.map((page) => (page.id === pageId ? { ...page, groups: normalizedGroups } : page));
    markDirty();
    return normalizedGroups;
  }

  function prunePageGroups(removedIds = []) {
    const removed = new Set(removedIds);
    if (!removed.size) {
      return;
    }
    pages.value = pages.value.map((page) => {
      const groups = Array.isArray(page.groups) ? page.groups : [];
      const nextGroups = groups
        .map((group) => ({ ...group, elementIds: (group.elementIds || []).filter((id) => !removed.has(id)) }))
        .filter((group) => group.elementIds.length >= 2);
      return nextGroups.length === groups.length && nextGroups.every((group, index) => group.elementIds.length === groups[index].elementIds.length)
        ? page
        : { ...page, groups: nextGroups };
    });
  }

  function createPageGroup(pageId, elementIds = [], name = "") {
    const ids = [...new Set(elementIds)].filter((id) => objectsById.value[id]?.pageId === pageId);
    if (ids.length < 2) {
      return null;
    }
    const groups = Array.isArray(pages.value.find((page) => page.id === pageId)?.groups) ? pages.value.find((page) => page.id === pageId).groups : [];
    const group = { id: createId("group"), name: String(name || `Group ${groups.length + 1}`).trim() || `Group ${groups.length + 1}`, elementIds: ids };
    setPageGroups(pageId, [...groups, group]);
    return group;
  }

  function removePageGroup(pageId, groupId) {
    const page = pages.value.find((item) => item.id === pageId);
    if (!page || !Array.isArray(page.groups) || !page.groups.some((group) => group.id === groupId)) {
      return false;
    }
    setPageGroups(pageId, page.groups.filter((group) => group.id !== groupId));
    return true;
  }

  function setPaperPreset(presetKey) {
    if (presetKey === CUSTOM_PAPER_SIZE_KEY) {
      currentPaperPresetKey.value = CUSTOM_PAPER_SIZE_KEY;
      markDirty();
      return;
    }

    const preset = getPaperPreset(presetKey);

    if (!preset) {
      return;
    }

    currentPaperPresetKey.value = presetKey;
    pageWidthMm.value = preset.widthMm;
    pageHeightMm.value = preset.heightMm;
    syncCurrentPageMeta();
    markDirty();
  }

  function setPageDimensions(width, height) {
    const nextWidth = Number(width);
    const nextHeight = Number(height);

    if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) {
      return;
    }

    pageWidthMm.value = Math.max(20, +nextWidth.toFixed(1));
    pageHeightMm.value = Math.max(20, +nextHeight.toFixed(1));
    currentPaperPresetKey.value = CUSTOM_PAPER_SIZE_KEY;
    syncCurrentPageMeta();
    markDirty();
  }

  function setMargins(patch = {}) {
    const values = {
      top: patch.top ?? marginTopMm.value,
      right: patch.right ?? marginRightMm.value,
      bottom: patch.bottom ?? marginBottomMm.value,
      left: patch.left ?? marginLeftMm.value,
    };
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number.isFinite(Number(value)) ? Math.max(0, +Number(value).toFixed(1)) : null])
    );
    if (Object.values(normalized).some((value) => value == null)) {
      return;
    }
    marginTopMm.value = normalized.top;
    marginRightMm.value = normalized.right;
    marginBottomMm.value = normalized.bottom;
    marginLeftMm.value = normalized.left;
    markDirty();
  }

  function setMarginX(value) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setMargins({ left: nextValue, right: nextValue });
  }

  function setMarginY(value) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    setMargins({ top: nextValue, bottom: nextValue });
  }

  function setUnit(nextUnit) {
    if (nextUnit !== "mm" || unit.value === "mm") {
      return;
    }
    unit.value = "mm";
    markDirty();
  }

  function setDocumentName(value) {
    const name = String(value ?? "").trim();
    if (!name) {
      return;
    }
    documentName.value = name.slice(0, 160);
    markDirty();
  }

  function setCurrentPageTitle(value) {
    const title = String(value ?? "").trim();
    if (!title || !currentPage.value) {
      return;
    }
    pages.value = pages.value.map((page) => (page.id === currentPage.value.id ? { ...page, title: title.slice(0, 160) } : page));
    markDirty();
  }

  function setCurrentPage(pageId) {
    const nextPageId = String(pageId || "").trim();

    if (!nextPageId || nextPageId === currentPageId.value) {
      return false;
    }

    const hasPage = pages.value.some((page) => page.id === nextPageId);

    if (!hasPage) {
      return false;
    }

    const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(pages.value, nextPageId);
    currentPageId.value = resolvedCurrentPageId;
    pages.value = normalizedPages;
    return true;
  }

  function setPageTitle(pageId, title) {
    const nextTitle = String(title ?? "").trim();

    if (!nextTitle) {
      return false;
    }

    let changed = false;
    pages.value = pages.value.map((page) => {
      if (page.id !== pageId || page.title === nextTitle.slice(0, 160)) {
        return page;
      }
      changed = true;
      return {
        ...page,
        title: nextTitle.slice(0, 160),
      };
    });

    if (!changed) {
      return false;
    }

    markDirty();
    return true;
  }

  function movePage(pageId, direction) {
    const index = pages.value.findIndex((page) => page.id === pageId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= pages.value.length) {
      return false;
    }

    const nextPages = [...pages.value];
    const [page] = nextPages.splice(index, 1);
    nextPages.splice(targetIndex, 0, page);
    const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(nextPages, currentPageId.value);
    pages.value = normalizedPages;
    currentPageId.value = resolvedCurrentPageId;
    markDirty();
    return true;
  }

  function setOrientation(orientation) {
    if (!['portrait', 'landscape'].includes(orientation)) {
      return;
    }
    const isLandscape = pageWidthMm.value > pageHeightMm.value;
    if ((orientation === 'landscape') === isLandscape) {
      return;
    }
    setPageDimensions(pageHeightMm.value, pageWidthMm.value);
  }

  function setPageBackground(color) {
    pageBackground.value = color;
    markDirty();
  }

  function togglePageCorner(forceVisible) {
    pageCornerVisible.value = typeof forceVisible === "boolean" ? forceVisible : !pageCornerVisible.value;
    markDirty();
  }

  function toggleHeaderLine(forceVisible) {
    headerLineVisible.value = typeof forceVisible === "boolean" ? forceVisible : !headerLineVisible.value;
    markDirty();
  }

  function toggleFooterLine(forceVisible) {
    footerLineVisible.value = typeof forceVisible === "boolean" ? forceVisible : !footerLineVisible.value;
    markDirty();
  }

  function togglePrintMarks(forceVisible) {
    printMarksVisible.value = typeof forceVisible === "boolean" ? forceVisible : !printMarksVisible.value;
    markDirty();
  }

  function setHeaderOffset(value) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    headerOffsetMm.value = Math.max(0, +nextValue.toFixed(1));
    markDirty();
  }

  function setFooterOffset(value) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    footerOffsetMm.value = Math.max(0, +nextValue.toFixed(1));
    markDirty();
  }

  return {
    documentName,
    templateId,
    saveStatus,
    unit,
    palette,
    pages,
    variables,
    objectsById,
    pageObjectMap,
    dirty,
    currentPaperPresetKey,
    currentPageId,
    currentPaperPreset,
    currentPaperLabel,
    pageWidthMm,
    pageHeightMm,
    pageWidthPx,
    pageHeightPx,
    pageOrientation,
    marginTopMm,
    marginRightMm,
    marginBottomMm,
    marginLeftMm,
    pageBackground,
    pageCornerVisible,
    headerLineVisible,
    footerLineVisible,
    headerOffsetMm,
    footerOffsetMm,
    printMarksVisible,
    totalPages,
    currentPage,
    currentPageGroups,
    currentPageNumber,
    currentPageTitle,
    layers,
    templateModel,
    capturePageState,
    applyPageState,
    markDirty,
    markSaved,
    loadTemplateDocument,
    createNewTemplate,
    setVariables,
    addObject,
    addObjects,
    removeObject,
    removeObjects,
    reorderObject,
    updateObjectProps,
    restoreObjectSnapshot,
    applyObjectPatches,
    setPageObjectOrder,
    setPageGroups,
    createPageGroup,
    removePageGroup,
    setPaperPreset,
    setPageDimensions,
    setOrientation,
    setMargins,
    setMarginX,
    setMarginY,
    setUnit,
    setDocumentName,
    setCurrentPageTitle,
    setCurrentPage,
    setPageTitle,
    movePage,
    setPageBackground,
    togglePageCorner,
    toggleHeaderLine,
    toggleFooterLine,
    togglePrintMarks,
    setHeaderOffset,
    setFooterOffset,
  };
});
