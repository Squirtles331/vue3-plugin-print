import assert from "node:assert/strict";
import { test } from "vitest";
import { applyConstrainedTableTransform, resolveDataPath, resolveRuntimeTemplate } from "../src/print-designer/runtime/dataResolver.js";
import { paginateRuntimeDocument } from "../src/print-designer/runtime/pagination.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";

test("resolves nested runtime JSON paths", () => {
  assert.deepEqual(resolveDataPath({ customer: { name: "Ada" } }, "@customer.name"), { found: true, value: "Ada", path: "customer.name" });
  assert.equal(resolveDataPath({}, "@customer.name").found, false);
});

test("resolves bound elements and does not substitute sample rows for a missing binding", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "title", type: "text", x: 0, y: 0, width: 20, height: 8, variable: "customer.name", props: {}, style: {} },
      { id: "items", type: "table", x: 0, y: 10, width: 80, height: 32, props: { dataVariable: "items", columns: [{ key: "name", title: "Name" }], sampleData: [{ name: "Legacy sample" }], headerHeight: 8, rowHeight: 8, autoPaginate: true }, style: {} },
    ] }],
  });
  const resolved = resolveRuntimeTemplate(document, { customer: { name: "Ada" } });

  assert.equal(resolved.document.pages[0].elements[0].runtime.value.value, "Ada");
  assert.equal(resolved.document.pages[0].elements[1].runtime.table.dataStatus, "missing");
  assert.deepEqual(resolved.document.pages[0].elements[1].runtime.table.rows, []);
});

test("preserves explicit legacy preview rows when no runtime binding is configured", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], sampleData: [{ name: "Existing row" }] }, style: {} }] }],
  });
  const resolved = resolveRuntimeTemplate(document, {});

  assert.deepEqual(resolved.document.pages[0].elements[0].runtime.table.rows, [{ name: "Existing row" }]);
  assert.equal(resolved.document.pages[0].elements[0].runtime.table.dataStatus, "authored");
});

test("keeps empty labels structural and leaves unbound machine-readable values empty", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "code", type: "barcode", x: 0, y: 0, width: 40, height: 12, content: "", props: {}, style: {} },
      { id: "labels", type: "multiLabel", x: 0, y: 16, width: 80, height: 30, props: { rows: 2, cols: 2, sampleData: [] }, style: {} },
    ] }],
  });
  const resolved = resolveRuntimeTemplate(document, {});

  assert.equal(resolved.document.pages[0].elements[0].runtime.value.status, "empty");
  assert.deepEqual(resolved.document.pages[0].elements[1].runtime.multiLabel.rows, []);
});

test("only executes declarative table transforms and reports invalid transforms", () => {
  const sorted = applyConstrainedTableTransform([{ value: "b" }, { value: "a" }], { type: "sort", by: "value" });
  const invalid = applyConstrainedTableTransform([], { type: "javascript" });

  assert.deepEqual(sorted.rows.map((row) => row.value), ["a", "b"]);
  assert.equal(sorted.issues.length, 0);
  assert.equal(invalid.issues[0].severity, "error");
});

test("runtime data cannot replace authored table columns or presentation", () => {
  const document = {
    schemaVersion: 1,
    pages: [{ id: "page-1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }], columnsVariable: "runtimeColumns", dataVariable: "items" }, style: { color: "#123456" } }] }],
  };
  const resolved = resolveRuntimeTemplate(document, { runtimeColumns: [{ key: "unsafe", title: "Unsafe", width: 1 }], items: [{ product: { sku: "A-1" } }] });
  const table = resolved.document.pages[0].elements[0];

  assert.deepEqual(table.runtime.table.columns, [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }]);
  assert.equal(table.style.color, "#123456");
});

test("paginates table rows deterministically and exposes page totals", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, autoPaginate: true }, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [] } }, style: {} }] }],
  });
  const result = paginateRuntimeDocument(document);

  assert.equal(result.pageCount, 2);
  assert.equal(result.pages[0].elements[0].runtime.table.rows.length, 3);
  assert.equal(result.pages[1].elements[0].runtime.table.rows.length, 1);
  assert.equal(result.pages[1].runtime.pageNumber, 2);
});

test("table footer repeat is deterministic across generated pages", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, footerHeight: 4, showFooter: true, autoPaginate: true, tfootRepeat: false }, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [{ name: "Total" }] } }, style: {} }] }],
  });
  const result = paginateRuntimeDocument(document);

  assert.equal(result.pages.length, 2);
  assert.equal(result.pages[0].elements[0].runtime.table.footerRows.length, 1);
  assert.equal(result.pages[1].elements[0].runtime.table.footerRows.length, 0);
});
