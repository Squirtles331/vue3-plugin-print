import { cloneDeep, createId } from "../../core/clone.js";
function capturePageState(documentStore: any): any {
    return {
        pages: cloneDeep(documentStore.pages),
        objectsById: cloneDeep(documentStore.objectsById),
        pageObjectMap: cloneDeep(documentStore.pageObjectMap),
        currentPageId: documentStore.currentPageId,
    };
}
function normalizePageTitle(baseTitle: any, existingTitles: any): any {
    const seed = String(baseTitle || "Page").trim() || "Page" as any;
    let candidate = seed as any;
    let suffix = 2 as any;
    while (existingTitles.has(candidate)) {
        candidate = `${seed} ${suffix}`;
        suffix += 1;
    }
    return candidate;
}
function buildPageSnapshot(documentStore: any, mutator: any): any {
    const snapshot = capturePageState(documentStore) as any;
    const nextSnapshot = {
        pages: cloneDeep(snapshot.pages),
        objectsById: cloneDeep(snapshot.objectsById),
        pageObjectMap: cloneDeep(snapshot.pageObjectMap),
        currentPageId: snapshot.currentPageId,
    } as any;
    mutator(nextSnapshot);
    return nextSnapshot;
}
function applySnapshot(documentStore: any, snapshot: any): any {
    documentStore.applyPageState(snapshot);
}
function createPageRecord(title: any, pageId: any): any {
    return {
        id: pageId,
        title,
        elements: [],
        isCurrent: false,
    };
}
function replacePageInList(pages: any, pageId: any, mapper: any): any {
    return pages.map((page: any): any => (page.id === pageId ? mapper(page) : page));
}
export function createAddPageCommand(documentStore: any, { afterPageId = null }: any = {}): any {
    const before = capturePageState(documentStore) as any;
    const nextPageId = createId("page") as any;
    const currentTitles = new Set(before.pages.map((page: any): any => String(page.title || "").trim()).filter(Boolean)) as any;
    const title = normalizePageTitle(`Page ${before.pages.length + 1}`, currentTitles) as any;
    const pageIds = before.pages.map((page: any): any => page.id) as any;
    const anchorIndex = afterPageId ? pageIds.indexOf(afterPageId) : -1 as any;
    const insertIndex = anchorIndex >= 0 ? anchorIndex + 1 : before.pages.length as any;
    const after = buildPageSnapshot(documentStore, (state: any): any => {
        const nextPage = createPageRecord(title, nextPageId) as any;
        const nextPages = [...state.pages] as any;
        nextPages.splice(insertIndex, 0, nextPage);
        state.pages = nextPages.map((page: any): any => ({
            ...page,
            isCurrent: page.id === nextPageId,
        }));
        state.pageObjectMap = {
            ...state.pageObjectMap,
            [nextPageId]: [],
        };
        state.currentPageId = nextPageId;
    }) as any;
    return {
        id: `page-add-${nextPageId}`,
        label: "Add page",
        execute(): any {
            applySnapshot(documentStore, after);
        },
        undo(): any {
            applySnapshot(documentStore, before);
        },
    };
}
export function createDuplicatePageCommand(documentStore: any, pageId: any): any {
    const sourcePage = documentStore.pages.find((page: any): any => page.id === pageId) as any;
    if (!sourcePage) {
        return null;
    }
    const before = capturePageState(documentStore) as any;
    const nextPageId = createId("page") as any;
    const currentTitles = new Set(before.pages.map((page: any): any => String(page.title || "").trim()).filter(Boolean)) as any;
    const title = normalizePageTitle(`${sourcePage.title || "Page"} 副本`, currentTitles) as any;
    const insertIndex = before.pages.findIndex((page: any): any => page.id === pageId) + 1 as any;
    const sourceObjectIds = [...(before.pageObjectMap[pageId] || [])] as any;
    const clonedObjectMap = {} as any;
    const clonedObjects = {} as any;
    const clonedIdMap = {} as any;
    sourceObjectIds.forEach((objectId: any, index: any): any => {
        const object = before.objectsById[objectId] as any;
        if (!object) {
            return;
        }
        const nextId = createId(object.type || "el") as any;
        const nextObject = {
            ...cloneDeep(object),
            id: nextId,
            pageId: nextPageId,
            zIndex: index,
        } as any;
        clonedObjectMap[nextId] = nextObject;
        clonedObjects[nextId] = nextObject;
        clonedIdMap[objectId] = nextId;
    });
    const clonedGroups = (Array.isArray(sourcePage.groups) ? sourcePage.groups : [])
        .map((group: any, index: any): any => ({
        id: createId("group"),
        name: `${group.name || `Group ${index + 1}`} 副本`,
        elementIds: (group.elementIds || []).map((objectId: any): any => clonedIdMap[objectId]).filter(Boolean),
    }))
        .filter((group: any): any => group.elementIds.length >= 2) as any;
    const after = buildPageSnapshot(documentStore, (state: any): any => {
        const nextPages = [...state.pages] as any;
        nextPages.splice(insertIndex >= 0 ? insertIndex : nextPages.length, 0, {
            id: nextPageId,
            title,
            elements: [],
            groups: clonedGroups,
            isCurrent: false,
        });
        state.pages = nextPages.map((page: any): any => ({
            ...page,
            isCurrent: page.id === nextPageId,
        }));
        state.objectsById = {
            ...state.objectsById,
            ...clonedObjects,
        };
        state.pageObjectMap = {
            ...state.pageObjectMap,
            [nextPageId]: Object.keys(clonedObjectMap),
        };
        state.currentPageId = nextPageId;
    }) as any;
    return {
        id: `page-duplicate-${nextPageId}`,
        label: "Duplicate page",
        execute(): any {
            applySnapshot(documentStore, after);
        },
        undo(): any {
            applySnapshot(documentStore, before);
        },
    };
}
export function createRemovePageCommand(documentStore: any, pageId: any): any {
    const currentPage = documentStore.pages.find((page: any): any => page.id === pageId) as any;
    if (!currentPage || documentStore.pages.length <= 1) {
        return null;
    }
    const before = capturePageState(documentStore) as any;
    const removedIndex = before.pages.findIndex((page: any): any => page.id === pageId) as any;
    const removedPage = before.pages[removedIndex] as any;
    const removedObjectIds = [...(before.pageObjectMap[pageId] || [])] as any;
    const nextCurrentPageId = before.currentPageId === pageId
        ? before.pages[removedIndex + 1]?.id || before.pages[removedIndex - 1]?.id || before.pages[0]?.id || pageId
        : before.currentPageId as any;
    const after = buildPageSnapshot(documentStore, (state: any): any => {
        const nextPages = state.pages.filter((page: any): any => page.id !== pageId) as any;
        const nextObjectsById = { ...state.objectsById } as any;
        removedObjectIds.forEach((objectId: any): any => {
            delete nextObjectsById[objectId];
        });
        state.pages = nextPages.map((page: any): any => ({
            ...page,
            isCurrent: page.id === nextCurrentPageId,
        }));
        state.objectsById = nextObjectsById;
        state.pageObjectMap = Object.fromEntries(state.pages.map((page: any): any => [page.id, [...(state.pageObjectMap[page.id] || [])].filter((id: any): any => !removedObjectIds.includes(id))]));
        state.currentPageId = nextCurrentPageId;
    }) as any;
    return {
        id: `page-remove-${removedPage.id}`,
        label: "Remove page",
        execute(): any {
            applySnapshot(documentStore, after);
        },
        undo(): any {
            applySnapshot(documentStore, before);
        },
    };
}
export function createRenamePageCommand(documentStore: any, pageId: any, title: any): any {
    const nextTitle = String(title || "").trim() as any;
    const page = documentStore.pages.find((item: any): any => item.id === pageId) as any;
    if (!page || !nextTitle || page.title === nextTitle) {
        return null;
    }
    const before = capturePageState(documentStore) as any;
    const after = buildPageSnapshot(documentStore, (state: any): any => {
        state.pages = replacePageInList(state.pages, pageId, (current: any): any => ({
            ...current,
            title: nextTitle.slice(0, 160),
        }));
    }) as any;
    return {
        id: `page-rename-${pageId}`,
        label: "Rename page",
        execute(): any {
            applySnapshot(documentStore, after);
        },
        undo(): any {
            applySnapshot(documentStore, before);
        },
    };
}
export function createMovePageCommand(documentStore: any, pageId: any, direction: any): any {
    const before = capturePageState(documentStore) as any;
    const currentIndex = before.pages.findIndex((page: any): any => page.id === pageId) as any;
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1 as any;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= before.pages.length) {
        return null;
    }
    const after = buildPageSnapshot(documentStore, (state: any): any => {
        const nextPages = [...state.pages] as any;
        const [page] = nextPages.splice(currentIndex, 1) as any;
        nextPages.splice(nextIndex, 0, page);
        state.pages = nextPages.map((item: any): any => ({
            ...item,
            isCurrent: item.id === state.currentPageId,
        }));
    }) as any;
    return {
        id: `page-move-${pageId}-${direction}`,
        label: "Move page",
        execute(): any {
            applySnapshot(documentStore, after);
        },
        undo(): any {
            applySnapshot(documentStore, before);
        },
    };
}
