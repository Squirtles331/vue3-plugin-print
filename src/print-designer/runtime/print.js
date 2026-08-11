import { createApp, nextTick } from "vue";
import RuntimeDocument from "./RuntimeDocument.vue";

const DEFAULT_ASSET_TIMEOUT_MS = 8_000;
const DEFAULT_RENDER_TIMEOUT_MS = 5_000;

function copyStyles(sourceDocument, targetDocument) {
  Array.from(sourceDocument.querySelectorAll("link[rel='stylesheet'], style")).forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

function waitForAssets(frameDocument, timeoutMs = DEFAULT_ASSET_TIMEOUT_MS) {
  const images = Array.from(frameDocument.images);
  const pending = Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );

  return Promise.race([
    pending,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`Print assets did not finish loading within ${timeoutMs}ms.`)), timeoutMs);
    }),
  ]);
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
    frameDocument.write("<!doctype html><html><head><meta charset='utf-8'><style>@page { margin: 0; } html, body { margin: 0; background: #fff; }</style></head><body><div id='print-root'></div></body></html>");
    frameDocument.close();
    copyStyles(window.document, frameDocument);

    app = createApp(RuntimeDocument, { document, runtimeData, mode: "print" });
    app.mount(frameDocument.getElementById("print-root"));
    await nextTick();
    await waitForMachineCodeRender(frameDocument, countMachineCodeElements(document), renderTimeoutMs);
    await waitForAssets(frameDocument, assetTimeoutMs);

    frame.contentWindow.addEventListener("afterprint", cleanUp, { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(cleanUp, 30000);
  } catch (error) {
    cleanUp();
    throw error;
  }
}
