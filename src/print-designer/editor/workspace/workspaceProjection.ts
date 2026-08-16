import { MM_TO_CSS_PX } from '../measurement.js'

function roundUnit(value) {
  return Number.isFinite(value) ? +value.toFixed(4) : 0
}
function createAxisProjection({ axisLengthPx, originPx, pixelsPerUnit, pageSizeMm }) {
  const safePixelsPerUnit = pixelsPerUnit || 1
  const safeAxisLength = axisLengthPx || 0
  const safeOrigin = Number.isFinite(originPx) ? originPx : 0
  const screenToDocument = screenPx => roundUnit((screenPx - safeOrigin) / safePixelsPerUnit)
  const documentToScreen = documentMm => safeOrigin + documentMm * safePixelsPerUnit
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
  }
}
export function getPixelsPerUnit(unit, zoom) {
  const safeZoom = Number.isFinite(zoom) ? zoom : 1
  switch (unit) {
    case 'mm':
    default:
      return MM_TO_CSS_PX * safeZoom
  }
}
export function createWorkspaceProjection({ unit = 'mm', zoom = 1, viewportWidth = 0, viewportHeight = 0, scrollLeft = 0, scrollTop = 0, pageOffsetLeft = 0, pageOffsetTop = 0, pageWidthMm = 0, pageHeightMm = 0 }) {
  const pixelsPerUnit = getPixelsPerUnit(unit, zoom)
  const xOriginPx = pageOffsetLeft - scrollLeft
  const yOriginPx = pageOffsetTop - scrollTop
  const x = createAxisProjection({
    axisLengthPx: viewportWidth,
    originPx: xOriginPx,
    pixelsPerUnit,
    pageSizeMm: pageWidthMm,
  })
  const y = createAxisProjection({
    axisLengthPx: viewportHeight,
    originPx: yOriginPx,
    pixelsPerUnit,
    pageSizeMm: pageHeightMm,
  })
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
  }
}
