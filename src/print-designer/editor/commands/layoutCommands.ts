import { cloneDeep } from "../../core/clone.js";
import { createElement } from "../../core/elementFactory.js";
function number(value: any, fallback: any = 0): any {
    const parsed = Number(value) as any;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function round(value: any): any {
    return +number(value).toFixed(2);
}
function clamp(value: any, min: any, max: any): any {
    return Math.min(max, Math.max(min, value));
}
function uniqueIds(ids: any = []): any {
    return [...new Set(ids.filter(Boolean))];
}
export function getEditableSelection(objectsById: any, selectedIds: any, pageId: any): any {
    return uniqueIds(selectedIds)
        .map((id: any): any => objectsById[id])
        .filter((object: any): any => object && !object.locked && (!pageId || object.pageId === pageId));
}
export function getSelectionBounds(objects: any = []): any {
    if (!objects.length) {
        return null;
    }
    const left = Math.min(...objects.map((object: any): any => number(object.x))) as any;
    const top = Math.min(...objects.map((object: any): any => number(object.y))) as any;
    const right = Math.max(...objects.map((object: any): any => number(object.x) + number(object.width))) as any;
    const bottom = Math.max(...objects.map((object: any): any => number(object.y) + number(object.height))) as any;
    return { left, top, right, bottom, width: round(right - left), height: round(bottom - top) };
}
function clampPatch(object: any, patch: any, page: any, allowOverflow: any = false): any {
    if (allowOverflow) {
        return Object.fromEntries(Object.entries(patch).map(([key, value]: any): any => [key, round(value)]));
    }
    const width = number(object.width) as any;
    const height = number(object.height) as any;
    const pageWidth = number(page?.widthMm, Number.POSITIVE_INFINITY) as any;
    const pageHeight = number(page?.heightMm, Number.POSITIVE_INFINITY) as any;
    const next = { ...patch } as any;
    if (next.x != null) {
        next.x = round(clamp(number(next.x), 0, Math.max(0, pageWidth - width)));
    }
    if (next.y != null) {
        next.y = round(clamp(number(next.y), 0, Math.max(0, pageHeight - height)));
    }
    return next;
}
export function createAlignmentPatches(objects: any, alignment: any, page: any, { allowOverflow = false }: any = {}): any {
    if (objects.length < 2) {
        return [];
    }
    const bounds = getSelectionBounds(objects) as any;
    const positions = {
        left: (object: any): any => ({ x: bounds.left }),
        center: (object: any): any => ({ x: bounds.left + (bounds.width - number(object.width)) / 2 }),
        right: (object: any): any => ({ x: bounds.right - number(object.width) }),
        top: (): any => ({ y: bounds.top }),
        middle: (object: any): any => ({ y: bounds.top + (bounds.height - number(object.height)) / 2 }),
        bottom: (object: any): any => ({ y: bounds.bottom - number(object.height) }),
    } as any;
    const resolver = positions[alignment] as any;
    if (!resolver) {
        return [];
    }
    return objects.map((object: any): any => ({
        id: object.id,
        patch: clampPatch(object, resolver(object), page, allowOverflow),
    }));
}
export function createDistributionPatches(objects: any, axis: any, page: any, { allowOverflow = false }: any = {}): any {
    if (objects.length < 3 || !["horizontal", "vertical"].includes(axis)) {
        return [];
    }
    const coordinate = axis === "horizontal" ? "x" : "y" as any;
    const dimension = axis === "horizontal" ? "width" : "height" as any;
    const sorted = [...objects].sort((left: any, right: any): any => number(left[coordinate]) - number(right[coordinate])) as any;
    const first = sorted[0] as any;
    const last = sorted[sorted.length - 1] as any;
    const span = number(last[coordinate]) + number(last[dimension]) - number(first[coordinate]) as any;
    const used = sorted.reduce((total: any, object: any): any => total + number(object[dimension]), 0) as any;
    const gap = (span - used) / (sorted.length - 1) as any;
    let cursor = number(first[coordinate]) as any;
    return sorted.map((object: any, index: any): any => {
        const patch = index === 0 ? {} : { [coordinate]: cursor } as any;
        cursor += number(object[dimension]) + gap;
        return { id: object.id, patch: clampPatch(object, patch, page, allowOverflow) };
    });
}
export function createDuplicateObjects(objects: any, page: any, { offsetMm = 4, allowOverflow = false }: any = {}): any {
    return objects.map((object: any, index: any): any => {
        const { id, zIndex, ...copy } = cloneDeep(object) as any;
        const candidate = createElement(object.type, {
            ...copy,
            x: number(object.x) + offsetMm,
            y: number(object.y) + offsetMm,
            zIndex: number(object.zIndex) + index + 1,
        }) as any;
        const position = clampPatch(candidate, { x: candidate.x, y: candidate.y }, page, allowOverflow) as any;
        return { ...candidate, ...position };
    });
}
function unlockedOrder(currentIds: any, objectsById: any, selectedIds: any, action: any): any {
    const selected = new Set(selectedIds) as any;
    const unlockedSlots = currentIds
        .map((id: any, index: any): any => ({ id, index, object: objectsById[id] }))
        .filter(({ object }: any): any => object && !object.locked) as any;
    const movableIds = unlockedSlots.map(({ id }: any): any => id) as any;
    const active = movableIds.filter((id: any): any => selected.has(id)) as any;
    if (!active.length) {
        return currentIds;
    }
    const rest = movableIds.filter((id: any): any => !selected.has(id)) as any;
    const ordered = action === "back" ? [...active, ...rest] : [...rest, ...active] as any;
    const next = [...currentIds] as any;
    unlockedSlots.forEach(({ index }: any, orderIndex: any): any => {
        next[index] = ordered[orderIndex];
    });
    return next;
}
export function createOrderIds(currentIds: any, objectsById: any, selectedIds: any, action: any): any {
    return unlockedOrder(currentIds, objectsById, selectedIds, action);
}
export function createPatchTransactionCommand(documentStore: any, label: any, patches: any, { previousPatches = null }: any = {}): any {
    const effective = patches.filter(({ id, patch }: any): any => documentStore.objectsById[id] && Object.keys(patch || {}).length) as any;
    const previous = Array.isArray(previousPatches) ? cloneDeep(previousPatches) : effective.map(({ id, patch }: any): any => {
        const object = documentStore.objectsById[id] as any;
        return { id, patch: Object.fromEntries(Object.keys(patch).map((key: any): any => [key, object[key]])) };
    }) as any;
    if (!effective.length) {
        return null;
    }
    return {
        id: `layout-${label}-${Date.now()}`,
        label,
        execute(): any {
            documentStore.applyObjectPatches(effective);
        },
        undo(): any {
            documentStore.applyObjectPatches(previous);
        },
    };
}
export function createDuplicateCommand(documentStore: any, objects: any): any {
    if (!objects.length) {
        return null;
    }
    const copies = cloneDeep(objects) as any;
    return {
        id: `duplicate-elements-${Date.now()}`,
        label: "Duplicate elements",
        execute(): any {
            documentStore.addObjects(copies);
        },
        undo(): any {
            documentStore.removeObjects(copies.map((object: any): any => object.id));
        },
    };
}
export function createOrderTransactionCommand(documentStore: any, pageId: any, nextIds: any, label: any): any {
    const previousIds = [...(documentStore.pageObjectMap[pageId] || [])] as any;
    if (!nextIds.length || previousIds.join("|") === nextIds.join("|")) {
        return null;
    }
    return {
        id: `layout-order-${Date.now()}`,
        label,
        execute(): any {
            documentStore.setPageObjectOrder(pageId, nextIds);
        },
        undo(): any {
            documentStore.setPageObjectOrder(pageId, previousIds);
        },
    };
}
export function createReorderObjectCommand(documentStore: any, objectId: any, action: any): any {
    const object = documentStore.objectsById[objectId] as any;
    if (!object || object.locked) {
        return null;
    }
    const pageId = object.pageId || documentStore.currentPage?.id || "page-1" as any;
    const previousIds = [...(documentStore.pageObjectMap[pageId] || [])] as any;
    const currentIndex = previousIds.indexOf(objectId) as any;
    const nextIds = [...previousIds] as any;
    if (currentIndex < 0) {
        return null;
    }
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
        return null;
    }
    if (previousIds.join("|") === nextIds.join("|")) {
        return null;
    }
    const labels = {
        bringForward: "Bring layer forward",
        sendBackward: "Send layer backward",
        bringToFront: "Bring layer to front",
        sendToBack: "Send layer to back",
    } as any;
    return {
        id: `layout-layer-order-${objectId}-${action}-${Date.now()}`,
        label: labels[action] || "Reorder layer",
        execute(): any {
            documentStore.setPageObjectOrder(pageId, nextIds);
        },
        undo(): any {
            documentStore.setPageObjectOrder(pageId, previousIds);
        },
    };
}
