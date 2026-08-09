import assert from "node:assert/strict";
import { test } from "vitest";
import { ELEMENT_PROPERTY_MATRIX, PAGE_PROPERTY_MATRIX } from "../src/print-designer/core/propertyMatrix.js";
import { getElementPropertyCapabilities, validateElementProperty } from "../src/print-designer/core/propertyCapabilities.js";
import { formatTableValue, imageObjectPosition, machineCodeOptions, resolveRelativeRecordPath } from "../src/print-designer/runtime/propertySemantics.js";
import { createBlankTemplateDocument, migrateTemplateDocument, serializeTemplateDocument } from "../src/print-designer/template/templateDocument.js";

test("property matrix covers the page and every supported element type", () => {
  assert.equal(PAGE_PROPERTY_MATRIX.paper.effect, "preview-and-print");
  ["text", "image", "table", "barcode", "qrcode", "pageNumber", "line", "rect", "circle", "multiLabel"].forEach((type) => {
    assert.ok(ELEMENT_PROPERTY_MATRIX[type]);
    assert.ok(getElementPropertyCapabilities(type).fields.length > 0);
  });
  assert.equal(getElementPropertyCapabilities("barcode").fields.find((field) => field.key === "margin").default, 0);
  assert.equal(getElementPropertyCapabilities("table").fields.find((field) => field.source === "editorHints" && field.key === "rowCount").editorOnly, true);
});

test("normalizes editor hints, mappings, options, and legacy script warnings without losing unknown safe props", () => {
  const source = {
    schemaVersion: 1,
    id: "property-parity",
    pages: [{ id: "page-1", elements: [
      { id: "table", type: "table", props: { columns: [{ field: "total", valuePath: "invoice.amount", header: "Total", width: "20", format: { type: "currency", symbol: "$" } }], columnsVariable: "unsafeRuntimeColumns", designOmitRows: false, designRowCount: 12, customScript: "return rows", vendorOption: "preserve" }, style: {} },
      { id: "labels", type: "multiLabel", props: { rows: 1, cols: 1, primaryPath: "product.name", secondaryPath: "sku", cellPadding: 3 }, style: {} },
    ] }],
  };
  const migrated = migrateTemplateDocument(source);
  const table = migrated.document.pages[0].elements[0];
  const labels = migrated.document.pages[0].elements[1];
  const serialized = serializeTemplateDocument(source);

  assert.deepEqual(table.editorHints, { omitRows: false, rowCount: 12 });
  assert.equal(table.props.columns[0].valuePath, "invoice.amount");
  assert.deepEqual(table.props.columns[0].formatter, { type: "currency", symbol: "$" });
  assert.equal(table.props.vendorOption, "preserve");
  assert.equal("customScript" in table.props, false);
  assert.equal("columnsVariable" in table.props, false);
  assert.ok(migrated.issues.some((issue) => /Executable legacy/.test(issue.message)));
  assert.ok(migrated.issues.some((issue) => /Dynamic table column/.test(issue.message)));
  assert.deepEqual(labels.props.primaryPath, "product.name");
  assert.equal(labels.props.cellPadding, 3);
  assert.equal(serialized.valid, true, JSON.stringify(serialized.issues));
});

test("safe property semantics are deterministic and reject unsupported formatter values", () => {
  assert.equal(imageObjectPosition({}), "50% 50%");
  assert.deepEqual(machineCodeOptions({ margin: 100, textMargin: -2, textFontSize: 99 }), { margin: 40, textMargin: 0, textFontSize: 72 });
  assert.equal(formatTableValue(12.5, { type: "currency", symbol: "$", decimals: 2 }), "$12.50");
  assert.equal(formatTableValue("2026-08-09", { type: "date" }), "2026-08-09");
  assert.deepEqual(resolveRelativeRecordPath({ product: { name: "Tea" } }, "product.name"), { found: true, value: "Tea", path: "product.name" });
  assert.match(validateElementProperty("table", "props", "columns", [{ key: "amount", formatter: { type: "javascript" } }]), /formatter/);
  assert.match(validateElementProperty("table", "props", "columns", [{ key: "amount", valuePath: "items[bad]" }]), /safe dotted/);
});

test("runtime data never overrides a template's static geometry or style", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", elements: [{ id: "text", type: "text", x: 10, y: 12, width: 40, height: 8, variable: "title", style: { color: "#123456" }, props: {} }] }],
  });
  const serialized = serializeTemplateDocument(document);
  const element = serialized.document.pages[0].elements[0];
  assert.equal(element.x, 10);
  assert.equal(element.style.color, "#123456");
});

test("normalization keeps a circle circular and stores opacity in print style", () => {
  const source = createBlankTemplateDocument({
    pages: [{ id: "page-1", elements: [{ id: "circle", type: "circle", width: 30, height: 12, opacity: 0.4, props: {}, style: {} }] }],
  });
  const circle = serializeTemplateDocument(source).document.pages[0].elements[0];

  assert.equal(circle.width, circle.height);
  assert.equal(circle.style.opacity, 0.4);
  assert.equal("opacity" in circle, false);
});
