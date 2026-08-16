import { cloneDeep } from "../../core/clone.js";
export function createAddObjectCommand(documentStore: any, object: any): any {
    return {
        id: `add-object-${object.id}`,
        label: `Add object ${object.name || object.id}`,
        execute(): any {
            documentStore.addObject(object);
        },
        undo(): any {
            documentStore.removeObject(object.id);
        },
    };
}
export function createRemoveObjectsCommand(documentStore: any, objectIds: any = []): any {
    const removableIds = [...new Set(objectIds)].filter((id: any): any => documentStore.objectsById[id] && !documentStore.objectsById[id].locked) as any;
    if (!removableIds.length) {
        return null;
    }
    const previousObjects = cloneDeep(removableIds.map((id: any): any => documentStore.objectsById[id])) as any;
    const previousOrders = new Map() as any;
    const previousGroups = new Map() as any;
    removableIds.forEach((id: any): any => {
        const object = documentStore.objectsById[id] as any;
        const pageId = object?.pageId || documentStore.currentPage?.id || "page-1" as any;
        if (!previousOrders.has(pageId)) {
            previousOrders.set(pageId, [...(documentStore.pageObjectMap[pageId] || [])]);
            const page = documentStore.pages.find((item: any): any => item.id === pageId) as any;
            previousGroups.set(pageId, cloneDeep(page?.groups || []));
        }
    });
    return {
        id: `remove-objects-${Date.now()}`,
        label: `Delete ${removableIds.length} element${removableIds.length > 1 ? "s" : ""}`,
        execute(): any {
            documentStore.removeObjects(removableIds);
        },
        undo(): any {
            documentStore.addObjects(previousObjects);
            previousOrders.forEach((ids: any, pageId: any): any => {
                documentStore.setPageObjectOrder(pageId, ids);
            });
            previousGroups.forEach((groups: any, pageId: any): any => {
                documentStore.setPageGroups?.(pageId, groups);
            });
        },
    };
}
export function createUpdateObjectPropsCommand(documentStore: any, objectId: any, patch: any): any {
    const currentObject = documentStore.objectsById[objectId] as any;
    if (!currentObject) {
        return null;
    }
    const previous = cloneDeep(currentObject) as any;
    let nextPatch = cloneDeep(patch) as any;
    return {
        id: `update-object-${objectId}`,
        label: `Update object ${objectId}`,
        execute(): any {
            return documentStore.updateObjectProps(objectId, cloneDeep(nextPatch));
        },
        undo(): any {
            if (typeof documentStore.restoreObjectSnapshot === "function") {
                return documentStore.restoreObjectSnapshot(objectId, previous);
            }
            return documentStore.updateObjectProps(objectId, cloneDeep(previous));
        },
        setPatch(patch: any): any {
            nextPatch = cloneDeep(patch);
        },
    };
}
export function createMoveObjectCommand(documentStore: any, objectId: any, previousPatch: any, nextPatch: any): any {
    return {
        id: `move-object-${objectId}`,
        label: `Move object ${objectId}`,
        execute(): any {
            documentStore.updateObjectProps(objectId, nextPatch);
        },
        undo(): any {
            documentStore.updateObjectProps(objectId, previousPatch);
        },
    };
}
export function createTransformObjectCommand(documentStore: any, objectId: any, previousPatch: any, nextPatch: any, label: any = "Transform"): any {
    return {
        id: `transform-object-${objectId}`,
        label: `${label} object ${objectId}`,
        execute(): any {
            documentStore.updateObjectProps(objectId, nextPatch);
        },
        undo(): any {
            documentStore.updateObjectProps(objectId, previousPatch);
        },
    };
}
