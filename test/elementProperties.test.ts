import assert from "node:assert/strict";
import { createPinia, setActivePinia } from "pinia";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { validateElementProperty } from "../src/print-designer/core/propertyCapabilities.js";
import { useEditorDocumentStore } from "../src/print-designer/editor/stores/documentStore.js";
import { resolveRuntimeTemplate } from "../src/print-designer/runtime/dataResolver.js";
import { createBlankTemplateDocument, serializeTemplateDocument } from "../src/print-designer/template/templateDocument.js";
test("locked elements reject property, order, and delete mutations until explicitly unlocked", (): any => {
    setActivePinia(createPinia());
    const store = useEditorDocumentStore() as any;
    const element = createElement("text", { id: "locked-text", pageId: "page-1", locked: true, content: "Locked" }) as any;
    store.loadTemplateDocument(createBlankTemplateDocument({ pages: [{ id: "page-1", title: "Page 1", elements: [element] }] }));
    assert.equal(store.updateObjectProps("locked-text", { content: "Changed" }), false);
    assert.equal(store.reorderObject("locked-text", "bringToFront"), false);
    assert.equal(store.removeObject("locked-text"), false);
    assert.equal(store.updateObjectProps("locked-text", { locked: false }), true);
    assert.equal(store.updateObjectProps("locked-text", { content: "Changed" }), true);
    assert.equal(store.objectsById["locked-text"].content, "Changed");
});
test("all supported data-aware elements resolve runtime values and preserve structural elements", (): any => {
    const pageId = "page-1" as any;
    const elements = [
        createElement("text", { id: "text", pageId, variable: "text" }),
        createElement("image", { id: "image", pageId, variable: "image" }),
        createElement("barcode", { id: "barcode", pageId, variable: "code", props: { format: "CODE128", displayValue: true } }),
        createElement("qrcode", { id: "qrcode", pageId, variable: "code", props: { eccLevel: "H" } }),
        createElement("table", { id: "table", pageId, props: { columns: [{ key: "sku", title: "SKU" }], dataVariable: "items", transform: { type: "sort", by: "sku" }, sampleData: [], footerData: [] } }),
        createElement("multiLabel", { id: "labels", pageId, props: { rows: 1, cols: 2, dataVariable: "labels", direction: "column", sampleData: [] } }),
        createElement("pageNumber", { id: "page", pageId, props: { format: "1/N" } }),
        createElement("line", { id: "line", pageId }),
        createElement("rect", { id: "rect", pageId }),
        createElement("circle", { id: "circle", pageId }),
    ] as any;
    const document = createBlankTemplateDocument({ pages: [{ id: pageId, title: "Page 1", elements }] }) as any;
    const resolved = resolveRuntimeTemplate(document, { text: "Hello", image: "https://example.test/logo.png", code: "ABC-123", items: [{ sku: "B" }, { sku: "A" }], labels: [{ title: "First" }, { title: "Second" }] }) as any;
    const byId = Object.fromEntries(resolved.document.pages[0].elements.map((element: any): any => [element.id, element])) as any;
    assert.equal(byId.text.runtime.value.value, "Hello");
    assert.equal(byId.image.runtime.value.value, "https://example.test/logo.png");
    assert.equal(byId.barcode.runtime.value.value, "ABC-123");
    assert.equal(byId.qrcode.runtime.value.value, "ABC-123");
    assert.deepEqual(byId.table.runtime.table.rows.map((row: any): any => row.sku), ["A", "B"]);
    assert.equal(byId.labels.runtime.multiLabel.rows.length, 2);
    assert.equal(byId.line.runtime && Object.keys(byId.line.runtime).length, 0);
    const serialized = serializeTemplateDocument(document) as any;
    assert.equal(serialized.valid, true, JSON.stringify(serialized.issues));
});
test("property capability validation rejects invalid machine-code, binding, table, and label values", (): any => {
    assert.match(validateElementProperty("barcode", "props", "format", "UNKNOWN"), /format/);
    assert.match(validateElementProperty("image", "root", "variable", "bad path!"), /binding/);
    assert.match(validateElementProperty("table", "props", "columns", []), /column/);
    assert.match(validateElementProperty("multiLabel", "props", "rows", 0), /rows/);
    assert.equal(validateElementProperty("qrcode", "props", "eccLevel", "H"), null);
});
test("unresolved bindings stay explicit and removed table scripts are rejected", (): any => {
    const pageId = "page-1" as any;
    const document = createBlankTemplateDocument({
        pages: [{ id: pageId, title: "Page 1", elements: [
                    createElement("image", { id: "image", pageId, variable: "missing.image" }),
                    createElement("barcode", { id: "barcode", pageId, variable: "missing.code" }),
                    createElement("qrcode", { id: "qrcode", pageId, variable: "missing.code" }),
                    createElement("table", { id: "table", pageId, props: { columns: [{ key: "id", title: "ID" }], dataVariable: "missing.rows", sampleData: [], footerData: [] } }),
                    createElement("multiLabel", { id: "labels", pageId, props: { rows: 1, cols: 1, dataVariable: "missing.labels", sampleData: [] } }),
                ] }],
    }) as any;
    document.pages[0].elements.find((element: any): any => element.id === "table").props.customScript = "throw new Error('must not run')";
    const resolved = resolveRuntimeTemplate(document, {}) as any;
    const byId = Object.fromEntries(resolved.document.pages[0].elements.map((element: any): any => [element.id, element])) as any;
    const serialized = serializeTemplateDocument(document) as any;
    assert.equal(byId.image.runtime.value.status, "missing");
    assert.equal(byId.barcode.runtime.value.status, "missing");
    assert.equal(byId.qrcode.runtime.value.status, "missing");
    assert.equal(byId.table.runtime.table.dataStatus, "missing");
    assert.equal(byId.labels.runtime.multiLabel.status, "missing");
    assert.ok(resolved.issues.some((issue: any): any => /Missing binding value/.test(issue.message)));
    assert.ok(resolved.issues.some((issue: any): any => /Missing table data/.test(issue.message)));
    assert.ok(resolved.issues.some((issue: any): any => /disabled/.test(issue.message)));
    assert.equal(serialized.valid, false);
    assert.ok(serialized.issues.some((issue: any): any => issue.path.endsWith("props.customScript")));
});
