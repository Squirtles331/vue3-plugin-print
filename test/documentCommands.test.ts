import { describe, expect, it } from "vitest";
import { createUpdateObjectPropsCommand } from "../src/print-designer/editor/commands/documentCommands.js";
function createDocumentStore(object: any): any {
    return {
        objectsById: { [object.id]: object },
        updateObjectProps(objectId: any, patch: any): any {
            const current = this.objectsById[objectId] as any;
            if (!current) {
                return false;
            }
            this.objectsById[objectId] = { ...current, ...patch };
            return true;
        },
        restoreObjectSnapshot(objectId: any, snapshot: any): any {
            if (!this.objectsById[objectId]) {
                return false;
            }
            this.objectsById[objectId] = structuredClone(snapshot);
            return true;
        },
    };
}
describe("update object property command", (): any => {
    it("restores the complete original object and redoes the latest coalesced patch", (): any => {
        const original = {
            id: "text-1",
            content: "Before",
            locked: false,
            props: {},
            style: { color: "#000000" },
        } as any;
        const documentStore = createDocumentStore(structuredClone(original)) as any;
        const command = createUpdateObjectPropsCommand(documentStore, original.id, {
            content: "First input",
            editorHints: { rowCount: 3 },
        }) as any;
        command.execute();
        documentStore.updateObjectProps(original.id, {
            content: "Latest input",
            editorHints: { rowCount: 5 },
        });
        command.setPatch({
            content: "Latest input",
            editorHints: { rowCount: 5 },
        });
        command.undo();
        expect(documentStore.objectsById[original.id]).toEqual(original);
        command.execute();
        expect(documentStore.objectsById[original.id]).toMatchObject({
            content: "Latest input",
            editorHints: { rowCount: 5 },
        });
    });
});
