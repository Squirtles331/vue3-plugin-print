import assert from "node:assert/strict";
import { test } from "vitest";
import { reactive } from "vue";
import { applyConstrainedTableTransform, resolveDataPath, resolveRuntimeTemplate } from "../src/print-designer/runtime/dataResolver.js";
import { collectRuntimeBindingPaths, describeRuntimeBindingPaths } from "../src/print-designer/runtime/bindingPaths.js";
import { paginateRuntimeDocument } from "../src/print-designer/runtime/pagination.js";
import { validatePrintRuntime } from "../src/print-designer/runtime/preflight.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";
test("resolves nested runtime JSON paths", (): any => {
    assert.deepEqual(resolveDataPath({ customer: { name: "Ada" } }, "@customer.name"), { found: true, value: "Ada", path: "customer.name" });
    assert.equal(resolveDataPath({}, "@customer.name").found, false);
});
test("resolves bound elements and does not substitute sample rows for a missing binding", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "title", type: "text", x: 0, y: 0, width: 20, height: 8, variable: "customer.name", props: {}, style: {} },
                    { id: "items", type: "table", x: 0, y: 10, width: 80, height: 32, props: { dataVariable: "items", columns: [{ key: "name", title: "Name" }], sampleData: [{ name: "Sample row" }], headerHeight: 8, rowHeight: 8, autoPaginate: true }, style: {} },
                ] }],
    }) as any;
    const resolved = resolveRuntimeTemplate(document, { customer: { name: "Ada" } }) as any;
    assert.equal(resolved.document.pages[0].elements[0].runtime.value.value, "Ada");
    assert.equal(resolved.document.pages[0].elements[1].runtime.table.dataStatus, "missing");
    assert.deepEqual(resolved.document.pages[0].elements[1].runtime.table.rows, []);
    assert.match(resolved.issues[0].message, /Missing table data/);
    assert.equal(resolved.issues[0].binding, "items");
});
test("resolves a reactive template without mutating the source document", (): any => {
    const source = createBlankTemplateDocument({
        pages: [{
                id: "page-1",
                title: "Page 1",
                elements: [{ id: "title", type: "text", x: 0, y: 0, width: 20, height: 8, variable: "customer.name", props: {}, style: {} }],
            }],
    }) as any;
    const resolved = resolveRuntimeTemplate(reactive(source), { customer: { name: "Ada" } }) as any;
    assert.equal(resolved.document.pages[0].elements[0].runtime.value.value, "Ada");
    assert.equal(Object.hasOwn(source.pages[0].elements[0], "runtime"), false);
    assert.notEqual(resolved.document, source);
});
test("preserves explicit design preview rows when no runtime binding is configured", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], sampleData: [{ name: "Existing row" }] }, style: {} }] }],
    }) as any;
    const resolved = resolveRuntimeTemplate(document, {}) as any;
    assert.deepEqual(resolved.document.pages[0].elements[0].runtime.table.rows, [{ name: "Existing row" }]);
    assert.equal(resolved.document.pages[0].elements[0].runtime.table.dataStatus, "authored");
});
test("keeps empty labels structural and leaves unbound machine-readable values empty", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "code", type: "barcode", x: 0, y: 0, width: 40, height: 12, content: "", props: {}, style: {} },
                    { id: "labels", type: "multiLabel", x: 0, y: 16, width: 80, height: 30, props: { rows: 2, cols: 2, sampleData: [] }, style: {} },
                ] }],
    }) as any;
    const resolved = resolveRuntimeTemplate(document, {}) as any;
    assert.equal(resolved.document.pages[0].elements[0].runtime.value.status, "empty");
    assert.deepEqual(resolved.document.pages[0].elements[1].runtime.multiLabel.rows, []);
});
test("only executes declarative table transforms and reports invalid transforms", (): any => {
    const sorted = applyConstrainedTableTransform([{ value: "b" }, { value: "a" }], { type: "sort", by: "value" }) as any;
    const invalid = applyConstrainedTableTransform([], { type: "javascript" }) as any;
    assert.deepEqual(sorted.rows.map((row: any): any => row.value), ["a", "b"]);
    assert.equal(sorted.issues.length, 0);
    assert.equal(invalid.issues[0].severity, "error");
});
test("validates print runtime with the same blocking issues used by preview", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], dataVariable: "items", transform: { type: "javascript" } }, style: {} },
                ] }],
    }) as any;
    const preflight = validatePrintRuntime(document, { items: [{ name: "Ada" }] }) as any;
    const blockingIssue = preflight.issues.find((issue: any): any => issue.severity === "error") as any;
    assert.equal(preflight.valid, false);
    assert.match(blockingIssue.message, /supported declarative transform/);
});
test("runtime data cannot replace authored table columns or presentation", (): any => {
    const document = {
        schemaVersion: 2,
        pages: [{ id: "page-1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }], dataVariable: "items" }, style: { color: "#123456" } }] }],
    } as any;
    const resolved = resolveRuntimeTemplate(document, { runtimeColumns: [{ key: "unsafe", title: "Unsafe", width: 1 }], items: [{ product: { sku: "A-1" } }] }) as any;
    const table = resolved.document.pages[0].elements[0] as any;
    assert.deepEqual(table.runtime.table.columns, [{ key: "sku", valuePath: "product.sku", title: "SKU", width: 48 }]);
    assert.equal(table.style.color, "#123456");
});
test("paginates table rows deterministically and exposes page totals", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, showFooter: false, autoPaginate: true }, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [] } }, style: {} }] }],
    }) as any;
    const result = paginateRuntimeDocument(document) as any;
    assert.equal(result.pageCount, 2);
    assert.equal(result.pages[0].elements[0].runtime.table.rows.length, 3);
    assert.equal(result.pages[1].elements[0].runtime.table.rows.length, 1);
    assert.equal(result.pages[1].elements[0].runtime.table.allRows.length, 4);
    assert.equal(result.pages[1].runtime.pageNumber, 2);
});
test("table footer repeat is deterministic across generated pages", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [{ id: "items", type: "table", x: 0, y: 0, width: 80, height: 32, props: { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, footerHeight: 4, showFooter: true, autoPaginate: true, tfootRepeat: false }, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [{ name: "Total" }] } }, style: {} }] }],
    }) as any;
    const result = paginateRuntimeDocument(document) as any;
    assert.equal(result.pages.length, 2);
    assert.equal(result.pages[0].elements[0].runtime.table.footerRows.length, 1);
    assert.equal(result.pages[1].elements[0].runtime.table.footerRows.length, 0);
});
test("strict preflight blocks incomplete bindings and supports an explicit opt-out", (): any => {
    const document = createBlankTemplateDocument({
        pageSettings: { margin: { top: 0, right: 0, bottom: 0, left: 0 } },
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "order-number", type: "text", x: 10, y: 10, width: 50, height: 10, variable: "order.number", props: {}, style: {} },
                ] }],
    }) as any;
    const strict = validatePrintRuntime(document, {}) as any;
    const relaxed = validatePrintRuntime(document, {}, { allowIncomplete: true }) as any;
    assert.equal(strict.valid, false);
    assert.equal(strict.runtimeIssues.find((issue: any): any => issue.code === "missing-binding").severity, "error");
    assert.equal(relaxed.valid, true);
    assert.equal(relaxed.runtimeIssues.find((issue: any): any => issue.code === "missing-binding").severity, "warning");
});
test("strict preflight blocks printable elements outside the authored safe area", (): any => {
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "edge-title", type: "text", x: 0, y: 0, width: 20, height: 8, content: "At edge", props: {}, style: {} },
                ] }],
    }) as any;
    const preflight = validatePrintRuntime(document, {}) as any;
    assert.equal(preflight.valid, false);
    assert.equal(preflight.runtimeIssues.find((issue: any): any => issue.code === "outside-printable-area").elementId, "edge-title");
});
test("pagination keeps only marked elements and omits short table fragments", (): any => {
    const tableProps = { columns: [{ key: "name" }], headerHeight: 8, rowHeight: 8, showFooter: false, autoPaginate: true } as any;
    const document = createBlankTemplateDocument({
        pages: [{ id: "page-1", title: "Page 1", elements: [
                    { id: "long-table", type: "table", x: 10, y: 10, width: 80, height: 32, props: tableProps, runtime: { table: { rows: [{ name: "1" }, { name: "2" }, { name: "3" }, { name: "4" }], footerRows: [] } }, style: {} },
                    { id: "short-table", type: "table", x: 10, y: 50, width: 80, height: 32, props: tableProps, runtime: { table: { rows: [{ name: "only" }], footerRows: [] } }, style: {} },
                    { id: "first-page-note", type: "text", x: 10, y: 90, width: 40, height: 8, content: "First page", repeatPerPage: false, props: {}, style: {} },
                    { id: "repeated-header", type: "text", x: 10, y: 100, width: 40, height: 8, content: "Header", repeatPerPage: true, props: {}, style: {} },
                ] }],
    }) as any;
    const result = paginateRuntimeDocument(document) as any;
    const secondPageIds = result.pages[1].elements.map((element: any): any => element.id) as any;
    assert.equal(result.pages.length, 2);
    assert.deepEqual(secondPageIds, ["long-table", "repeated-header"]);
});
test("derives safe binding paths from runtime JSON", (): any => {
    const paths = collectRuntimeBindingPaths({ customer: { name: "Ada" }, items: [{ sku: "A-1" }] }) as any;
    assert.ok(paths.includes("customer"));
    assert.ok(paths.includes("customer.name"));
    assert.ok(paths.includes("items"));
    assert.ok(paths.includes("items[0].sku"));
});
test("describes scalar, object, and array paths for safe editor binding", (): any => {
    const fields = describeRuntimeBindingPaths({ customer: { name: "Ada" }, items: [{ sku: "A-1" }] }) as any;
    assert.equal(fields.find((field: any): any => field.path === "customer").kind, "object");
    assert.equal(fields.find((field: any): any => field.path === "customer.name").kind, "scalar");
    assert.equal(fields.find((field: any): any => field.path === "items").kind, "array");
});
