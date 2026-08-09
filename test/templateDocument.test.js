import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createBlankTemplateDocument, createPublishReadyTemplatePayload, migrateTemplateDocument, serializeTemplateDocument, validateTemplateDocument } from "../src/print-designer/template/templateDocument.js";
import { getElementPropertyCapability, validateElementProperty } from "../src/print-designer/core/propertyCapabilities.js";
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
  assert.equal("customScript" in table.props, false);
  assert.deepEqual(table.props.transform, {});
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

test("normalizes documented legacy page and element aliases into canonical fields", () => {
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/legacy-template-v0.json", import.meta.url), "utf8"));
  const result = migrateTemplateDocument(fixture);
  const page = result.document.pages[0];
  const element = page.elements[0];

  assert.equal(result.issues[0].severity, "warning");
  assert.deepEqual(result.document.pageSettings.margin, { top: 7, right: 6, bottom: 7, left: 6 });
  assert.equal(result.document.pageSettings.background, "#f8fafc");
  assert.equal(element.x, 8);
  assert.equal(element.y, 12);
  assert.equal(element.props.format, "CODE39");
  assert.equal("pageWidthMm" in result.document.pageSettings, false);
  assert.equal("left" in element, false);
  assert.equal("selected" in element, false);
});

test("reports bounded invalid values without serializing invalid output", () => {
  const template = createBlankTemplateDocument();
  template.pages[0].elements = [{ ...createElement("barcode"), width: 9, props: { format: "NOT-A-CODE" } }];
  const result = validateTemplateDocument(template);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.path.endsWith("width")));
  assert.ok(result.issues.some((issue) => issue.path.endsWith("props.format")));
});

test("property capability registry declares runtime-backed type-specific fields", () => {
  assert.equal(getElementPropertyCapability("image", "style", "objectFit")?.runtimeEffect, "image");
  assert.match(validateElementProperty("qrcode", "props", "eccLevel", "invalid"), /eccLevel/);
  assert.equal(validateElementProperty("table", "props", "transform", { type: "sort", by: "sku" }), null);
});
