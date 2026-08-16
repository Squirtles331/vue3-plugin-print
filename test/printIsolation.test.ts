// @vitest-environment jsdom
import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { createPrintDocumentCss, printRuntimeDocument } from "../src/print-designer/runtime/print.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";
afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('iframe[title="Print template output"]').forEach((frame) => frame.remove());
});
test("print CSS uses the authored paper size with the full-sheet coordinate system", () => {
    const template = createBlankTemplateDocument({
        pageSettings: { paper: { widthMm: 100, heightMm: 150 } },
    });
    assert.match(createPrintDocumentCss(template), /@page \{ size: 100mm 150mm; margin: 0; \}/);
});
test("browser print prepares runtime-only output inside an isolated iframe", async () => {
    const originalAppendChild = document.body.appendChild.bind(document.body);
    let printFrame = null;
    const print = vi.fn();
    vi.spyOn(window, "setTimeout").mockReturnValue(0 as unknown as NodeJS.Timeout);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
        const appended = originalAppendChild(node);
        if (node instanceof HTMLIFrameElement) {
            printFrame = node;
            Object.defineProperty(node.contentWindow, "focus", { configurable: true, value: vi.fn() });
            Object.defineProperty(node.contentWindow, "print", { configurable: true, value: print });
        }
        return appended;
    });
    const template = createBlankTemplateDocument({
        pages: [{
                id: "page-1",
                title: "Page 1",
                elements: [createElement("text", { id: "print-title", pageId: "page-1", content: "Print-ready value" })],
            }],
    });
    await printRuntimeDocument({ document: template, runtimeData: {} });
    assert.ok(printFrame);
    assert.equal(print.mock.calls.length, 1);
    assert.ok(printFrame.contentDocument.querySelector(".runtime-document"));
    assert.match(printFrame.contentDocument.body.textContent, /Print-ready value/);
    assert.equal(printFrame.contentDocument.querySelector(".editor-root"), null);
    assert.equal(printFrame.contentDocument.querySelector(".canvas-object.is-selected"), null);
    assert.equal(printFrame.contentDocument.querySelector("[data-editor-control]"), null);
    printFrame.contentWindow.dispatchEvent(new Event("afterprint"));
    assert.equal(document.querySelector('iframe[title="Print template output"]'), null);
});
test("browser print waits for machine-readable output before opening the print dialog", async () => {
    const originalAppendChild = document.body.appendChild.bind(document.body);
    let printFrame = null;
    const print = vi.fn();
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
        const appended = originalAppendChild(node);
        if (node instanceof HTMLIFrameElement) {
            printFrame = node;
            Object.defineProperty(node.contentWindow, "focus", { configurable: true, value: vi.fn() });
            Object.defineProperty(node.contentWindow, "print", { configurable: true, value: print });
        }
        return appended;
    });
    const template = createBlankTemplateDocument({
        pages: [{
                id: "page-1",
                title: "Page 1",
                elements: [createElement("barcode", { id: "tracking-code", pageId: "page-1", variable: "trackingNumber", props: { format: "CODE128" } })],
            }],
    });
    await printRuntimeDocument({ document: template, runtimeData: { trackingNumber: "ABC-123" }, renderTimeoutMs: 1000 });
    const barcode = printFrame.contentDocument.querySelector(".runtime-barcode");
    assert.equal(print.mock.calls.length, 1);
    assert.equal(barcode.getAttribute("data-runtime-status"), "ready");
    assert.ok(barcode.querySelector("svg"));
    printFrame.contentWindow.dispatchEvent(new Event("afterprint"));
});
test("browser print fails clearly and cleans up when image assets time out", async () => {
    const template = createBlankTemplateDocument({
        pages: [{
                id: "page-1",
                title: "Page 1",
                elements: [createElement("image", { id: "logo", pageId: "page-1", variable: "logoUrl" })],
            }],
    });
    await assert.rejects(() => printRuntimeDocument({ document: template, runtimeData: { logoUrl: "https://assets.example.test/logo.png" }, assetTimeoutMs: 1 }), /Print assets did not finish loading/);
    assert.equal(document.querySelector('iframe[title="Print template output"]'), null);
});
