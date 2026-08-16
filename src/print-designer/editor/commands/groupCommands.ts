import { cloneDeep, createId } from "../../core/clone.js";
function pageGroups(documentStore: any, pageId: any): any {
    return cloneDeep(documentStore.pages.find((page: any): any => page.id === pageId)?.groups || []);
}
export function createSetPageGroupsCommand(documentStore: any, pageId: any, nextGroups: any, label: any = "Update groups"): any {
    const previousGroups = pageGroups(documentStore, pageId) as any;
    const next = cloneDeep(nextGroups || []) as any;
    if (JSON.stringify(previousGroups) === JSON.stringify(next)) {
        return null;
    }
    return {
        id: `groups-${Date.now()}`,
        label,
        execute(): any {
            documentStore.setPageGroups(pageId, cloneDeep(next));
        },
        undo(): any {
            documentStore.setPageGroups(pageId, cloneDeep(previousGroups));
        },
    };
}
export function createGroupCommand(documentStore: any, pageId: any, elementIds: any, name: any = ""): any {
    const ids = [...new Set(elementIds || [])].filter((id: any): any => documentStore.objectsById[id]?.pageId === pageId) as any;
    if (ids.length < 2) {
        return null;
    }
    const existing = pageGroups(documentStore, pageId) as any;
    const selected = new Set(ids) as any;
    const remaining = existing
        .map((group: any): any => ({ ...group, elementIds: (group.elementIds || []).filter((id: any): any => !selected.has(id)) }))
        .filter((group: any): any => group.elementIds.length >= 2) as any;
    const group = {
        id: createId("group"),
        name: String(name || `Group ${remaining.length + 1}`).trim() || `Group ${remaining.length + 1}`,
        elementIds: ids,
    } as any;
    const command = createSetPageGroupsCommand(documentStore, pageId, [...remaining, group], "Group elements") as any;
    return command ? { command, group } : null;
}
export function createUngroupCommand(documentStore: any, pageId: any, groupIds: any = []): any {
    const targets = new Set(groupIds) as any;
    if (!targets.size) {
        return null;
    }
    const next = pageGroups(documentStore, pageId).filter((group: any): any => !targets.has(group.id)) as any;
    return createSetPageGroupsCommand(documentStore, pageId, next, "Ungroup elements");
}
