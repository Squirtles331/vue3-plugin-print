// @vitest-environment jsdom

import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";
import { createElement } from "../src/print-designer/core/elementFactory.js";
import { printRuntimeDocument } from "../src/print-designer/runtime/print.js";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.querySelectorAll('iframe[title="Print template output"]').forEach((frame) => frame.remove());
});

test("browser print prepares runtime-only output inside an isolated iframe", async () => {
  const originalAppendChild = document.body.appendChild.bind(document.body);
  let printFrame = null;
  const print = vi.fn();
  vi.spyOn(window, "setTimeout").mockReturnValue(0);
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
