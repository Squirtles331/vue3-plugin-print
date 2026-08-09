import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createLocalElementPresetRepository, instantiateElementPreset } from "../src/print-designer/template/elementPresetRepository.js";

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
}

test("creates, renames, inserts, and deletes isolated element presets", async () => {
  const repository = createLocalElementPresetRepository({ storage: memoryStorage() });
  const source = createElement("text", { pageId: "page-a", content: "Original", x: 45, y: 50 });
  const preset = await repository.create({ name: "Customer name", element: source });
  const insertedA = instantiateElementPreset(preset, { pageId: "page-b", x: 10, y: 10 });
  const insertedB = instantiateElementPreset(preset, { pageId: "page-b", x: 20, y: 10 });

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

test("rejects duplicate names and unavailable storage without changing the editor source", async () => {
  const storage = memoryStorage();
  const repository = createLocalElementPresetRepository({ storage });
  const source = createElement("barcode", { content: "ABC" });
  await repository.create({ name: "Tracking", element: source });
  await assert.rejects(() => repository.create({ name: "tracking", element: source }), /already exists/);
  const unavailable = createLocalElementPresetRepository({ storage: null });
  await assert.rejects(() => unavailable.create({ name: "No storage", element: source }), /storage/);
  assert.equal(source.content, "ABC");
});
