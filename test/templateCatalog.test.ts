import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";
import { STARTER_TEMPLATE_CATALOG, instantiateStarterTemplate, listStarterTemplates } from "../src/print-designer/template/templateCatalog.js";
import { validateTemplateDocument } from "../src/print-designer/template/templateDocument.js";
test("starter catalog provides independent category coverage and asset-free thumbnails", (): any => {
    assert.deepEqual(new Set(STARTER_TEMPLATE_CATALOG.map((template: any): any => template.category)), new Set(["sales", "warehouse", "labels", "blank"]));
    assert.ok(STARTER_TEMPLATE_CATALOG.every((template: any): any => Array.isArray(template.thumbnail.blocks) && template.thumbnail.blocks.length));
    assert.ok(STARTER_TEMPLATE_CATALOG.every((template: any): any => !JSON.stringify(template).match(/https?:|data:image/i)));
    assert.equal(listStarterTemplates("labels").length, 1);
});
test("starter instantiation creates isolated valid documents with fresh IDs", (): any => {
    const first = instantiateStarterTemplate("order-summary") as any;
    const second = instantiateStarterTemplate("order-summary") as any;
    assert.equal(validateTemplateDocument(first).valid, true);
    assert.notEqual(first.id, second.id);
    assert.notEqual(first.pages[0].id, second.pages[0].id);
    assert.notEqual(first.pages[0].elements[0].id, second.pages[0].elements[0].id);
    first.pages[0].elements[0].content = "Changed";
    assert.equal(second.pages[0].elements[0].content, "ORDER SUMMARY");
});
test("catalog implementation has no known reference-product identifiers", (): any => {
    const source = readFileSync(new URL("../src/print-designer/template/templateCatalog.ts", import.meta.url), "utf8") as any;
    ["0ldfive", "vue-print-designer", "printdot", "agpl"].forEach((term: any): any => assert.equal(source.toLowerCase().includes(term), false));
});
