import { mmToCssPx } from '../../editor/measurement.js'

export function previewForeground(object) {
  return object?.style?.color || object?.style?.borderColor || '#172033'
}
export function previewBackground(object, fallback = '#ffffff') {
  const background = object?.style?.backgroundColor
  return background && background !== 'transparent' ? background : fallback
}
export function previewPanelStyle(object, fallbackBackground = 'transparent') {
  const style = object?.style || {}
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0)
  const padding = Math.max(0, Number(style.padding) || 0)
  const radius = Math.max(0, Number(style.borderRadius) || 0)
  const opacity = Number(style.opacity)
  return {
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: `${mmToCssPx(padding)}px`,
    border: borderWidth
      ? `${borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || previewForeground(object)}`
      : '0 solid transparent',
    borderRadius: `${radius}px`,
    background: previewBackground(object, fallbackBackground),
    opacity: Number.isFinite(opacity) ? opacity : 1,
  }
}
export function textStyle(object) {
  const verticalAlign = object?.style?.verticalAlign || 'top'
  const textAlign = object?.style?.textAlign || 'left'
  const alignItems = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
  }
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  return {
    ...previewPanelStyle(object, 'transparent'),
    display: 'flex',
    alignItems: alignItems[verticalAlign] || 'flex-start',
    justifyContent: justifyContent[textAlign] || 'flex-start',
    color: previewForeground(object),
    fontFamily: object?.style?.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    fontSize: `${object?.style?.fontSize || 14}px`,
    fontWeight: object?.style?.fontWeight || 'normal',
    fontStyle: object?.style?.fontStyle || 'normal',
    textDecoration: object?.style?.textDecoration || 'none',
    textAlign,
    lineHeight: object?.style?.lineHeight || 1.4,
    letterSpacing: `${object?.style?.letterSpacing || 0}px`,
    whiteSpace: object?.props?.whiteSpace || 'pre-wrap',
    writingMode: object?.props?.writingMode || 'horizontal-tb',
    overflow: object?.props?.autoHeight ? 'visible' : 'hidden',
  }
}
export function textPreviewValue(object, emptyValue = '输入文本') {
  if (object?.variable) {
    const sampleValue = object?.props?.sampleValue
    return sampleValue != null && String(sampleValue).trim() !== '' ? String(sampleValue) : `{{${object.variable}}}`
  }
  return object?.content != null && String(object.content).trim() !== '' ? String(object.content) : emptyValue
}
export function encodedPreviewValue(object, emptyValue = '未配置编码') {
  if (object?.variable) {
    return `{{${object.variable}}}`
  }
  return object?.content != null && String(object.content).trim() !== '' ? String(object.content) : emptyValue
}
export function bindingLabel(object) {
  return object?.variable ? `{{${object.variable}}}` : ''
}
export function hashPreviewSeed(value) {
  const source = String(value || '')
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
export function pageNumberValue(object) {
  const current = String(object?.content || '1')
  const format = object?.props?.format || '1'
  const totalPages = String(Math.max(1, Number(object?.props?.totalPages) || 1))
  if (format === 'Page 1')
    return `Page ${current}`
  if (format === '1/N')
    return `${current}/${totalPages}`
  if (format === '第1页')
    return `第 ${current} 页`
  if (format === '第1页/共N页')
    return `第 ${current} 页 / 共 ${totalPages} 页`
  return current
}
export function hasBlankTableHeaders(object) {
  if (object?.props?.blankHeaders === true) {
    return true
  }
  const columns = object?.props?.columns
  return Array.isArray(columns) && columns.length > 0 && columns.every((column, index) => {
    const key = String(column?.key || `field${index + 1}`)
    const title = typeof column?.title === 'string' ? column.title.trim() : ''
    return key === `field${index + 1}` && (!title || title === key || /^列\s*\d+$/.test(title))
  })
}
