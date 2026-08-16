export const PAGE_PROPERTY_MATRIX = Object.freeze({
  paper: { storage: 'pageSettings.paper', effect: 'preview-and-print' },
  margin: { storage: 'pageSettings.margin', effect: 'preview-and-print' },
  background: { storage: 'pageSettings.background', effect: 'preview-and-print' },
  printMarks: { storage: 'pageSettings.printMarks', effect: 'preview-and-print' },
  cornerMarks: { storage: 'pageSettings.cornerMarks', effect: 'editor-only' },
  headerLine: { storage: 'pageSettings.headerLine', effect: 'editor-only' },
  footerLine: { storage: 'pageSettings.footerLine', effect: 'editor-only' },
})
export const ELEMENT_PROPERTY_MATRIX = Object.freeze({
  common: Object.freeze(['geometry', 'visibility', 'printable', 'lock', 'stacking', 'boxStyle', 'typography']),
  text: Object.freeze(['content', 'autoHeight', 'whiteSpace', 'writingMode']),
  image: Object.freeze(['source', 'placeholder', 'objectFit', 'objectPosition', 'keepAspectRatio']),
  barcode: Object.freeze(['format', 'displayValue', 'margin', 'textMargin', 'textFontSize', 'foreground', 'background']),
  qrcode: Object.freeze(['eccLevel', 'margin', 'foreground', 'background']),
  pageNumber: Object.freeze(['format']),
  line: Object.freeze(['geometry', 'border']),
  rect: Object.freeze(['geometry', 'border', 'fill', 'cornerRadius']),
  circle: Object.freeze(['geometry', 'border', 'fill', 'aspectLock']),
  table: Object.freeze(['columns', 'formatters', 'header', 'footer', 'metrics', 'pagination', 'editorHints', 'transform']),
  multiLabel: Object.freeze(['grid', 'dataPath', 'fieldMapping', 'cellPadding']),
})
export function isEditorOnlyProperty(path) {
  return ['cornerMarks', 'headerLine', 'footerLine', 'editorHints'].some(part => String(path).includes(part))
}
