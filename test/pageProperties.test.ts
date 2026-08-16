import assert from "node:assert/strict";
import { test } from "vitest";
import { createRuntimePageStyle, hasRuntimePrintMarks } from "../src/print-designer/runtime/pageStyle.js";
import { createBlankTemplateDocument, serializeTemplateDocument, validateTemplateDocument } from "../src/print-designer/template/templateDocument.js";
test("serializes canonical four-side page settings and print marks", (): any => {
    const document = createBlankTemplateDocument({
        pageSettings: {
            paper: { preset: "custom", widthMm: 120, heightMm: 80 },
            margin: { top: 4, right: 5, bottom: 6, left: 7 },
            background: "#fff7ed",
            printMarks: { visible: true },
        },
    }) as any;
    const result = serializeTemplateDocument(document) as any;
    const style = createRuntimePageStyle(result.document) as any;
    assert.equal(result.valid, true);
    assert.deepEqual(result.document.pageSettings.margin, { top: 4, right: 5, bottom: 6, left: 7 });
    assert.equal(style.width, "120mm");
    assert.equal(style.minHeight, "80mm");
    assert.equal(style.background, "#fff7ed");
    assert.equal(hasRuntimePrintMarks(result.document), true);
});
test("rejects margins with no printable area while retaining canonical settings", (): any => {
    const document = createBlankTemplateDocument() as any;
    document.pageSettings.margin = { top: 150, right: 110, bottom: 150, left: 110 };
    const result = validateTemplateDocument(document) as any;
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue: any): any => issue.path === "pageSettings.margin"));
});
