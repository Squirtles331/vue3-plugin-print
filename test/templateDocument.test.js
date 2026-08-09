import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createBlankTemplateDocument, createPublishReadyTemplatePayload, serializeTemplateDocument, validateTemplateDocument } from "../src/print-designer/template/templateDocument.js";
import { createLocalTemplateRepository } from "../src/print-designer/template/templateRepository.js";

test("new elements start without business demo data", () => {
  const text = createElement("text");
  const barcode = createElement("barcode");
  const table = createElement("table");
  const labels = createElement("multiLabel");

  assert.equal(text.content, "");
  assert.equal(barcode.content, "");
  assert.deepEqual(table.props.sampleData, []);
  assert.deepEqual(table.props.footerData, []);
  assert.equal(table.props.customScript, "");
  assert.equal(labels.props.dataVariable, "");
  assert.deepEqual(labels.props.sampleData, []);
});

test("template serialization strips editor-only page state", () => {
  const template = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", isCurrent: true, elements: [{ ...createElement("text"), selected: true }] }],
  });
  const result = serializeTemplateDocument(template);

  assert.equal(result.valid, true);
  assert.equal(result.document.schemaVersion, 1);
  assert.equal("isCurrent" in result.document.pages[0], false);
  assert.equal("selected" in result.document.pages[0].elements[0], false);
});

test("local repository persists normalized templates", async () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  const repository = createLocalTemplateRepository({ storage });
  const document = createBlankTemplateDocument({ meta: { name: "Invoice" } });
  const saved = await repository.save(document);

  assert.equal((await repository.list()).length, 1);
  assert.deepEqual(await repository.get(saved.id), saved);
  assert.equal(validateTemplateDocument(saved).valid, true);
});

test("publish-ready payload only exposes runtime template fields", () => {
  const result = createPublishReadyTemplatePayload(createBlankTemplateDocument());

  assert.equal(result.valid, true);
  assert.deepEqual(Object.keys(result.payload).sort(), ["id", "meta", "pageSettings", "pages", "schemaVersion"]);
});
