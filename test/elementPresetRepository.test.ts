import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createLocalElementPresetRepository, instantiateElementPreset } from "../src/print-designer/template/elementPresetRepository.js";
function memoryStorage(): any {
    const values = new Map() as any;
    return { getItem: (key: any): any => values.get(key) || null, setItem: (key: any, value: any): any => values.set(key, value) };
}
test("creates, renames, inserts, and deletes isolated element presets", async (): Promise<any> => {
    const repository = createLocalElementPresetRepository({ storage: memoryStorage() }) as any;
    const source = createElement("text", { pageId: "page-a", content: "Original", x: 45, y: 50 }) as any;
    const preset = await repository.create({ name: "Customer name", element: source }) as any;
    const insertedA = instantiateElementPreset(preset, { pageId: "page-b", x: 10, y: 10 }) as any;
    const insertedB = instantiateElementPreset(preset, { pageId: "page-b", x: 20, y: 10 }) as any;
    assert.equal((await repository.list()).length, 1);
    assert.equal(preset.blueprint.id, undefined);
    assert.equal(insertedA.content, "Original");
    assert.notEqual(insertedA.id, insertedB.id);
    assert.equal(insertedA.pageId, "page-b");
    insertedA.content = "Changed";
    assert.equal(insertedB.content, "Original");
    assert.equal((await repository.rename(preset.id, "Recipient name")).name, "Recipient name");
    assert.equal(await repository.delete(preset.id), true);
    assert.equal((await repository.list()).length, 0);
});
test("rejects duplicate names and unavailable storage without changing the editor source", async (): Promise<any> => {
    const storage = memoryStorage() as any;
    const repository = createLocalElementPresetRepository({ storage }) as any;
    const source = createElement("barcode", { content: "ABC" }) as any;
    await repository.create({ name: "Tracking", element: source });
    await assert.rejects((): any => repository.create({ name: "tracking", element: source }), /already exists/);
    const unavailable = createLocalElementPresetRepository({ storage: null }) as any;
    await assert.rejects((): any => unavailable.create({ name: "No storage", element: source }), /storage/);
    assert.equal(source.content, "ABC");
});
