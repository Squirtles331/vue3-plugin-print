import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";
import { TEMPLATE_INTERCHANGE_FORMAT, createTemplateInterchange, parseTemplateInterchange, stringifyTemplateInterchange } from "../src/print-designer/template/templateInterchange.js";
test("exports a normalized interchange envelope without editor state", (): any => {
    const document = createBlankTemplateDocument({ pages: [{ id: "page-1", title: "Page 1", isCurrent: true, elements: [{ ...createElement("text"), selected: true }] }] }) as any;
    const result = createTemplateInterchange(document) as any;
    assert.equal(result.valid, true);
    assert.equal(result.envelope.format, TEMPLATE_INTERCHANGE_FORMAT);
    assert.equal(result.envelope.template.pages[0].isCurrent, undefined);
    assert.equal(result.envelope.template.pages[0].elements[0].selected, undefined);
});
test("imports only supported valid interchange and detaches its document ID", (): any => {
    const document = createBlankTemplateDocument({ meta: { name: "Source" } }) as any;
    const exported = stringifyTemplateInterchange(document) as any;
    const imported = parseTemplateInterchange(exported.json) as any;
    assert.ok(imported.document);
    assert.notEqual(imported.document.id, document.id);
    assert.equal(imported.document.meta.name, "Source");
    assert.equal(parseTemplateInterchange("not json").document, null);
    assert.equal(parseTemplateInterchange(JSON.stringify({ format: "other", formatVersion: 1 })).document, null);
});
test("rejects v1 interchange documents", (): any => {
    const legacy = {
        format: TEMPLATE_INTERCHANGE_FORMAT,
        formatVersion: 1,
        template: {
            schemaVersion: 1,
            id: "legacy-import",
            meta: { name: "Legacy import", unit: "mm" },
            pages: [{ id: "page-1", elements: [] }],
        },
    } as any;
    const imported = parseTemplateInterchange(JSON.stringify(legacy)) as any;
    assert.equal(imported.document, null);
    assert.match(imported.issues[0].message, /version 1 is not supported/);
});
