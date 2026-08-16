import assert from "node:assert/strict";
import { test } from "vitest";
import { reactive } from "vue";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { buildTableInsertOverrides, TABLE_INSERT_MODES } from "../src/print-designer/core/tableInsertBuilder.js";
import { createBlankTemplateDocument, createPublishReadyTemplatePayload, serializeTemplateDocument, validateTemplateDocument } from "../src/print-designer/template/templateDocument.js";
import { getElementPropertyCapability, validateElementProperty } from "../src/print-designer/core/propertyCapabilities.js";
import { createLocalTemplateRepository } from "../src/print-designer/template/templateRepository.js";
import { createLocalRuntimeDataDraftRepository } from "../src/print-designer/template/runtimeDataDraftRepository.js";
test("new elements reserve business data for table line-item presets only", () => {
    const text = createElement("text");
    const barcode = createElement("barcode");
    const table = createElement("table");
    const labels = createElement("multiLabel");
    assert.equal(text.content, "");
    assert.equal(barcode.content, "");
    assert.equal(table.props.sampleData.length, 26);
    assert.equal(table.props.footerData.length, 3);
    assert.deepEqual(table.props.columns.map((column) => column.key), ["id", "name", "qty", "price", "total"]);
    assert.equal("customScript" in table.props, false);
    assert.deepEqual(table.props.transform, {});
    assert.equal(labels.props.dataVariable, "");
    assert.deepEqual(labels.props.sampleData, []);
});
test("custom table insert keeps structural dimensions without sample data", () => {
    const custom = buildTableInsertOverrides({ mode: TABLE_INSERT_MODES.CUSTOM, columnCount: 3, rowCount: 4 });
    assert.equal(custom.props.columns.length, 3);
    assert.deepEqual(custom.props.sampleData, []);
    assert.deepEqual(custom.props.footerData, []);
    assert.equal(custom.props.showHeader, false);
    assert.equal(custom.props.showFooter, false);
    assert.equal(custom.props.rowHeight, 13);
    assert.equal(custom.editorHints.rowCount, 4);
});
test("default custom table is a 5 by 10 headerless grid sized like the blank-grid preset", () => {
    const custom = buildTableInsertOverrides({ mode: TABLE_INSERT_MODES.CUSTOM });
    assert.equal(custom.props.columns.length, 5);
    assert.equal(custom.editorHints.rowCount, 10);
    assert.equal(custom.props.showHeader, false);
    assert.equal(custom.props.showFooter, false);
    assert.equal(custom.props.rowHeight, 13);
    assert.equal(custom.width, 180);
    assert.equal(custom.height, 130);
});
test("normalizes v2 table data into the safe editable cell model", () => {
    const result = serializeTemplateDocument({
        schemaVersion: 2,
        pages: [{
                id: "page-1",
                elements: [{
                        id: "table-1",
                        type: "table",
                        props: {
                            columns: [{ key: "amount", title: "Amount" }],
                            sampleData: [{ amount: { value: 3, rowSpan: 2, style: { backgroundColor: "#ffffff", customCss: "blocked" } } }],
                            rowHeights: { body: { 0: 9, bad: 20 }, footer: { 1: 7 } },
                        },
                    }],
            }],
    });
    const table = result.document.pages[0].elements[0];
    assert.equal(table.props.columns[0].key, "amount");
    assert.equal(table.props.sampleData[0].amount.value, 3);
    assert.deepEqual(table.props.sampleData[0].amount.style, { backgroundColor: "#ffffff" });
    assert.deepEqual(table.props.rowHeights, { body: { 0: 9 }, footer: { 1: 7 } });
});
test("template serialization strips editor-only page state", () => {
    const template = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", isCurrent: true, elements: [{ ...createElement("text"), selected: true }] }],
    });
    const result = serializeTemplateDocument(template);
    assert.equal(result.valid, true);
    assert.equal(result.document.schemaVersion, 2);
    assert.deepEqual(result.document.pages[0].groups, []);
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
test("local repository deletes saved templates and clears only its own collection", async () => {
    const memory = new Map();
    const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
    const repository = createLocalTemplateRepository({ storage, key: "release-test-templates" });
    const first = await repository.save(createBlankTemplateDocument({ meta: { name: "First" } }));
    const second = await repository.save(createBlankTemplateDocument({ meta: { name: "Second" } }));
    storage.setItem("unrelated-preference", "preserve-me");
    assert.equal(await repository.delete(first.id), true);
    assert.equal(await repository.delete(first.id), false);
    assert.deepEqual((await repository.list()).map((template) => template.id), [second.id]);
    await repository.clear();
    assert.deepEqual(await repository.list(), []);
    assert.equal(storage.getItem("unrelated-preference"), "preserve-me");
});
test("local repository rejects v1 records when they are read", async () => {
    const memory = new Map();
    const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
    const repository = createLocalTemplateRepository({ storage, key: "legacy-read-templates" });
    const legacy = { schemaVersion: 1, id: "legacy-record", meta: { name: "Legacy record", unit: "mm" }, pages: [{ id: "page-1", elements: [] }] };
    storage.setItem("legacy-read-templates", JSON.stringify({ "legacy-record": legacy }));
    await assert.rejects(() => repository.get("legacy-record"), /Stored template validation failed/);
});
test("rejects v1 templates instead of migrating them", () => {
    const result = validateTemplateDocument({
        schemaVersion: 1,
        id: "legacy-v1",
        pages: [{ id: "page-1", elements: [{ ...createElement("text"), id: "text-1" }] }],
    });
    assert.equal(result.valid, false);
    assert.equal(result.document, null);
    assert.match(result.issues[0].message, /Only template schema version 2/);
});
test("rejects removed v1 field aliases even when a document claims schema v2", () => {
    const result = validateTemplateDocument({
        schemaVersion: 2,
        pageSettings: { pageWidthMm: 210 },
        pages: [{
                id: "page-1",
                elements: [{ id: "table-1", type: "table", left: 10, props: { headers: [{ field: "sku", header: "SKU" }] }, style: {} }],
            }],
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.path === "pageSettings.pageWidthMm"));
    assert.ok(result.issues.some((issue) => issue.path.endsWith(".left")));
    assert.ok(result.issues.some((issue) => issue.path.endsWith(".props.headers")));
});
test("normalizes v2 same-page groups and reports invalid group constraints", () => {
    const first = { ...createElement("text"), id: "text-1" };
    const second = { ...createElement("text"), id: "text-2" };
    const valid = serializeTemplateDocument({
        schemaVersion: 2,
        id: "grouped",
        pages: [{ id: "page-1", elements: [first, second], groups: [{ id: "group-1", name: "Address", elementIds: ["text-1", "text-2"] }] }],
    });
    const invalid = validateTemplateDocument({
        ...valid.document,
        pages: [{ ...valid.document.pages[0], groups: [{ id: "group-1", elementIds: ["text-1", "text-1"] }] }],
    });
    assert.equal(valid.valid, true);
    assert.deepEqual(valid.document.pages[0].groups[0].elementIds, ["text-1", "text-2"]);
    assert.equal(invalid.valid, false);
    assert.ok(invalid.issues.some((issue) => issue.path.endsWith("groups[0].elementIds")));
});
test("runtime data drafts are isolated per template and never enter template JSON", async () => {
    const memory = new Map();
    const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
    const drafts = createLocalRuntimeDataDraftRepository({ storage, key: "test-runtime-drafts" });
    const document = createBlankTemplateDocument({ id: "template-a" });
    await drafts.save("template-a", { customer: { name: "Ada" } });
    await drafts.save("template-b", { customer: { name: "Grace" } });
    assert.deepEqual(await drafts.get("template-a"), { customer: { name: "Ada" } });
    assert.deepEqual(await drafts.get("template-b"), { customer: { name: "Grace" } });
    assert.equal(JSON.stringify(serializeTemplateDocument(document).document).includes("Ada"), false);
    assert.equal(await drafts.delete("template-a"), true);
    assert.equal(await drafts.get("template-a"), null);
});
test("local repository surfaces corrupt browser storage", async () => {
    const storage = { getItem: () => "not-json", setItem: () => { } };
    const repository = createLocalTemplateRepository({ storage });
    await assert.rejects(() => repository.list(), /Unable to read local template storage/);
});
test("publish-ready payload only exposes runtime template fields", () => {
    const result = createPublishReadyTemplatePayload(createBlankTemplateDocument());
    assert.equal(result.valid, true);
    assert.deepEqual(Object.keys(result.payload).sort(), ["id", "meta", "pageSettings", "pages", "schemaVersion"]);
});
test("rejects a non-v2 document unit", () => {
    const result = validateTemplateDocument({
        schemaVersion: 2,
        meta: { name: "Legacy pixels", unit: "px" },
        pages: [{ id: "page-1", elements: [] }],
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.path === "meta.unit" && issue.severity === "error"));
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
test("reports unsupported reactive elements without throwing clone errors", () => {
    const template = reactive(createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "unsupported", type: "unsupported", props: {}, style: {} }] }],
    }));
    const result = validateTemplateDocument(template);
    assert.equal(result.valid, false);
    assert.match(result.issues.find((issue) => issue.path.endsWith(".type")).message, /Unsupported element type/);
});
