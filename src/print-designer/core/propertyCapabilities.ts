import { BARCODE_FORMATS, PAGE_NUMBER_FORMATS, QRCODE_ECC_LEVELS } from './constants.js'

const COMMON_FIELDS = [
  { source: 'root', key: 'name', type: 'string', maxLength: 160, runtimeEffect: 'editor-label' },
  { source: 'root', key: 'x', type: 'number', min: -1000, max: 1000, runtimeEffect: 'position' },
  { source: 'root', key: 'y', type: 'number', min: -1000, max: 1500, runtimeEffect: 'position' },
  { source: 'root', key: 'width', type: 'number', min: 0.1, max: 1000, runtimeEffect: 'size' },
  { source: 'root', key: 'height', type: 'number', min: 0.1, max: 1500, runtimeEffect: 'size' },
  { source: 'root', key: 'rotation', type: 'number', min: -360, max: 360, runtimeEffect: 'rotation' },
  { source: 'root', key: 'visible', type: 'boolean', runtimeEffect: 'visibility' },
  { source: 'root', key: 'locked', type: 'boolean', runtimeEffect: 'editor-protection' },
  { source: 'root', key: 'printable', type: 'boolean', runtimeEffect: 'print-visibility' },
  { source: 'root', key: 'repeatPerPage', type: 'boolean', runtimeEffect: 'pagination' },
  { source: 'root', key: 'zIndex', type: 'number', min: 0, max: 9999, runtimeEffect: 'stacking' },
  { source: 'root', key: 'variable', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
  { source: 'style', key: 'opacity', type: 'number', min: 0, max: 1, runtimeEffect: 'opacity' },
  { source: 'style', key: 'backgroundColor', type: 'color', runtimeEffect: 'background' },
  { source: 'style', key: 'borderWidth', type: 'number', min: 0, max: 100, runtimeEffect: 'border' },
  { source: 'style', key: 'borderStyle', type: 'enum', values: ['solid', 'dashed', 'dotted'], runtimeEffect: 'border' },
  { source: 'style', key: 'borderColor', type: 'color', runtimeEffect: 'border' },
  { source: 'style', key: 'borderRadius', type: 'number', min: 0, max: 999, runtimeEffect: 'border' },
  { source: 'style', key: 'padding', type: 'number', min: 0, max: 100, runtimeEffect: 'spacing' },
]
const TEXT_STYLE_FIELDS = [
  { source: 'style', key: 'fontFamily', type: 'string', maxLength: 200, runtimeEffect: 'typography' },
  { source: 'style', key: 'fontSize', type: 'number', min: 1, max: 240, runtimeEffect: 'typography' },
  { source: 'style', key: 'fontWeight', type: 'enum', values: ['normal', 'bold'], runtimeEffect: 'typography' },
  { source: 'style', key: 'fontStyle', type: 'enum', values: ['normal', 'italic'], runtimeEffect: 'typography' },
  { source: 'style', key: 'textDecoration', type: 'enum', values: ['none', 'underline', 'line-through'], runtimeEffect: 'typography' },
  { source: 'style', key: 'color', type: 'color', runtimeEffect: 'typography' },
  { source: 'style', key: 'textAlign', type: 'enum', values: ['left', 'center', 'right'], runtimeEffect: 'typography' },
  { source: 'style', key: 'verticalAlign', type: 'enum', values: ['top', 'middle', 'bottom'], runtimeEffect: 'typography' },
  { source: 'style', key: 'lineHeight', type: 'number', min: 0.5, max: 5, runtimeEffect: 'typography' },
  { source: 'style', key: 'letterSpacing', type: 'number', min: -20, max: 100, runtimeEffect: 'typography' },
]
const TEXT_FIELDS = [
  { source: 'root', key: 'content', type: 'string', maxLength: 100000, runtimeEffect: 'content' },
  { source: 'props', key: 'autoHeight', type: 'boolean', runtimeEffect: 'layout' },
  { source: 'props', key: 'whiteSpace', type: 'enum', values: ['pre-wrap', 'nowrap', 'pre'], runtimeEffect: 'typography' },
  { source: 'props', key: 'writingMode', type: 'enum', values: ['horizontal-tb', 'vertical-rl'], runtimeEffect: 'typography' },
]
const CAPABILITY_DEFAULTS = Object.freeze({
  root: { visible: true, locked: false, printable: true, repeatPerPage: false, rotation: 0, zIndex: 0, variable: '' },
  style: { opacity: 1, backgroundColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderColor: '#000000', borderRadius: 0, padding: 0, fontFamily: '', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.4, letterSpacing: 0, objectFit: 'contain', objectPosition: '50% 50%' },
  props: { autoHeight: false, whiteSpace: 'pre-wrap', writingMode: 'horizontal-tb', keepAspectRatio: true, displayValue: true, margin: 0, textMargin: 2, textFontSize: 10, eccLevel: 'M', rows: 5, cols: 3, gapX: 12, gapY: 12, direction: 'row', cellPadding: 2, primaryPath: 'title', secondaryPath: 'code', tertiaryPath: '' },
  editorHints: { omitRows: true, rowCount: 10 },
})
function fields(...groups) {
  return groups.flat()
}
export const ELEMENT_PROPERTY_CAPABILITIES = Object.freeze({
  text: { fields: fields(COMMON_FIELDS, TEXT_STYLE_FIELDS, TEXT_FIELDS) },
  image: {
    fields: fields(COMMON_FIELDS, [
      { source: 'props', key: 'src', type: 'image-source', maxLength: 2 * 1024 * 1024, runtimeEffect: 'image' },
      { source: 'props', key: 'placeholder', type: 'string', maxLength: 512, runtimeEffect: 'unresolved-state' },
      { source: 'props', key: 'keepAspectRatio', type: 'boolean', runtimeEffect: 'image' },
      { source: 'style', key: 'objectFit', type: 'enum', values: ['contain', 'cover', 'fill', 'none'], runtimeEffect: 'image' },
      { source: 'style', key: 'objectPosition', type: 'string', maxLength: 64, runtimeEffect: 'image' },
    ]),
  },
  table: {
    fields: fields(COMMON_FIELDS, TEXT_STYLE_FIELDS, [
      { source: 'props', key: 'dataVariable', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'footerDataVariable', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'columns', type: 'table-columns', runtimeEffect: 'table' },
      { source: 'props', key: 'sampleData', type: 'collection', runtimeEffect: 'editor-preview' },
      { source: 'props', key: 'footerData', type: 'collection', runtimeEffect: 'table' },
      { source: 'props', key: 'showHeader', type: 'boolean', runtimeEffect: 'table' },
      { source: 'props', key: 'showFooter', type: 'boolean', runtimeEffect: 'table' },
      { source: 'props', key: 'autoPaginate', type: 'boolean', runtimeEffect: 'pagination' },
      { source: 'props', key: 'tfootRepeat', type: 'boolean', runtimeEffect: 'pagination' },
      { source: 'props', key: 'headerHeight', type: 'number', min: 1, max: 200, runtimeEffect: 'table' },
      { source: 'props', key: 'rowHeight', type: 'number', min: 1, max: 200, runtimeEffect: 'table' },
      { source: 'props', key: 'footerHeight', type: 'number', min: 1, max: 200, runtimeEffect: 'table' },
      { source: 'props', key: 'rowHeights', type: 'table-row-heights', runtimeEffect: 'table' },
      { source: 'editorHints', key: 'omitRows', type: 'boolean', editorOnly: true, runtimeEffect: 'editor-preview' },
      { source: 'editorHints', key: 'rowCount', type: 'number', min: 1, max: 500, editorOnly: true, runtimeEffect: 'editor-preview' },
      { source: 'props', key: 'transform', type: 'table-transform', runtimeEffect: 'runtime-data' },
      { source: 'style', key: 'headerBackgroundColor', type: 'color', runtimeEffect: 'table' },
      { source: 'style', key: 'headerColor', type: 'color', runtimeEffect: 'table' },
      { source: 'style', key: 'headerFontSize', type: 'number', min: 1, max: 240, runtimeEffect: 'table' },
      { source: 'style', key: 'headerTextAlign', type: 'enum', values: ['left', 'center', 'right'], runtimeEffect: 'table' },
      { source: 'style', key: 'footerBackgroundColor', type: 'color', runtimeEffect: 'table' },
      { source: 'style', key: 'footerColor', type: 'color', runtimeEffect: 'table' },
      { source: 'style', key: 'footerFontSize', type: 'number', min: 1, max: 240, runtimeEffect: 'table' },
      { source: 'style', key: 'footerTextAlign', type: 'enum', values: ['left', 'center', 'right'], runtimeEffect: 'table' },
    ]),
  },
  barcode: {
    fields: fields(COMMON_FIELDS, [
      { source: 'root', key: 'content', type: 'string', maxLength: 4096, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'format', type: 'enum', values: BARCODE_FORMATS, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'displayValue', type: 'boolean', runtimeEffect: 'machine-code' },
      { source: 'props', key: 'margin', type: 'number', min: 0, max: 40, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'textMargin', type: 'number', min: 0, max: 40, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'textFontSize', type: 'number', min: 6, max: 72, runtimeEffect: 'machine-code' },
      { source: 'style', key: 'color', type: 'color', runtimeEffect: 'machine-code' },
    ]),
  },
  qrcode: {
    fields: fields(COMMON_FIELDS, [
      { source: 'root', key: 'content', type: 'string', maxLength: 4096, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'eccLevel', type: 'enum', values: QRCODE_ECC_LEVELS, runtimeEffect: 'machine-code' },
      { source: 'props', key: 'margin', type: 'number', min: 0, max: 40, runtimeEffect: 'machine-code' },
      { source: 'style', key: 'color', type: 'color', runtimeEffect: 'machine-code' },
    ]),
  },
  pageNumber: { fields: fields(COMMON_FIELDS, TEXT_STYLE_FIELDS, [{ source: 'props', key: 'format', type: 'enum', values: PAGE_NUMBER_FORMATS, runtimeEffect: 'pagination' }]) },
  line: { fields: fields(COMMON_FIELDS) },
  rect: { fields: fields(COMMON_FIELDS) },
  circle: { fields: fields(COMMON_FIELDS) },
  multiLabel: {
    fields: fields(COMMON_FIELDS, TEXT_STYLE_FIELDS, [
      { source: 'props', key: 'dataVariable', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'rows', type: 'number', min: 1, max: 100, runtimeEffect: 'layout' },
      { source: 'props', key: 'cols', type: 'number', min: 1, max: 100, runtimeEffect: 'layout' },
      { source: 'props', key: 'gapX', type: 'number', min: 0, max: 100, runtimeEffect: 'layout' },
      { source: 'props', key: 'gapY', type: 'number', min: 0, max: 100, runtimeEffect: 'layout' },
      { source: 'props', key: 'direction', type: 'enum', values: ['row', 'column'], runtimeEffect: 'layout' },
      { source: 'props', key: 'primaryPath', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'secondaryPath', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'tertiaryPath', type: 'binding-path', maxLength: 512, runtimeEffect: 'runtime-data' },
      { source: 'props', key: 'cellPadding', type: 'number', min: 0, max: 40, runtimeEffect: 'layout' },
    ]),
  },
})
function readFieldValue(element, field) {
  return field.source === 'root' ? element?.[field.key] : element?.[field.source]?.[field.key]
}
function isValidBindingPath(value) {
  return !value || /^@?[A-Z_$][\w$]*(?:\.(?:[A-Z_$][\w$]*|\d+)|\[(?:\d+|"[^"]+"|'[^']+')\])*$/i.test(value)
}
function isValidColor(value) {
  return !value || value === 'transparent' || /^#[\da-f]{3,8}$/i.test(value) || /^rgba?\([^\n]+\)$/i.test(value)
}
function validateTableColumns(value) {
  if (!Array.isArray(value) || !value.length) {
    return 'Table requires at least one column.'
  }
  if (value.length > 100 || value.some(column => !column || typeof column.key !== 'string' || !column.key.trim())) {
    return 'Each table column requires a key and at most 100 columns are allowed.'
  }
  if (value.some(column => column.formatter && (!Object.hasOwn(column.formatter, 'type') || !['number', 'currency', 'date'].includes(column.formatter.type)))) {
    return 'Table column formatter must be number, currency, or date.'
  }
  if (value.some(column => column.valuePath && !isValidBindingPath(column.valuePath))) {
    return 'Table column value paths must be safe dotted paths.'
  }
  return ''
}
function validateTableTransform(value) {
  if (!value || Object.keys(value).length === 0) {
    return ''
  }
  if (!value || typeof value !== 'object' || !['sort', 'filterEquals'].includes(value.type) || typeof value.by !== 'string' || !value.by.trim()) {
    return 'Table transform must be a supported declarative transform.'
  }
  return ''
}
function validateTableRowHeights(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return 'Table row heights must be an object.'
  }
  for (const section of ['body', 'footer']) {
    const heights = value[section]
    if (heights == null)
      continue
    if (!heights || typeof heights !== 'object' || Array.isArray(heights)) {
      return `Table ${section} row heights must be an object.`
    }
    if (Object.entries(heights).some(([index, height]) => !/^\d+$/.test(index) || !Number.isFinite(Number(height)) || Number(height) < 1 || Number(height) > 200)) {
      return 'Table row heights must use non-negative row indexes and values between 1 and 200.'
    }
  }
  return ''
}
export function getElementPropertyCapabilities(type) {
  const definition = ELEMENT_PROPERTY_CAPABILITIES[type] || { fields: [] }
  return {
    ...definition,
    fields: definition.fields.map(field => ({
      default: CAPABILITY_DEFAULTS[field.source]?.[field.key] ?? null,
      editorOnly: false,
      ...field,
    })),
  }
}
export function getElementPropertyCapability(type, source, key) {
  return getElementPropertyCapabilities(type).fields.find(field => field.source === source && field.key === key) || null
}
export function validateElementProperty(type, source, key, value) {
  const capability = getElementPropertyCapability(type, source, key)
  if (!capability || value == null || value === '') {
    return null
  }
  if (capability.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < capability.min || Number(value) > capability.max)) {
    return `${key} must be between ${capability.min} and ${capability.max}.`
  }
  if (capability.type === 'boolean' && typeof value !== 'boolean') {
    return `${key} must be boolean.`
  }
  if (capability.type === 'string' && typeof value !== 'string') {
    return `${key} must be a string.`
  }
  if (capability.type === 'string' && capability.maxLength && value.length > capability.maxLength) {
    return `${key} exceeds ${capability.maxLength} characters.`
  }
  if (capability.type === 'enum' && !capability.values.includes(value)) {
    return `${key} must be one of: ${capability.values.join(', ')}.`
  }
  if (capability.type === 'binding-path' && (typeof value !== 'string' || !isValidBindingPath(value))) {
    return `${key} must be a dot-path binding.`
  }
  if (capability.type === 'color' && (typeof value !== 'string' || !isValidColor(value))) {
    return `${key} must be a supported CSS colour.`
  }
  if (capability.type === 'image-source' && typeof value !== 'string') {
    return `${key} must be an image URL or data URL.`
  }
  if (capability.type === 'table-columns') {
    return validateTableColumns(value) || null
  }
  if (capability.type === 'collection' && !Array.isArray(value)) {
    return `${key} must be an array.`
  }
  if (capability.type === 'table-transform') {
    return validateTableTransform(value) || null
  }
  if (capability.type === 'table-row-heights') {
    return validateTableRowHeights(value) || null
  }
  return null
}
export function validateElementProperties(element) {
  return getElementPropertyCapabilities(element?.type).fields.map(field => ({ field, message: validateElementProperty(element?.type, field.source, field.key, readFieldValue(element, field)) })).filter(result => result.message).map(({ field, message }) => ({ path: `${field.source}.${field.key}`, message, severity: 'error' }))
}
