import { createApp, nextTick } from "vue";
import RuntimeDocument from "./RuntimeDocument.vue";

function copyStyles(sourceDocument, targetDocument) {
  Array.from(sourceDocument.querySelectorAll("link[rel='stylesheet'], style")).forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

function waitForAssets(frameDocument) {
  const images = Array.from(frameDocument.images);
  return Promise.all(
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
}

export async function printRuntimeDocument({ document, runtimeData = {} }) {
  if (typeof window === "undefined" || !document) {
    throw new Error("Browser printing requires a template document.");
  }

  const frame = window.document.createElement("iframe");
  frame.setAttribute("title", "Print template output");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  window.document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  frameDocument.open();
  frameDocument.write("<!doctype html><html><head><meta charset='utf-8'><style>@page { margin: 0; } html, body { margin: 0; background: #fff; }</style></head><body><div id='print-root'></div></body></html>");
  frameDocument.close();
  copyStyles(window.document, frameDocument);

  const app = createApp(RuntimeDocument, { document, runtimeData, mode: "print" });
  app.mount(frameDocument.getElementById("print-root"));
  await nextTick();
  await waitForAssets(frameDocument);

  let cleanedUp = false;
  const cleanUp = () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    app.unmount();
    frame.remove();
  };
  frame.contentWindow.addEventListener("afterprint", cleanUp, { once: true });
  frame.contentWindow.focus();
  frame.contentWindow.print();
  window.setTimeout(cleanUp, 30000);
}
