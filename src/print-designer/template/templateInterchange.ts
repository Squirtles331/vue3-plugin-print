import { serializeTemplateDocument, TEMPLATE_LIMITS, validateTemplateDocument } from './templateDocument.js'

export const TEMPLATE_INTERCHANGE_FORMAT = 'print-template-studio/template'
export const TEMPLATE_INTERCHANGE_VERSION = 2
function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}
function freshId() {
  return `tpl-import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
function error(path, message) {
  return { document: null, issues: [{ path, message, severity: 'error' }] }
}
export function createTemplateInterchange(template) {
  const result = serializeTemplateDocument(template)
  if (!result.valid) {
    return { ...result, envelope: null }
  }
  return {
    ...result,
    envelope: {
      format: TEMPLATE_INTERCHANGE_FORMAT,
      formatVersion: TEMPLATE_INTERCHANGE_VERSION,
      exportedAt: new Date().toISOString(),
      template: result.document,
    },
  }
}
export function stringifyTemplateInterchange(template, space = 2) {
  const result = createTemplateInterchange(template)
  if (!result.valid) {
    return { ...result, json: null }
  }
  return { ...result, json: JSON.stringify(result.envelope, null, space) }
}
export function parseTemplateInterchange(input) {
  if (typeof input !== 'string') {
    return error('file', 'Template import must be JSON text.')
  }
  if (input.length > TEMPLATE_LIMITS.maxSerializedCharacters) {
    return error('file', `Template import exceeds ${TEMPLATE_LIMITS.maxSerializedCharacters} characters.`)
  }
  let envelope
  try {
    envelope = JSON.parse(input)
  }
  catch {
    return error('file', 'Template import is not valid JSON.')
  }
  if (!envelope || typeof envelope !== 'object' || envelope.format !== TEMPLATE_INTERCHANGE_FORMAT) {
    return error('format', 'Template import uses an unsupported format.')
  }
  const formatVersion = Number(envelope.formatVersion)
  if (formatVersion !== TEMPLATE_INTERCHANGE_VERSION) {
    return error('formatVersion', `Template interchange version ${envelope.formatVersion ?? 'unknown'} is not supported.`)
  }
  const validation = validateTemplateDocument(envelope.template)
  if (!validation.valid) {
    return { document: null, issues: validation.issues }
  }
  const document = clone(validation.document)
  const now = new Date().toISOString()
  document.id = freshId()
  document.meta = { ...document.meta, createdAt: now, updatedAt: now }
  return { document, issues: [] }
}
export function downloadTemplateInterchange(template, filename = 'print-template.json') {
  const result = stringifyTemplateInterchange(template)
  if (!result.valid) {
    return result
  }
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    return { ...result, downloaded: false }
  }
  const anchor = document.createElement('a')
  const url = URL.createObjectURL(new Blob([result.json], { type: 'application/json' }))
  anchor.href = url
  anchor.download = filename.endsWith('.json') ? filename : `${filename}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return { ...result, downloaded: true }
}
