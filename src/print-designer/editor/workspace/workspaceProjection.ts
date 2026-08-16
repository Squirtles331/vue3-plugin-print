import { MM_TO_CSS_PX } from "../measurement.js";
function roundUnit(value: any): any {
    return Number.isFinite(value) ? +value.toFixed(4) : 0;
}
function createAxisProjection({ axisLengthPx, originPx, pixelsPerUnit, pageSizeMm }: any): any {
    const safePixelsPerUnit = pixelsPerUnit || 1 as any;
    const safeAxisLength = axisLengthPx || 0 as any;
    const safeOrigin = Number.isFinite(originPx) ? originPx : 0 as any;
    const screenToDocument = (screenPx: any): any => roundUnit((screenPx - safeOrigin) / safePixelsPerUnit) as any;
    const documentToScreen = (documentMm: any): any => safeOrigin + documentMm * safePixelsPerUnit as any;
    return {
        axisLengthPx: safeAxisLength,
        originPx: safeOrigin,
        pixelsPerUnit: safePixelsPerUnit,
        pageStartUnit: 0,
        pageEndUnit: pageSizeMm,
        visibleStartUnit: screenToDocument(0),
        visibleEndUnit: screenToDocument(safeAxisLength),
        screenToDocument,
        documentToScreen,
    };
}
export function getPixelsPerUnit(unit: any, zoom: any): any {
    const safeZoom = Number.isFinite(zoom) ? zoom : 1 as any;
    switch (unit) {
        case "mm":
        default:
            return MM_TO_CSS_PX * safeZoom;
    }
}
export function createWorkspaceProjection({ unit = "mm", zoom = 1, viewportWidth = 0, viewportHeight = 0, scrollLeft = 0, scrollTop = 0, pageOffsetLeft = 0, pageOffsetTop = 0, pageWidthMm = 0, pageHeightMm = 0, }: any): any {
    const pixelsPerUnit = getPixelsPerUnit(unit, zoom) as any;
    const xOriginPx = pageOffsetLeft - scrollLeft as any;
    const yOriginPx = pageOffsetTop - scrollTop as any;
    const x = createAxisProjection({
        axisLengthPx: viewportWidth,
        originPx: xOriginPx,
        pixelsPerUnit,
        pageSizeMm: pageWidthMm,
    }) as any;
    const y = createAxisProjection({
        axisLengthPx: viewportHeight,
        originPx: yOriginPx,
        pixelsPerUnit,
        pageSizeMm: pageHeightMm,
    }) as any;
    return {
        unit,
        zoom,
        pixelsPerUnit,
        pageOffsetLeft,
        pageOffsetTop,
        x,
        y,
        documentToScreenX: x.documentToScreen,
        documentToScreenY: y.documentToScreen,
        screenToDocumentX: x.screenToDocument,
        screenToDocumentY: y.screenToDocument,
    };
}
