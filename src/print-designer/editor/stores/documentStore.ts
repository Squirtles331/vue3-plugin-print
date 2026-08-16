import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { cloneDeep, createId } from "../../core/clone.js";
import { paletteItems } from "../../mock/palette";
import { pageCards } from "../../mock/pages";
import { createTemplateModel } from "../documentModel.js";
import { mmToRoundedCssPx } from "../measurement.js";
import { CUSTOM_PAPER_SIZE_KEY, getPaperPreset } from "../paperSizePresets";
import { createBlankTemplateDocument, validateTemplateDocument } from "../../template/templateDocument.js";
const DEFAULT_PAPER_KEY = "A4" as any;
const DEFAULT_PAPER_PRESET = getPaperPreset(DEFAULT_PAPER_KEY) as any;
function createInitialObjects(): any {
    return {};
}
function updateCurrentPageMeta(pages: any, size: any, orientation: any): any {
    return pages.map((page: any): any => {
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
function syncCurrentPageFlags(pages: any, pageId: any): any {
    const nextPageId = pages.some((page: any): any => page.id === pageId) ? pageId : pages[0]?.id || "page-1" as any;
    return {
        currentPageId: nextPageId,
        pages: pages.map((page: any): any => ({
            ...page,
            isCurrent: page.id === nextPageId,
        })),
    };
}
export const useEditorDocumentStore = defineStore("printDesignerDocument", (): any => {
    const initialDocument = createBlankTemplateDocument() as any;
    const templateId = ref(initialDocument.id) as any;
    const documentName = ref(initialDocument.meta.name) as any;
    const saveStatus = ref("未保存") as any;
    const unit: any = ref("mm") as any;
    const palette = shallowRef(paletteItems) as any;
    const pages = ref([...pageCards]) as any;
    const variables = ref([]) as any;
    const objectsById = ref(createInitialObjects()) as any;
    const pageObjectMap = ref(Object.fromEntries(pages.value.map((page: any): any => [page.id, []]))) as any;
    const dirty = ref(false) as any;
    const currentPaperPresetKey = ref(DEFAULT_PAPER_KEY) as any;
    const currentPageId = ref(initialDocument.pages?.find((page: any): any => page.isCurrent)?.id || pageCards[0]?.id || "page-1") as any;
    const pageWidthMm = ref(DEFAULT_PAPER_PRESET?.widthMm || 210) as any;
    const pageHeightMm = ref(DEFAULT_PAPER_PRESET?.heightMm || 297) as any;
    const marginTopMm = ref(8) as any;
    const marginRightMm = ref(8) as any;
    const marginBottomMm = ref(8) as any;
    const marginLeftMm = ref(8) as any;
    const pageBackground = ref("#ffffff") as any;
    const pageCornerVisible = ref(true) as any;
    const headerLineVisible = ref(false) as any;
    const footerLineVisible = ref(false) as any;
    const headerOffsetMm = ref(26.5) as any;
    const footerOffsetMm = ref(26.5) as any;
    const printMarksVisible = ref(false) as any;
    const totalPages = computed((): any => pages.value.length) as any;
    const currentPage = computed((): any => pages.value.find((page: any): any => page.id === currentPageId.value) || pages.value[0] || null) as any;
    const currentPageGroups = computed((): any => Array.isArray(currentPage.value?.groups) ? currentPage.value.groups : []) as any;
    const currentPageNumber = computed((): any => currentPage.value ? pages.value.findIndex((page: any): any => page.id === currentPage.value.id) + 1 : 1) as any;
    const orderedObjectIds = computed((): any => pageObjectMap.value[currentPage.value?.id || currentPageId.value || "page-1"] || []) as any;
    const layers = computed((): any => orderedObjectIds.value
        .map((id: any): any => {
        const object = objectsById.value[id] as any;
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
        .filter(Boolean)) as any;
    const currentPaperPreset = computed((): any => getPaperPreset(currentPaperPresetKey.value)) as any;
    const currentPaperLabel = computed((): any => {
        if (currentPaperPresetKey.value === CUSTOM_PAPER_SIZE_KEY) {
            return "自定义尺寸";
        }
        return currentPaperPreset.value?.label || "页面";
    }) as any;
    const pageWidthPx = computed((): any => mmToRoundedCssPx(pageWidthMm.value)) as any;
    const pageHeightPx = computed((): any => mmToRoundedCssPx(pageHeightMm.value)) as any;
    const pageOrientation = computed((): any => (pageWidthMm.value > pageHeightMm.value ? "横向" : "纵向")) as any;
    const currentPageTitle = computed((): any => currentPage.value?.title || "Page 1") as any;
    const templateModel = computed((): any => createTemplateModel({
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
    })) as any;
    function syncCurrentPageMeta(): any {
        pages.value = updateCurrentPageMeta(pages.value, currentPaperLabel.value, pageOrientation.value);
    }
    function markDirty(nextStatus: any = "未保存"): any {
        dirty.value = true;
        saveStatus.value = nextStatus;
    }
    function markSaved(): any {
        dirty.value = false;
        saveStatus.value = "已保存";
    }
    function capturePageState(): any {
        return {
            pages: cloneDeep(pages.value),
            objectsById: cloneDeep(objectsById.value),
            pageObjectMap: cloneDeep(pageObjectMap.value),
            currentPageId: currentPageId.value,
        };
    }
    function applyPageState(snapshot: any): any {
        const nextPages = Array.isArray(snapshot?.pages) ? cloneDeep(snapshot.pages) : [] as any;
        const nextObjectsById = snapshot?.objectsById && typeof snapshot.objectsById === "object" ? cloneDeep(snapshot.objectsById) : {} as any;
        const nextPageObjectMap = snapshot?.pageObjectMap && typeof snapshot.pageObjectMap === "object" ? cloneDeep(snapshot.pageObjectMap) : {} as any;
        const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(nextPages, snapshot?.currentPageId || currentPageId.value) as any;
        pages.value = normalizedPages;
        objectsById.value = nextObjectsById;
        pageObjectMap.value = Object.fromEntries(normalizedPages.map((page: any): any => [page.id, [...(nextPageObjectMap[page.id] || [])]]));
        currentPageId.value = resolvedCurrentPageId;
        markDirty();
    }
    function loadTemplateDocument(source: any, { markAsDirty = false }: any = {}): any {
        const { document, issues } = validateTemplateDocument(source) as any;
        if (!document) {
            return { document: null, issues };
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
        const nextObjects = {} as any;
        const nextPageObjectMap = {} as any;
        pages.value = document.pages.map((page: any, index: any): any => {
            const { elements = [], ...pageData } = page as any;
            const pageId = pageData.id || `page-${index + 1}` as any;
            nextPageObjectMap[pageId] = elements.map((element: any, elementIndex: any): any => {
                const object = {
                    ...element,
                    id: element.id || `${pageId}-element-${elementIndex + 1}`,
                    pageId,
                    zIndex: Number.isFinite(Number(element.zIndex)) ? Number(element.zIndex) : elementIndex,
                } as any;
                nextObjects[object.id] = object;
                return object.id;
            });
            return {
                ...pageData,
                id: pageId,
                isCurrent: index === 0,
            };
        });
        currentPageId.value = pages.value.find((page: any): any => page.isCurrent)?.id || pages.value[0]?.id || "page-1";
        objectsById.value = nextObjects;
        pageObjectMap.value = nextPageObjectMap;
        variables.value = [];
        if (markAsDirty) {
            markDirty();
        }
        else {
            markSaved();
        }
        return { document, issues };
    }
    function createNewTemplate(overrides: any = {}): any {
        return loadTemplateDocument(createBlankTemplateDocument(overrides), { markAsDirty: true });
    }
    function setVariables(nextVariables: any = []): any {
        variables.value = [...new Set((Array.isArray(nextVariables) ? nextVariables : [])
                .map((value: any): any => String(value || "").trim())
                .filter(Boolean))];
    }
    function addObject(object: any): any {
        objectsById.value = {
            ...objectsById.value,
            [object.id]: object,
        };
        const pageId = object.pageId || currentPage.value?.id || "page-1" as any;
        const objectIds = pageObjectMap.value[pageId] || [] as any;
        pageObjectMap.value = {
            ...pageObjectMap.value,
            [pageId]: [...objectIds, object.id],
        };
        markDirty();
    }
    function addObjects(objects: any = []): any {
        const nextObjects = { ...objectsById.value } as any;
        const nextPageObjectMap = Object.fromEntries(Object.entries(pageObjectMap.value).map(([pageId, ids]: any): any => [pageId, [...ids]])) as any;
        let added = 0 as any;
        objects.forEach((object: any): any => {
            if (!object?.id || nextObjects[object.id]) {
                return;
            }
            const pageId = object.pageId || currentPage.value?.id || "page-1" as any;
            const ids = nextPageObjectMap[pageId] || [] as any;
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
    function removeObject(objectId: any): any {
        if (objectsById.value[objectId]?.locked) {
            return false;
        }
        const nextObjects = { ...objectsById.value } as any;
        delete nextObjects[objectId];
        objectsById.value = nextObjects;
        pageObjectMap.value = Object.fromEntries(Object.entries(pageObjectMap.value).map(([pageId, ids]: any): any => [pageId, ids.filter((id: any): any => id !== objectId)]));
        prunePageGroups([objectId]);
        markDirty();
        return true;
    }
    function removeObjects(objectIds: any = []): any {
        const removableIds = [...new Set(objectIds)].filter((id: any): any => objectsById.value[id] && !objectsById.value[id].locked) as any;
        if (!removableIds.length) {
            return false;
        }
        const removable = new Set(removableIds) as any;
        const nextObjects = { ...objectsById.value } as any;
        removableIds.forEach((id: any): any => delete nextObjects[id]);
        objectsById.value = nextObjects;
        pageObjectMap.value = Object.fromEntries(Object.entries(pageObjectMap.value).map(([pageId, ids]: any): any => [pageId, ids.filter((id: any): any => !removable.has(id))]));
        prunePageGroups(removableIds);
        markDirty();
        return true;
    }
    function reorderObject(objectId: any, action: any): any {
        const object = objectsById.value[objectId] as any;
        if (!object || object.locked) {
            return false;
        }
        const pageId = object.pageId || currentPage.value?.id || "page-1" as any;
        const objectIds = [...(pageObjectMap.value[pageId] || [])] as any;
        const currentIndex = objectIds.indexOf(objectId) as any;
        if (currentIndex === -1) {
            return false;
        }
        const nextIds = [...objectIds] as any;
        if (action === "bringForward" && currentIndex < nextIds.length - 1) {
            [nextIds[currentIndex], nextIds[currentIndex + 1]] = [nextIds[currentIndex + 1], nextIds[currentIndex]];
        }
        else if (action === "sendBackward" && currentIndex > 0) {
            [nextIds[currentIndex], nextIds[currentIndex - 1]] = [nextIds[currentIndex - 1], nextIds[currentIndex]];
        }
        else if (action === "bringToFront" && currentIndex < nextIds.length - 1) {
            nextIds.splice(currentIndex, 1);
            nextIds.push(objectId);
        }
        else if (action === "sendToBack" && currentIndex > 0) {
            nextIds.splice(currentIndex, 1);
            nextIds.unshift(objectId);
        }
        else {
            return;
        }
        pageObjectMap.value = {
            ...pageObjectMap.value,
            [pageId]: nextIds,
        };
        const nextObjectsById = { ...objectsById.value } as any;
        nextIds.forEach((id: any, index: any): any => {
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
    function updateObjectProps(objectId: any, patch: any): any {
        const object = objectsById.value[objectId] as any;
        if (!object) {
            return false;
        }
        const patchKeys = Object.keys(patch || {}) as any;
        const lockSafePatch = patchKeys.length > 0 && patchKeys.every((key: any): any => ["locked", "visible", "printable"].includes(key)) as any;
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
    function restoreObjectSnapshot(objectId: any, snapshot: any): any {
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
    function applyObjectPatches(patches: any = []): any {
        const nextObjects = { ...objectsById.value } as any;
        let changed = false as any;
        patches.forEach(({ id, patch }: any): any => {
            const object = nextObjects[id] as any;
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
    function setPageObjectOrder(pageId: any, objectIds: any = []): any {
        const currentIds = pageObjectMap.value[pageId] || [] as any;
        const currentSet = new Set(currentIds) as any;
        const nextIds = [...objectIds] as any;
        if (nextIds.length !== currentIds.length || new Set(nextIds).size !== nextIds.length || nextIds.some((id: any): any => !currentSet.has(id))) {
            return false;
        }
        const nextObjects = { ...objectsById.value } as any;
        nextIds.forEach((id: any, index: any): any => {
            const object = nextObjects[id] as any;
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
    function setPageGroups(pageId: any, groups: any = []): any {
        const knownIds = new Set(pageObjectMap.value[pageId] || []) as any;
        const claimedIds = new Set() as any;
        const groupIds = new Set() as any;
        const normalizedGroups = (Array.isArray(groups) ? groups : []).reduce((result: any, group: any, index: any): any => {
            const id = String(group?.id || `group-${index + 1}`).trim() as any;
            if (!id || groupIds.has(id)) {
                return result;
            }
            const elementIds = [...new Set(Array.isArray(group?.elementIds) ? group.elementIds.map((item: any): any => String(item || "").trim()) : [])]
                .filter((elementId: any): any => elementId && knownIds.has(elementId) && !claimedIds.has(elementId)) as any;
            if (elementIds.length < 2) {
                return result;
            }
            groupIds.add(id);
            elementIds.forEach((elementId: any): any => claimedIds.add(elementId));
            result.push({ id, name: String(group?.name || `Group ${result.length + 1}`).trim() || `Group ${result.length + 1}`, elementIds });
            return result;
        }, []) as any;
        pages.value = pages.value.map((page: any): any => (page.id === pageId ? { ...page, groups: normalizedGroups } : page));
        markDirty();
        return normalizedGroups;
    }
    function prunePageGroups(removedIds: any = []): any {
        const removed = new Set(removedIds) as any;
        if (!removed.size) {
            return;
        }
        pages.value = pages.value.map((page: any): any => {
            const groups = Array.isArray(page.groups) ? page.groups : [] as any;
            const nextGroups = groups
                .map((group: any): any => ({ ...group, elementIds: (group.elementIds || []).filter((id: any): any => !removed.has(id)) }))
                .filter((group: any): any => group.elementIds.length >= 2) as any;
            return nextGroups.length === groups.length && nextGroups.every((group: any, index: any): any => group.elementIds.length === groups[index].elementIds.length)
                ? page
                : { ...page, groups: nextGroups };
        });
    }
    function createPageGroup(pageId: any, elementIds: any = [], name: any = ""): any {
        const ids = [...new Set(elementIds)].filter((id: any): any => objectsById.value[id]?.pageId === pageId) as any;
        if (ids.length < 2) {
            return null;
        }
        const groups = Array.isArray(pages.value.find((page: any): any => page.id === pageId)?.groups) ? pages.value.find((page: any): any => page.id === pageId).groups : [] as any;
        const group = { id: createId("group"), name: String(name || `Group ${groups.length + 1}`).trim() || `Group ${groups.length + 1}`, elementIds: ids } as any;
        setPageGroups(pageId, [...groups, group]);
        return group;
    }
    function removePageGroup(pageId: any, groupId: any): any {
        const page = pages.value.find((item: any): any => item.id === pageId) as any;
        if (!page || !Array.isArray(page.groups) || !page.groups.some((group: any): any => group.id === groupId)) {
            return false;
        }
        setPageGroups(pageId, page.groups.filter((group: any): any => group.id !== groupId));
        return true;
    }
    function setPaperPreset(presetKey: any): any {
        if (presetKey === CUSTOM_PAPER_SIZE_KEY) {
            currentPaperPresetKey.value = CUSTOM_PAPER_SIZE_KEY;
            markDirty();
            return;
        }
        const preset = getPaperPreset(presetKey) as any;
        if (!preset) {
            return;
        }
        currentPaperPresetKey.value = presetKey;
        pageWidthMm.value = preset.widthMm;
        pageHeightMm.value = preset.heightMm;
        syncCurrentPageMeta();
        markDirty();
    }
    function setPageDimensions(width: any, height: any): any {
        const nextWidth = Number(width) as any;
        const nextHeight = Number(height) as any;
        if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) {
            return;
        }
        pageWidthMm.value = Math.max(20, +nextWidth.toFixed(1));
        pageHeightMm.value = Math.max(20, +nextHeight.toFixed(1));
        currentPaperPresetKey.value = CUSTOM_PAPER_SIZE_KEY;
        syncCurrentPageMeta();
        markDirty();
    }
    function setMargins(patch: any = {}): any {
        const values = {
            top: patch.top ?? marginTopMm.value,
            right: patch.right ?? marginRightMm.value,
            bottom: patch.bottom ?? marginBottomMm.value,
            left: patch.left ?? marginLeftMm.value,
        } as any;
        const normalized = Object.fromEntries(Object.entries(values).map(([key, value]: any): any => [key, Number.isFinite(Number(value)) ? Math.max(0, +Number(value).toFixed(1)) : null])) as any;
        if (Object.values(normalized).some((value: any): any => value == null)) {
            return;
        }
        marginTopMm.value = normalized.top;
        marginRightMm.value = normalized.right;
        marginBottomMm.value = normalized.bottom;
        marginLeftMm.value = normalized.left;
        markDirty();
    }
    function setMarginX(value: any): any {
        const nextValue = Number(value) as any;
        if (!Number.isFinite(nextValue)) {
            return;
        }
        setMargins({ left: nextValue, right: nextValue });
    }
    function setMarginY(value: any): any {
        const nextValue = Number(value) as any;
        if (!Number.isFinite(nextValue)) {
            return;
        }
        setMargins({ top: nextValue, bottom: nextValue });
    }
    function setUnit(nextUnit: any): any {
        if (nextUnit !== "mm" || unit.value === "mm") {
            return;
        }
        unit.value = "mm";
        markDirty();
    }
    function setDocumentName(value: any): any {
        const name = String(value ?? "").trim() as any;
        if (!name) {
            return;
        }
        documentName.value = name.slice(0, 160);
        markDirty();
    }
    function setCurrentPageTitle(value: any): any {
        const title = String(value ?? "").trim() as any;
        if (!title || !currentPage.value) {
            return;
        }
        pages.value = pages.value.map((page: any): any => (page.id === currentPage.value.id ? { ...page, title: title.slice(0, 160) } : page));
        markDirty();
    }
    function setCurrentPage(pageId: any): any {
        const nextPageId = String(pageId || "").trim() as any;
        if (!nextPageId || nextPageId === currentPageId.value) {
            return false;
        }
        const hasPage = pages.value.some((page: any): any => page.id === nextPageId) as any;
        if (!hasPage) {
            return false;
        }
        const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(pages.value, nextPageId) as any;
        currentPageId.value = resolvedCurrentPageId;
        pages.value = normalizedPages;
        return true;
    }
    function setPageTitle(pageId: any, title: any): any {
        const nextTitle = String(title ?? "").trim() as any;
        if (!nextTitle) {
            return false;
        }
        let changed = false as any;
        pages.value = pages.value.map((page: any): any => {
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
    function movePage(pageId: any, direction: any): any {
        const index = pages.value.findIndex((page: any): any => page.id === pageId) as any;
        const targetIndex = direction === "up" ? index - 1 : index + 1 as any;
        if (index < 0 || targetIndex < 0 || targetIndex >= pages.value.length) {
            return false;
        }
        const nextPages = [...pages.value] as any;
        const [page] = nextPages.splice(index, 1) as any;
        nextPages.splice(targetIndex, 0, page);
        const { currentPageId: resolvedCurrentPageId, pages: normalizedPages } = syncCurrentPageFlags(nextPages, currentPageId.value) as any;
        pages.value = normalizedPages;
        currentPageId.value = resolvedCurrentPageId;
        markDirty();
        return true;
    }
    function setOrientation(orientation: any): any {
        if (!['portrait', 'landscape'].includes(orientation)) {
            return;
        }
        const isLandscape = pageWidthMm.value > pageHeightMm.value as any;
        if ((orientation === 'landscape') === isLandscape) {
            return;
        }
        setPageDimensions(pageHeightMm.value, pageWidthMm.value);
    }
    function setPageBackground(color: any): any {
        pageBackground.value = color;
        markDirty();
    }
    function togglePageCorner(forceVisible: any): any {
        pageCornerVisible.value = typeof forceVisible === "boolean" ? forceVisible : !pageCornerVisible.value;
        markDirty();
    }
    function toggleHeaderLine(forceVisible: any): any {
        headerLineVisible.value = typeof forceVisible === "boolean" ? forceVisible : !headerLineVisible.value;
        markDirty();
    }
    function toggleFooterLine(forceVisible: any): any {
        footerLineVisible.value = typeof forceVisible === "boolean" ? forceVisible : !footerLineVisible.value;
        markDirty();
    }
    function togglePrintMarks(forceVisible: any): any {
        printMarksVisible.value = typeof forceVisible === "boolean" ? forceVisible : !printMarksVisible.value;
        markDirty();
    }
    function setHeaderOffset(value: any): any {
        const nextValue = Number(value) as any;
        if (!Number.isFinite(nextValue)) {
            return;
        }
        headerOffsetMm.value = Math.max(0, +nextValue.toFixed(1));
        markDirty();
    }
    function setFooterOffset(value: any): any {
        const nextValue = Number(value) as any;
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
}) as any;
