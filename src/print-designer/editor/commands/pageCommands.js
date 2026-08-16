import { cloneDeep, createId } from "../../core/clone.js";

function capturePageState(documentStore) {
  return {
    pages: cloneDeep(documentStore.pages),
    objectsById: cloneDeep(documentStore.objectsById),
    pageObjectMap: cloneDeep(documentStore.pageObjectMap),
    currentPageId: documentStore.currentPageId,
  };
}

function normalizePageTitle(baseTitle, existingTitles) {
  const seed = String(baseTitle || "Page").trim() || "Page";
  let candidate = seed;
  let suffix = 2;

  while (existingTitles.has(candidate)) {
    candidate = `${seed} ${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function buildPageSnapshot(documentStore, mutator) {
  const snapshot = capturePageState(documentStore);
  const nextSnapshot = {
    pages: cloneDeep(snapshot.pages),
    objectsById: cloneDeep(snapshot.objectsById),
    pageObjectMap: cloneDeep(snapshot.pageObjectMap),
    currentPageId: snapshot.currentPageId,
  };

  mutator(nextSnapshot);
  return nextSnapshot;
}

function applySnapshot(documentStore, snapshot) {
  documentStore.applyPageState(snapshot);
}

function createPageRecord(title, pageId) {
  return {
    id: pageId,
    title,
    elements: [],
    isCurrent: false,
  };
}

function replacePageInList(pages, pageId, mapper) {
  return pages.map((page) => (page.id === pageId ? mapper(page) : page));
}

export function createAddPageCommand(documentStore, { afterPageId = null } = {}) {
  const before = capturePageState(documentStore);
  const nextPageId = createId("page");
  const currentTitles = new Set(before.pages.map((page) => String(page.title || "").trim()).filter(Boolean));
  const title = normalizePageTitle(`Page ${before.pages.length + 1}`, currentTitles);
  const pageIds = before.pages.map((page) => page.id);
  const anchorIndex = afterPageId ? pageIds.indexOf(afterPageId) : -1;
  const insertIndex = anchorIndex >= 0 ? anchorIndex + 1 : before.pages.length;

  const after = buildPageSnapshot(documentStore, (state) => {
    const nextPage = createPageRecord(title, nextPageId);
    const nextPages = [...state.pages];
    nextPages.splice(insertIndex, 0, nextPage);
    state.pages = nextPages.map((page) => ({
      ...page,
      isCurrent: page.id === nextPageId,
    }));
    state.pageObjectMap = {
      ...state.pageObjectMap,
      [nextPageId]: [],
    };
    state.currentPageId = nextPageId;
  });

  return {
    id: `page-add-${nextPageId}`,
    label: "Add page",
    execute() {
      applySnapshot(documentStore, after);
    },
    undo() {
      applySnapshot(documentStore, before);
    },
  };
}

export function createDuplicatePageCommand(documentStore, pageId) {
  const sourcePage = documentStore.pages.find((page) => page.id === pageId);

  if (!sourcePage) {
    return null;
  }

  const before = capturePageState(documentStore);
  const nextPageId = createId("page");
  const currentTitles = new Set(before.pages.map((page) => String(page.title || "").trim()).filter(Boolean));
  const title = normalizePageTitle(`${sourcePage.title || "Page"} 副本`, currentTitles);
  const insertIndex = before.pages.findIndex((page) => page.id === pageId) + 1;
  const sourceObjectIds = [...(before.pageObjectMap[pageId] || [])];
  const clonedObjectMap = {};
  const clonedObjects = {};
  const clonedIdMap = {};

  sourceObjectIds.forEach((objectId, index) => {
    const object = before.objectsById[objectId];
    if (!object) {
      return;
    }
    const nextId = createId(object.type || "el");
    const nextObject = {
      ...cloneDeep(object),
      id: nextId,
      pageId: nextPageId,
      zIndex: index,
    };
    clonedObjectMap[nextId] = nextObject;
    clonedObjects[nextId] = nextObject;
    clonedIdMap[objectId] = nextId;
  });
  const clonedGroups = (Array.isArray(sourcePage.groups) ? sourcePage.groups : [])
    .map((group, index) => ({
      id: createId("group"),
      name: `${group.name || `Group ${index + 1}`} 副本`,
      elementIds: (group.elementIds || []).map((objectId) => clonedIdMap[objectId]).filter(Boolean),
    }))
    .filter((group) => group.elementIds.length >= 2);

  const after = buildPageSnapshot(documentStore, (state) => {
    const nextPages = [...state.pages];
    nextPages.splice(insertIndex >= 0 ? insertIndex : nextPages.length, 0, {
      id: nextPageId,
      title,
      elements: [],
      groups: clonedGroups,
      isCurrent: false,
    });
    state.pages = nextPages.map((page) => ({
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
  });

  return {
    id: `page-duplicate-${nextPageId}`,
    label: "Duplicate page",
    execute() {
      applySnapshot(documentStore, after);
    },
    undo() {
      applySnapshot(documentStore, before);
    },
  };
}

export function createRemovePageCommand(documentStore, pageId) {
  const currentPage = documentStore.pages.find((page) => page.id === pageId);

  if (!currentPage || documentStore.pages.length <= 1) {
    return null;
  }

  const before = capturePageState(documentStore);
  const removedIndex = before.pages.findIndex((page) => page.id === pageId);
  const removedPage = before.pages[removedIndex];
  const removedObjectIds = [...(before.pageObjectMap[pageId] || [])];
  const nextCurrentPageId = before.currentPageId === pageId
    ? before.pages[removedIndex + 1]?.id || before.pages[removedIndex - 1]?.id || before.pages[0]?.id || pageId
    : before.currentPageId;

  const after = buildPageSnapshot(documentStore, (state) => {
    const nextPages = state.pages.filter((page) => page.id !== pageId);
    const nextObjectsById = { ...state.objectsById };
    removedObjectIds.forEach((objectId) => {
      delete nextObjectsById[objectId];
    });
    state.pages = nextPages.map((page) => ({
      ...page,
      isCurrent: page.id === nextCurrentPageId,
    }));
    state.objectsById = nextObjectsById;
    state.pageObjectMap = Object.fromEntries(
      state.pages.map((page) => [page.id, [...(state.pageObjectMap[page.id] || [])].filter((id) => !removedObjectIds.includes(id))])
    );
    state.currentPageId = nextCurrentPageId;
  });

  return {
    id: `page-remove-${removedPage.id}`,
    label: "Remove page",
    execute() {
      applySnapshot(documentStore, after);
    },
    undo() {
      applySnapshot(documentStore, before);
    },
  };
}

export function createRenamePageCommand(documentStore, pageId, title) {
  const nextTitle = String(title || "").trim();
  const page = documentStore.pages.find((item) => item.id === pageId);

  if (!page || !nextTitle || page.title === nextTitle) {
    return null;
  }

  const before = capturePageState(documentStore);
  const after = buildPageSnapshot(documentStore, (state) => {
    state.pages = replacePageInList(state.pages, pageId, (current) => ({
      ...current,
      title: nextTitle.slice(0, 160),
    }));
  });

  return {
    id: `page-rename-${pageId}`,
    label: "Rename page",
    execute() {
      applySnapshot(documentStore, after);
    },
    undo() {
      applySnapshot(documentStore, before);
    },
  };
}

export function createMovePageCommand(documentStore, pageId, direction) {
  const before = capturePageState(documentStore);
  const currentIndex = before.pages.findIndex((page) => page.id === pageId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= before.pages.length) {
    return null;
  }

  const after = buildPageSnapshot(documentStore, (state) => {
    const nextPages = [...state.pages];
    const [page] = nextPages.splice(currentIndex, 1);
    nextPages.splice(nextIndex, 0, page);
    state.pages = nextPages.map((item) => ({
      ...item,
      isCurrent: item.id === state.currentPageId,
    }));
  });

  return {
    id: `page-move-${pageId}-${direction}`,
    label: "Move page",
    execute() {
      applySnapshot(documentStore, after);
    },
    undo() {
      applySnapshot(documentStore, before);
    },
  };
}
