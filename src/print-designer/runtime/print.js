import { createApp, nextTick } from "vue";
import RuntimeDocument from "./RuntimeDocument.vue";

const DEFAULT_ASSET_TIMEOUT_MS = 8_000;
const DEFAULT_RENDER_TIMEOUT_MS = 5_000;

function paperDimension(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? +numeric.toFixed(2) : fallback;
}

export function createPrintDocumentCss(template) {
  const paper = template?.pageSettings?.paper || {};
  const width = paperDimension(paper.widthMm, 210);
  const height = paperDimension(paper.heightMm, 297);
  return `@page { size: ${width}mm ${height}mm; margin: 0; } html, body { margin: 0; background: #fff; }`;
}

function copyStyles(sourceDocument, targetDocument) {
  Array.from(sourceDocument.querySelectorAll("link[rel='stylesheet'], style")).forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function waitForStyles(frameDocument, timeoutMs = DEFAULT_ASSET_TIMEOUT_MS) {
  const stylesheets = Array.from(frameDocument.querySelectorAll("link[rel='stylesheet']"));
  if (!stylesheets.length) {
    return Promise.resolve();
  }

  const pending = Promise.all(stylesheets.map((stylesheet) => {
    if (stylesheet.sheet) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      stylesheet.addEventListener("load", resolve, { once: true });
      stylesheet.addEventListener("error", () => reject(new Error(`Print stylesheet failed to load: ${stylesheet.href || "unknown"}.`)), { once: true });
    });
  }));

  return withTimeout(pending, timeoutMs, `Print stylesheets did not finish loading within ${timeoutMs}ms.`);
}

function waitForFonts(frameDocument, timeoutMs = DEFAULT_ASSET_TIMEOUT_MS) {
  const fonts = frameDocument.fonts;
  if (!fonts?.ready) {
    return Promise.resolve();
  }
  return withTimeout(Promise.resolve(fonts.ready), timeoutMs, `Print fonts did not finish loading within ${timeoutMs}ms.`);
}

function waitForAssets(frameDocument, timeoutMs = DEFAULT_ASSET_TIMEOUT_MS) {
  const images = Array.from(frameDocument.images);
  const pending = Promise.all(
    images.map((image) => {
      if (image.complete) {
        return image.naturalWidth > 0
          ? Promise.resolve()
          : Promise.reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`));
      }
      return new Promise((resolve, reject) => {
        image.addEventListener("load", () => {
          if (image.naturalWidth > 0) {
            resolve();
            return;
          }
          reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`));
        }, { once: true });
        image.addEventListener("error", () => reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`)), { once: true });
      });
    })
  );

  return withTimeout(pending, timeoutMs, `Print assets did not finish loading within ${timeoutMs}ms.`);
}

function countMachineCodeElements(document) {
  return (document?.pages || []).reduce((total, page) => {
    return total + (page.elements || []).filter((element) => {
      return ["barcode", "qrcode"].includes(element.type) && element.visible !== false && element.printable !== false;
    }).length;
  }, 0);
}

function waitForMachineCodeRender(frameDocument, expectedCount, timeoutMs = DEFAULT_RENDER_TIMEOUT_MS) {
  if (!expectedCount) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      const nodes = Array.from(frameDocument.querySelectorAll(".runtime-barcode, .runtime-qrcode"));
      const statuses = nodes.map((node) => node.getAttribute("data-runtime-status") || "pending");
      if (statuses.includes("error")) {
        reject(new Error("Machine-readable code rendering failed."));
        return;
      }
      if (nodes.length >= expectedCount && statuses.every((status) => status !== "pending")) {
        resolve();
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Print output did not finish rendering machine-readable codes within ${timeoutMs}ms.`));
        return;
      }
      window.setTimeout(check, 16);
    };

    check();
  });
}

export async function printRuntimeDocument({ document, runtimeData = {}, assetTimeoutMs = DEFAULT_ASSET_TIMEOUT_MS, renderTimeoutMs = DEFAULT_RENDER_TIMEOUT_MS }) {
  if (typeof window === "undefined" || !document) {
    throw new Error("Browser printing requires a template document.");
  }

  const frame = window.document.createElement("iframe");
  frame.setAttribute("title", "Print template output");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  window.document.body.appendChild(frame);
  let app = null;
  let cleanedUp = false;
  const cleanUp = () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    app?.unmount();
    frame.remove();
  };

  try {
    const frameDocument = frame.contentDocument;
    frameDocument.open();
    frameDocument.write(`<!doctype html><html><head><meta charset='utf-8'><style>${createPrintDocumentCss(document)}</style></head><body><div id='print-root'></div></body></html>`);
    frameDocument.close();
    copyStyles(window.document, frameDocument);

    app = createApp(RuntimeDocument, { document, runtimeData, mode: "print" });
    app.mount(frameDocument.getElementById("print-root"));
    await nextTick();
    await waitForMachineCodeRender(frameDocument, countMachineCodeElements(document), renderTimeoutMs);
    await Promise.all([
      waitForStyles(frameDocument, assetTimeoutMs),
      waitForFonts(frameDocument, assetTimeoutMs),
      waitForAssets(frameDocument, assetTimeoutMs),
    ]);

    frame.contentWindow.addEventListener("afterprint", cleanUp, { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(cleanUp, 30000);
  } catch (error) {
    cleanUp();
    throw error;
  }
}
