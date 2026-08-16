import assert from "node:assert/strict";
import { test } from "vitest";
import { ELEMENT_PROPERTY_MATRIX, PAGE_PROPERTY_MATRIX } from "../src/print-designer/core/propertyMatrix.js";
import { getElementPropertyCapabilities, validateElementProperty } from "../src/print-designer/core/propertyCapabilities.js";
import { formatTableValue, imageObjectPosition, machineCodeOptions, resolveRelativeRecordPath } from "../src/print-designer/runtime/propertySemantics.js";
import { createBlankTemplateDocument, serializeTemplateDocument } from "../src/print-designer/template/templateDocument.js";
test("property matrix covers the page and every supported element type", (): any => {
    assert.equal(PAGE_PROPERTY_MATRIX.paper.effect, "preview-and-print");
    ["text", "image", "table", "barcode", "qrcode", "pageNumber", "line", "rect", "circle", "multiLabel"].forEach((type: any): any => {
        assert.ok(ELEMENT_PROPERTY_MATRIX[type]);
        assert.ok(getElementPropertyCapabilities(type).fields.length > 0);
    });
    assert.equal(getElementPropertyCapabilities("barcode").fields.find((field: any): any => field.key === "margin").default, 0);
    assert.equal(getElementPropertyCapabilities("table").fields.find((field: any): any => field.source === "editorHints" && field.key === "rowCount").editorOnly, true);
});
test("normalizes v2 editor hints, mappings, and options without losing unknown safe props", (): any => {
    const source = {
        schemaVersion: 2,
        id: "property-parity",
        pages: [{ id: "page-1", elements: [
                    { id: "table", type: "table", editorHints: { omitRows: false, rowCount: 12 }, props: { columns: [{ key: "total", valuePath: "invoice.amount", title: "Total", width: "20", formatter: { type: "currency", symbol: "$" } }], vendorOption: "preserve" }, style: {} },
                    { id: "labels", type: "multiLabel", props: { rows: 1, cols: 1, primaryPath: "product.name", secondaryPath: "sku", cellPadding: 3 }, style: {} },
                ] }],
    } as any;
    const serialized = serializeTemplateDocument(source) as any;
    const table = serialized.document.pages[0].elements[0] as any;
    const labels = serialized.document.pages[0].elements[1] as any;
    assert.deepEqual(table.editorHints, { omitRows: false, rowCount: 12 });
    assert.equal(table.props.columns[0].valuePath, "invoice.amount");
    assert.deepEqual(table.props.columns[0].formatter, { type: "currency", symbol: "$" });
    assert.equal(table.props.vendorOption, "preserve");
    assert.deepEqual(labels.props.primaryPath, "product.name");
    assert.equal(labels.props.cellPadding, 3);
    assert.equal(serialized.valid, true, JSON.stringify(serialized.issues));
});
test("safe property semantics are deterministic and reject unsupported formatter values", (): any => {
    assert.equal(imageObjectPosition({}), "50% 50%");
    assert.deepEqual(machineCodeOptions({ margin: 100, textMargin: -2, textFontSize: 99 }), { margin: 40, textMargin: 0, textFontSize: 72 });
    assert.equal(formatTableValue(12.5, { type: "currency", symbol: "$", decimals: 2 }), "$12.50");
    assert.equal(formatTableValue("2026-08-09", { type: "date" }), "2026-08-09");
    assert.deepEqual(resolveRelativeRecordPath({ product: { name: "Tea" } }, "product.name"), { found: true, value: "Tea", path: "product.name" });
    assert.match(validateElementProperty("table", "props", "columns", [{ key: "amount", formatter: { type: "javascript" } }]), /formatter/);
    assert.match(validateElementProperty("table", "props", "columns", [{ key: "amount", valuePath: "items[bad]" }]), /safe dotted/);
});
test("runtime data never overrides a template's static geometry or style", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", elements: [{ id: "text", type: "text", x: 10, y: 12, width: 40, height: 8, variable: "title", style: { color: "#123456" }, props: {} }] }],
    }) as any;
    const serialized = serializeTemplateDocument(document) as any;
    const element = serialized.document.pages[0].elements[0] as any;
    assert.equal(element.x, 10);
    assert.equal(element.style.color, "#123456");
});
test("normalization keeps a circle circular and stores opacity in print style", (): any => {
    const source = createBlankTemplateDocument({
        pages: [{ id: "page-1", elements: [{ id: "circle", type: "circle", width: 30, height: 12, props: {}, style: { opacity: 0.4 } }] }],
    }) as any;
    const circle = serializeTemplateDocument(source).document.pages[0].elements[0] as any;
    assert.equal(circle.width, circle.height);
    assert.equal(circle.style.opacity, 0.4);
});
