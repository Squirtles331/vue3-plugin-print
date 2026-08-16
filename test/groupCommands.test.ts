import { describe, expect, it } from "vitest";
import { createGroupCommand, createUngroupCommand } from "../src/print-designer/editor/commands/groupCommands.js";
function createDocumentStore(): any {
    return {
        pages: [{ id: "page-1", groups: [] }],
        objectsById: {
            "text-1": { id: "text-1", pageId: "page-1" },
            "text-2": { id: "text-2", pageId: "page-1" },
            "text-3": { id: "text-3", pageId: "page-1" },
            "other-page": { id: "other-page", pageId: "page-2" },
        },
        setPageGroups(pageId: any, groups: any): any {
            this.pages = this.pages.map((page: any): any => page.id === pageId ? { ...page, groups: structuredClone(groups) } : page);
        },
    };
}
describe("group commands", (): any => {
    it("keeps groups on one page, updates membership, and restores through undo", (): any => {
        const store = createDocumentStore() as any;
        const result = createGroupCommand(store, "page-1", ["text-1", "text-2", "other-page"]) as any;
        expect(result).not.toBeNull();
        result.command.execute();
        expect(store.pages[0].groups).toEqual([{ id: result.group.id, name: "Group 1", elementIds: ["text-1", "text-2"] }]);
        const replacement = createGroupCommand(store, "page-1", ["text-2", "text-3"]) as any;
        replacement.command.execute();
        expect(store.pages[0].groups).toEqual([{ id: replacement.group.id, name: "Group 1", elementIds: ["text-2", "text-3"] }]);
        replacement.command.undo();
        expect(store.pages[0].groups[0].elementIds).toEqual(["text-1", "text-2"]);
    });
    it("ungroups only the selected page group", (): any => {
        const store = createDocumentStore() as any;
        const grouped = createGroupCommand(store, "page-1", ["text-1", "text-2"]) as any;
        grouped.command.execute();
        const command = createUngroupCommand(store, "page-1", [grouped.group.id]) as any;
        command.execute();
        expect(store.pages[0].groups).toEqual([]);
        command.undo();
        expect(store.pages[0].groups[0].elementIds).toEqual(["text-1", "text-2"]);
    });
});
