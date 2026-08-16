import { createApp, nextTick } from "vue";
import RuntimeDocument from "./RuntimeDocument.vue";
const DEFAULT_ASSET_TIMEOUT_MS = 8000 as any;
const DEFAULT_RENDER_TIMEOUT_MS = 5000 as any;
function paperDimension(value: any, fallback: any): any {
    const numeric = Number(value) as any;
    return Number.isFinite(numeric) && numeric > 0 ? +numeric.toFixed(2) : fallback;
}
export function createPrintDocumentCss(template: any): any {
    const paper = template?.pageSettings?.paper || {} as any;
    const width = paperDimension(paper.widthMm, 210) as any;
    const height = paperDimension(paper.heightMm, 297) as any;
    return `@page { size: ${width}mm ${height}mm; margin: 0; } html, body { margin: 0; background: #fff; }`;
}
function copyStyles(sourceDocument: any, targetDocument: any): any {
    Array.from(sourceDocument.querySelectorAll("link[rel='stylesheet'], style")).forEach((node: any): any => {
        targetDocument.head.appendChild(node.cloneNode(true));
    });
}
function withTimeout(promise: any, timeoutMs: any, message: any): any {
    return Promise.race([
        promise,
        new Promise((_: any, reject: any): any => {
            window.setTimeout((): any => reject(new Error(message)), timeoutMs);
        }),
    ]);
}
function waitForStyles(frameDocument: any, timeoutMs: any = DEFAULT_ASSET_TIMEOUT_MS): any {
    const stylesheets = Array.from(frameDocument.querySelectorAll("link[rel='stylesheet']")) as any;
    if (!stylesheets.length) {
        return Promise.resolve();
    }
    const pending = Promise.all(stylesheets.map((stylesheet: any): any => {
        if (stylesheet.sheet) {
            return Promise.resolve();
        }
        return new Promise((resolve: any, reject: any): any => {
            stylesheet.addEventListener("load", resolve, { once: true });
            stylesheet.addEventListener("error", (): any => reject(new Error(`Print stylesheet failed to load: ${stylesheet.href || "unknown"}.`)), { once: true });
        });
    })) as any;
    return withTimeout(pending, timeoutMs, `Print stylesheets did not finish loading within ${timeoutMs}ms.`);
}
function waitForFonts(frameDocument: any, timeoutMs: any = DEFAULT_ASSET_TIMEOUT_MS): any {
    const fonts = frameDocument.fonts as any;
    if (!fonts?.ready) {
        return Promise.resolve();
    }
    return withTimeout(Promise.resolve(fonts.ready), timeoutMs, `Print fonts did not finish loading within ${timeoutMs}ms.`);
}
function waitForAssets(frameDocument: any, timeoutMs: any = DEFAULT_ASSET_TIMEOUT_MS): any {
    const images = Array.from(frameDocument.images) as any;
    const pending = Promise.all(images.map((image: any): any => {
        if (image.complete) {
            return image.naturalWidth > 0
                ? Promise.resolve()
                : Promise.reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`));
        }
        return new Promise((resolve: any, reject: any): any => {
            image.addEventListener("load", (): any => {
                if (image.naturalWidth > 0) {
                    resolve();
                    return;
                }
                reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`));
            }, { once: true });
            image.addEventListener("error", (): any => reject(new Error(`Print image asset failed to load: ${image.currentSrc || image.src || "unknown"}.`)), { once: true });
        });
    })) as any;
    return withTimeout(pending, timeoutMs, `Print assets did not finish loading within ${timeoutMs}ms.`);
}
function countMachineCodeElements(document: any): any {
    return (document?.pages || []).reduce((total: any, page: any): any => {
        return total + (page.elements || []).filter((element: any): any => {
            return ["barcode", "qrcode"].includes(element.type) && element.visible !== false && element.printable !== false;
        }).length;
    }, 0);
}
function waitForMachineCodeRender(frameDocument: any, expectedCount: any, timeoutMs: any = DEFAULT_RENDER_TIMEOUT_MS): any {
    if (!expectedCount) {
        return Promise.resolve();
    }
    return new Promise((resolve: any, reject: any): any => {
        const startedAt = Date.now() as any;
        const check = (): any => {
            const nodes = Array.from(frameDocument.querySelectorAll(".runtime-barcode, .runtime-qrcode")) as any;
            const statuses = nodes.map((node: any): any => node.getAttribute("data-runtime-status") || "pending") as any;
            if (statuses.includes("error")) {
                reject(new Error("Machine-readable code rendering failed."));
                return;
            }
            if (nodes.length >= expectedCount && statuses.every((status: any): any => status !== "pending")) {
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
export async function printRuntimeDocument({ document, runtimeData = {}, assetTimeoutMs = DEFAULT_ASSET_TIMEOUT_MS, renderTimeoutMs = DEFAULT_RENDER_TIMEOUT_MS }: any): Promise<any> {
    if (typeof window === "undefined" || !document) {
        throw new Error("Browser printing requires a template document.");
    }
    const frame = window.document.createElement("iframe") as any;
    frame.setAttribute("title", "Print template output");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    window.document.body.appendChild(frame);
    let app = null as any;
    let cleanedUp = false as any;
    const cleanUp = (): any => {
        if (cleanedUp) {
            return;
        }
        cleanedUp = true;
        app?.unmount();
        frame.remove();
    };
    try {
        const frameDocument = frame.contentDocument as any;
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
    }
    catch (error: any) {
        cleanUp();
        throw error;
    }
}
