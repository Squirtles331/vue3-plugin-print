import assert from "node:assert/strict";
import { test } from "vitest";
import { reactive } from "vue";
import { applyConstrainedTableTransform, resolveDataPath, resolveRuntimeTemplate } from "../src/print-designer/runtime/dataResolver.js";
import { collectRuntimeBindingPaths, describeRuntimeBindingPaths } from "../src/print-designer/runtime/bindingPaths.js";
import { paginateRuntimeDocument } from "../src/print-designer/runtime/pagination.js";
import { validatePrintRuntime } from "../src/print-designer/runtime/preflight.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";

test("resolves nested runtime JSON paths", () => {
  assert.deepEqual(resolveDataPath({ customer: { name: "Ada" } }, "@customer.name"), { found: true, value: "Ada", path: "customer.name" });
  assert.equal(resolveDataPath({}, "@customer.name").found, false);
});

test("resolves bound elements and does not substitute sample rows for a missing binding", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "title", type: "text", x: 0, y: 0, width: 20, height: 8, variable: "customer.name", props: {}, style: {} },
      { id: "items", type: "table", x: 0, y: 10, width: 80, height: 32, props: { dataVariable: "items", columns: [{ key: "name", title: "Name" }], sampleData: [{ name: "Sample row" }], headerHeight: 8, rowHeight: 8, autoPaginate: true }, style: {} },
    ] }],
  });
  const resolved = resolveRuntimeTemplate(document, { customer: { name: "Ada" } });

  assert.equal(resolved.document.pages[0].elements[0].runtime.value.value, "Ada");
  assert.equal(resolved.document.pages[0].elements[1].runtime.table.dataStatus, "missing");
  assert.deepEqual(resolved.document.pages[0].elements[1].runtime.table.rows, []);
  assert.match(resolved.issues[0].message, /Missing table data/);
  assert.equal(resolved.issues[0].binding, "items");
});

test("resolves a reactive template without mutating the source document", () => {
  const source = createBlankTemplateDocument({
    pages: [{
      id: "page-1",
      title: "Page 1",
      elements: [{ id: "title", type: "text", x: 0, y: 0, width: 20, height: 8, variable: "customer.name", props: {}, style: {} }],
    }],
  });

  const resolved = resolveRuntimeTemplate(reactive(source), { customer: { name: "Ada" } });

  assert.equal(resolved.document.pages[0].elements[0].runtime.value.value, "Ada");
  assert.equal(Object.hasOwn(source.pages[0].elements[0], "runtime"), false);
  assert.notEqual(resolved.document, source);
});

test("preserves explicit design preview rows when no runtime binding is configured", () => {
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

test("validates print runtime with the same blocking issues used by preview", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], dataVariable: "items", transform: { type: "javascript" } }, style: {} },
    ] }],
  });
  const preflight = validatePrintRuntime(document, { items: [{ name: "Ada" }] });
  const blockingIssue = preflight.issues.find((issue) => issue.severity === "error");

  assert.equal(preflight.valid, false);
  assert.match(blockingIssue.message, /supported declarative transform/);
});

test("runtime data cannot replace authored table columns or presentation", () => {
  const document = {
    schemaVersion: 2,
    pages: [{ id: "page-1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }], dataVariable: "items" }, style: { color: "#123456" } }] }],
  };
  const resolved = resolveRuntimeTemplate(document, { runtimeColumns: [{ key: "unsafe", title: "Unsafe", width: 1 }], items: [{ product: { sku: "A-1" } }] });
  const table = resolved.document.pages[0].elements[0];

  assert.deepEqual(table.runtime.table.columns, [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }]);
  assert.equal(table.style.color, "#123456");
});

test("paginates table rows deterministically and exposes page totals", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, showFooter: false, autoPaginate: true }, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [] } }, style: {} }] }],
  });
  const result = paginateRuntimeDocument(document);

  assert.equal(result.pageCount, 2);
  assert.equal(result.pages[0].elements[0].runtime.table.rows.length, 3);
  assert.equal(result.pages[1].elements[0].runtime.table.rows.length, 1);
  assert.equal(result.pages[1].elements[0].runtime.table.allRows.length, 4);
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

test("strict preflight blocks incomplete bindings and supports an explicit opt-out", () => {
  const document = createBlankTemplateDocument({
    pageSettings: { margin: { top: 0, right: 0, bottom: 0, left: 0 } },
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "order-number", type: "text", x: 10, y: 10, width: 50, height: 10, variable: "order.number", props: {}, style: {} },
    ] }],
  });

  const strict = validatePrintRuntime(document, {});
  const relaxed = validatePrintRuntime(document, {}, { allowIncomplete: true });

  assert.equal(strict.valid, false);
  assert.equal(strict.runtimeIssues.find((issue) => issue.code === "missing-binding").severity, "error");
  assert.equal(relaxed.valid, true);
  assert.equal(relaxed.runtimeIssues.find((issue) => issue.code === "missing-binding").severity, "warning");
});

test("strict preflight blocks printable elements outside the authored safe area", () => {
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "edge-title", type: "text", x: 0, y: 0, width: 20, height: 8, content: "At edge", props: {}, style: {} },
    ] }],
  });
  const preflight = validatePrintRuntime(document, {});

  assert.equal(preflight.valid, false);
  assert.equal(preflight.runtimeIssues.find((issue) => issue.code === "outside-printable-area").elementId, "edge-title");
});

test("pagination keeps only marked elements and omits short table fragments", () => {
  const tableProps = { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, showFooter: false, autoPaginate: true };
  const document = createBlankTemplateDocument({
    pages: [{ id: "page-1", title: "Page 1", elements: [
      { id: "long-table", type: "table", x: 10, y: 10, width: 80, height: 32, props: tableProps, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [] } }, style: {} },
      { id: "short-table", type: "table", x: 10, y: 50, width: 80, height: 32, props: tableProps, runtime: { table: { rows: [{ name: "only" }], footerRows: [] } }, style: {} },
      { id: "first-page-note", type: "text", x: 10, y: 90, width: 40, height: 8, content: "First page", repeatPerPage: false, props: {}, style: {} },
      { id: "repeated-header", type: "text", x: 10, y: 100, width: 40, height: 8, content: "Header", repeatPerPage: true, props: {}, style: {} },
    ] }],
  });
  const result = paginateRuntimeDocument(document);
  const secondPageIds = result.pages[1].elements.map((element) => element.id);

  assert.equal(result.pages.length, 2);
  assert.deepEqual(secondPageIds, ["long-table", "repeated-header"]);
});

test("derives safe binding paths from runtime JSON", () => {
  const paths = collectRuntimeBindingPaths({ customer: { name: "Ada" }, items: [{ sku: "A-1" }] });

  assert.ok(paths.includes("customer"));
  assert.ok(paths.includes("customer.name"));
  assert.ok(paths.includes("items"));
  assert.ok(paths.includes("items[0].sku"));
});

test("describes scalar, object, and array paths for safe editor binding", () => {
  const fields = describeRuntimeBindingPaths({ customer: { name: "Ada" }, items: [{ sku: "A-1" }] });

  assert.equal(fields.find((field) => field.path === "customer").kind, "object");
  assert.equal(fields.find((field) => field.path === "customer.name").kind, "scalar");
  assert.equal(fields.find((field) => field.path === "items").kind, "array");
});
