import { describe, expect, it } from "vitest";
import { createGroupCommand, createUngroupCommand } from "../src/print-designer/editor/commands/groupCommands.js";

function createDocumentStore() {
  return {
    pages: [{ id: "page-1", groups: [] }],
    objectsById: {
      "text-1": { id: "text-1", pageId: "page-1" },
      "text-2": { id: "text-2", pageId: "page-1" },
      "text-3": { id: "text-3", pageId: "page-1" },
      "other-page": { id: "other-page", pageId: "page-2" },
    },
    setPageGroups(pageId, groups) {
      this.pages = this.pages.map((page) => page.id === pageId ? { ...page, groups: structuredClone(groups) } : page);
    },
  };
}

describe("group commands", () => {
  it("keeps groups on one page, updates membership, and restores through undo", () => {
    const store = createDocumentStore();
    const result = createGroupCommand(store, "page-1", ["text-1", "text-2", "other-page"]);

    expect(result).not.toBeNull();
    result.command.execute();
    expect(store.pages[0].groups).toEqual([{ id: result.group.id, name: "Group 1", elementIds: ["text-1", "text-2"] }]);

    const replacement = createGroupCommand(store, "page-1", ["text-2", "text-3"]);
    replacement.command.execute();
    expect(store.pages[0].groups).toEqual([{ id: replacement.group.id, name: "Group 1", elementIds: ["text-2", "text-3"] }]);

    replacement.command.undo();
    expect(store.pages[0].groups[0].elementIds).toEqual(["text-1", "text-2"]);
  });

  it("ungroups only the selected page group", () => {
    const store = createDocumentStore();
    const grouped = createGroupCommand(store, "page-1", ["text-1", "text-2"]);
    grouped.command.execute();
    const command = createUngroupCommand(store, "page-1", [grouped.group.id]);

    command.execute();
    expect(store.pages[0].groups).toEqual([]);
    command.undo();
    expect(store.pages[0].groups[0].elementIds).toEqual(["text-1", "text-2"]);
  });
});
