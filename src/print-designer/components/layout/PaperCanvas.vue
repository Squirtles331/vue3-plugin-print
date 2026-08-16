<script setup lang="ts">
import { getElementDefinition } from '../../core/elementFactory'
import { createMoveObjectCommand, createRemoveObjectsCommand, createTransformObjectCommand } from '../../editor/commands/documentCommands.js'
import { executeEditorCommand } from '../../editor/commands/executeCommand.js'
import { createGroupCommand, createUngroupCommand } from '../../editor/commands/groupCommands.js'
import { createPatchTransactionCommand } from '../../editor/commands/layoutCommands.js'
import { MM_TO_CSS_PX, mmToCssPx, mmToRoundedCssPx } from '../../editor/measurement.js'
import { useEditorDocumentStore } from '../../editor/stores/documentStore'
import { useEditorHistoryStore } from '../../editor/stores/historyStore'
import { useEditorSelectionStore } from '../../editor/stores/selectionStore'
import { useEditorViewportStore } from '../../editor/stores/viewportStore'
import { createGridDefinition } from '../../editor/workspace/workspaceGrid.js'
import { buildAxisSnapReferences, resolveObjectSnap } from '../../editor/workspace/workspaceSnapping.js'
import { formatTableValue, machineCodeOptions, resolveRelativeRecordPath } from '../../runtime/propertySemantics.js'
import ElementRenderer from '../elements/ElementRenderer.vue'

const props = defineProps({
  pixelsPerUnit: {
    type: Number,
    default: MM_TO_CSS_PX,
  },
  zoom: {
    type: Number,
    default: 1,
  },
})
const documentStore = useEditorDocumentStore()
const historyStore = useEditorHistoryStore()
const selectionStore = useEditorSelectionStore()
const viewportStore = useEditorViewportStore()
const resizeHandles = [
  { key: 'nw', label: '左上缩放' },
  { key: 'n', label: '上边缩放' },
  { key: 'ne', label: '右上缩放' },
  { key: 'e', label: '右边缩放' },
  { key: 'se', label: '右下缩放' },
  { key: 's', label: '下边缩放' },
  { key: 'sw', label: '左下缩放' },
  { key: 'w', label: '左边缩放' },
]
const { currentPage, pageObjectMap, objectsById, pageWidthMm, pageHeightMm, pageWidthPx, pageHeightPx, marginTopMm, marginRightMm, marginBottomMm, marginLeftMm, pageBackground, pageCornerVisible, headerLineVisible, footerLineVisible, headerOffsetMm, footerOffsetMm, currentPageGroups } = storeToRefs(documentStore)
const { gridVisible, safeAreaVisible, guidesVisible, horizontalGuides, verticalGuides, snapEnabled, pageOutlineVisible, allowOverflowDrag } = storeToRefs(viewportStore)
const { selectedIds, hoverObjectId, activeHandle } = storeToRefs(selectionStore)
const paperRef = ref(null)
const interactionState = ref(null)
const selectionMarquee = ref(null)
const contextMenu = ref(null)
const activeSnap = ref({
  x: null,
  y: null,
})
function roundMm(value) {
  return +value.toFixed(2)
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
function clampObjectPosition(position, size, pageSize) {
  if (allowOverflowDrag.value) {
    return roundMm(position)
  }
  return clamp(roundMm(position), 0, Math.max(0, roundMm(pageSize - size)))
}
function isCornerHandle(handle = '') {
  return handle.length === 2
}
function isAspectRatioLocked(object, handle) {
  if (!object || !isCornerHandle(handle)) {
    return false
  }
  if (object.type === 'qrcode' || object.type === 'circle') {
    return true
  }
  return !!object.props?.keepAspectRatio
}
function isAutoHeightTextObject(object) {
  return object?.type === 'text' && !!object?.props?.autoHeight
}
function visibleResizeHandles(object) {
  if (!isAutoHeightTextObject(object)) {
    return resizeHandles
  }
  return resizeHandles.filter(handle => handle.key === 'e' || handle.key === 'w')
}
function resolveEdgeSnap(position, references, pixelsPerUnit, tolerancePx = 6) {
  if (!Number.isFinite(position)) {
    return null
  }
  let best = null
  references.forEach((reference) => {
    const distancePx = Math.abs(reference.position - position) * pixelsPerUnit
    if (distancePx > tolerancePx) {
      return
    }
    if (!best || distancePx < best.distancePx) {
      best = {
        position: reference.position,
        source: reference.source,
        distancePx,
      }
    }
  })
  return best
}
function resolveResizeSnap(rect, startRect, handle) {
  const pixelsPerUnit = props.pixelsPerUnit * props.zoom
  const gridSpacingMm = gridVisible.value ? gridDefinition.value.minorMm : null
  const xReferences = buildAxisSnapReferences(pageWidthMm.value, guidesVisible.value ? verticalGuides.value : [], gridSpacingMm)
  const yReferences = buildAxisSnapReferences(pageHeightMm.value, guidesVisible.value ? horizontalGuides.value : [], gridSpacingMm)
  const xEdge = handle.includes('w') ? rect.x : handle.includes('e') ? rect.x + rect.width : null
  const yEdge = handle.includes('n') ? rect.y : handle.includes('s') ? rect.y + rect.height : null
  const xSnap = resolveEdgeSnap(xEdge, xReferences, pixelsPerUnit)
  const ySnap = resolveEdgeSnap(yEdge, yReferences, pixelsPerUnit)
  const lockAspectRatio = isAspectRatioLocked(startRect, handle)
  if (lockAspectRatio && isCornerHandle(handle)) {
    const useXAxis = xSnap && (!ySnap || xSnap.distancePx <= ySnap.distancePx)
    const useYAxis = ySnap && (!xSnap || ySnap.distancePx < xSnap.distancePx)
    if (useXAxis) {
      const aspectRatio = startRect.width / startRect.height || 1
      const nextWidth = handle.includes('w') ? rect.x + rect.width - xSnap.position : xSnap.position - rect.x
      const nextHeight = nextWidth / aspectRatio
      const nextRect = {
        x: handle.includes('w') ? xSnap.position : rect.x,
        y: handle.includes('n') ? rect.y + rect.height - nextHeight : rect.y,
        width: nextWidth,
        height: nextHeight,
      }
      return {
        rect: {
          x: roundMm(nextRect.x),
          y: roundMm(nextRect.y),
          width: roundMm(nextRect.width),
          height: roundMm(nextRect.height),
        },
        activeSnap: {
          x: {
            position: xSnap.position,
            edge: handle.includes('w') ? 'start' : 'end',
            source: xSnap.source,
          },
          y: null,
        },
      }
    }
    if (useYAxis) {
      const aspectRatio = startRect.width / startRect.height || 1
      const nextHeight = handle.includes('n') ? rect.y + rect.height - ySnap.position : ySnap.position - rect.y
      const nextWidth = nextHeight * aspectRatio
      const nextRect = {
        x: handle.includes('w') ? rect.x + rect.width - nextWidth : rect.x,
        y: handle.includes('n') ? ySnap.position : rect.y,
        width: nextWidth,
        height: nextHeight,
      }
      return {
        rect: {
          x: roundMm(nextRect.x),
          y: roundMm(nextRect.y),
          width: roundMm(nextRect.width),
          height: roundMm(nextRect.height),
        },
        activeSnap: {
          x: null,
          y: {
            position: ySnap.position,
            edge: handle.includes('n') ? 'start' : 'end',
            source: ySnap.source,
          },
        },
      }
    }
  }
  const nextRect = { ...rect }
  if (xSnap) {
    if (handle.includes('w')) {
      nextRect.width = roundMm(nextRect.width + (nextRect.x - xSnap.position))
      nextRect.x = roundMm(xSnap.position)
    }
    else if (handle.includes('e')) {
      nextRect.width = roundMm(xSnap.position - nextRect.x)
    }
  }
  if (ySnap) {
    if (handle.includes('n')) {
      nextRect.height = roundMm(nextRect.height + (nextRect.y - ySnap.position))
      nextRect.y = roundMm(ySnap.position)
    }
    else if (handle.includes('s')) {
      nextRect.height = roundMm(ySnap.position - nextRect.y)
    }
  }
  return {
    rect: nextRect,
    activeSnap: {
      x: xSnap
        ? {
            position: xSnap.position,
            edge: handle.includes('w') ? 'start' : 'end',
            source: xSnap.source,
          }
        : null,
      y: ySnap
        ? {
            position: ySnap.position,
            edge: handle.includes('n') ? 'start' : 'end',
            source: ySnap.source,
          }
        : null,
    },
  }
}
const allPageObjects = computed(() => {
  const pageId = currentPage.value?.id || 'page-1'
  const objectIds = pageObjectMap.value[pageId] || []
  return objectIds.map(objectId => objectsById.value[objectId]).filter(Boolean)
})
const pageObjects = computed(() => allPageObjects.value.filter(object => object.visible !== false))
const hiddenObjectCount = computed(() => allPageObjects.value.length - pageObjects.value.length)
const canvasEmptyState = computed(() => {
  if (hiddenObjectCount.value > 0) {
    return {
      badge: '全部隐藏',
      title: '当前页元素已隐藏',
      description: '页面里有元素，但它们都被图层面板隐藏了。恢复显示后即可继续在画布中编辑。',
      helper: '可在图层面板处理',
      chips: ['显示', '锁定', '排序'],
    }
  }
  return {
    badge: '页面内容区',
    title: '从模板面板拖入元素，开始搭建打印页面。',
    description: '先把文字、图片、表格、条码和二维码放到纸面上，再继续做排版和属性调整。',
    helper: '推荐起点',
    chips: ['文本', '表格', '二维码'],
  }
})
const gridDefinition = computed(() => createGridDefinition(props.pixelsPerUnit))
const paperStyle = computed(() => ({
  width: `${pageWidthPx.value}px`,
  height: `${pageHeightPx.value}px`,
  background: pageBackground.value,
}))
const safeAreaStyle = computed(() => ({
  inset: `${mmToCssPx(marginTopMm.value)}px ${mmToCssPx(marginRightMm.value)}px ${mmToCssPx(marginBottomMm.value)}px ${mmToCssPx(marginLeftMm.value)}px`,
}))
const selectionMarqueeStyle = computed(() => {
  const marquee = selectionMarquee.value
  if (!marquee) {
    return {}
  }
  const left = Math.min(marquee.start.x, marquee.current.x)
  const top = Math.min(marquee.start.y, marquee.current.y)
  return {
    left: `${mmToCssPx(left)}px`,
    top: `${mmToCssPx(top)}px`,
    width: `${mmToCssPx(Math.abs(marquee.current.x - marquee.start.x))}px`,
    height: `${mmToCssPx(Math.abs(marquee.current.y - marquee.start.y))}px`,
  }
})
const hasContextGroup = computed(() => currentPageGroups.value.some(group => group.elementIds?.some(id => selectedIds.value.includes(id))))
function isOutsideSafeArea(object) {
  if (!object || object.printable === false) {
    return false
  }
  return object.x < marginLeftMm.value
    || object.y < marginTopMm.value
    || object.x + object.width > pageWidthMm.value - marginRightMm.value
    || object.y + object.height > pageHeightMm.value - marginBottomMm.value
}
const headerLineStyle = computed(() => ({
  top: `${mmToCssPx(clamp(headerOffsetMm.value, 0, pageHeightMm.value))}px`,
}))
const footerLineStyle = computed(() => ({
  bottom: `${mmToCssPx(clamp(footerOffsetMm.value, 0, pageHeightMm.value))}px`,
}))
const gridStyle = computed(() => ({
  backgroundImage: [
    'linear-gradient(rgba(191, 201, 214, 0.26) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(191, 201, 214, 0.26) 1px, transparent 1px)',
    'linear-gradient(rgba(120, 138, 160, 0.2) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(120, 138, 160, 0.2) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: [
    `${gridDefinition.value.minorPx}px ${gridDefinition.value.minorPx}px`,
    `${gridDefinition.value.minorPx}px ${gridDefinition.value.minorPx}px`,
    `${gridDefinition.value.majorPx}px ${gridDefinition.value.majorPx}px`,
    `${gridDefinition.value.majorPx}px ${gridDefinition.value.majorPx}px`,
  ].join(', '),
  backgroundPosition: '0 0, 0 0, 0 0, 0 0',
}))
function elementLabel(type) {
  return getElementDefinition(type)?.label || type
}
function objectFrameStyle(object) {
  const autoHeight = isAutoHeightTextObject(object)
  return {
    left: `${mmToCssPx(object.x)}px`,
    top: `${mmToCssPx(object.y)}px`,
    width: `${mmToCssPx(object.width)}px`,
    height: autoHeight ? 'auto' : `${mmToCssPx(object.height)}px`,
    minHeight: autoHeight ? `${mmToCssPx(object.height)}px` : undefined,
    opacity: object.opacity ?? 1,
  }
}
function objectContentStyle(object) {
  return {
    color: object.style?.color || '#111827',
    background: object.style?.backgroundColor || 'transparent',
  }
}
function textContentStyle(object) {
  const verticalAlign = object.style?.verticalAlign || 'top'
  const textAlign = object.style?.textAlign || 'left'
  const alignItemsMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
  }
  const justifyContentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  return {
    ...previewPanelStyle(object, 'transparent'),
    color: object.style?.color || '#111827',
    fontFamily: object.style?.fontFamily || 'sans-serif',
    fontSize: `${object.style?.fontSize || 14}px`,
    fontWeight: object.style?.fontWeight || 'normal',
    fontStyle: object.style?.fontStyle || 'normal',
    textDecoration: object.style?.textDecoration || 'none',
    textAlign,
    lineHeight: object.style?.lineHeight || 1.4,
    letterSpacing: `${object.style?.letterSpacing || 0}px`,
    whiteSpace: object.props?.whiteSpace || 'pre-wrap',
    writingMode: object.props?.writingMode || 'horizontal-tb',
    alignItems: alignItemsMap[verticalAlign] || 'flex-start',
    justifyContent: justifyContentMap[textAlign] || 'flex-start',
    overflow: object.props?.autoHeight ? 'visible' : 'hidden',
  }
}
function textPreviewContent(object) {
  const sampleValue = object.props?.sampleValue
  const variable = object.variable
  const content = object.content
  if (variable) {
    if (sampleValue != null && String(sampleValue).trim() !== '') {
      return String(sampleValue)
    }
    return `{{${variable}}}`
  }
  if (content != null && String(content).trim() !== '') {
    return String(content)
  }
  return '未配置文本'
}
function imagePlaceholderCaption(object) {
  const variable = object.variable
  if (variable) {
    return `{{${variable}}}`
  }
  if (object.props?.placeholder) {
    return String(object.props.placeholder)
  }
  return '未绑定图片'
}
function encodedPreviewContent(object, fallback) {
  const variable = object.variable
  const content = object.content
  if (variable) {
    return `{{${variable}}}`
  }
  if (content != null && String(content).trim() !== '') {
    return String(content)
  }
  return fallback
}
function showVariableBadge(object) {
  if (!object?.variable) {
    return false
  }
  return ['text', 'image', 'barcode', 'qrcode'].includes(object.type)
}
function variableBadgeLabel(object) {
  return `{{${object.variable}}}`
}
function shapeStyle(object) {
  return {
    borderWidth: `${object.style?.borderWidth ?? 1}px`,
    borderStyle: object.style?.borderStyle || 'solid',
    borderColor: object.style?.borderColor || '#111827',
    background: object.style?.backgroundColor || 'transparent',
    borderRadius: `${Math.max(0, Number(object.style?.borderRadius) || 0)}px`,
    opacity: Number.isFinite(Number(object.style?.opacity)) ? Number(object.style?.opacity) : 1,
  }
}
function tableColumns(object) {
  if (Array.isArray(object.props?.columns)) {
    return object.props.columns.map((column, index) => ({
      key: typeof column?.key === 'string' && column.key.trim()
        ? column.key
        : `field${index + 1}`,
      valuePath: typeof column?.valuePath === 'string' && column.valuePath.trim()
        ? column.valuePath
        : typeof column?.key === 'string' && column.key.trim()
          ? column.key
          : `field${index + 1}`,
      title: typeof column?.title === 'string' && column.title.trim()
        ? column.title
        : `列 ${index + 1}`,
      width: Number.isFinite(Number(column?.width)) ? Number(column.width) : 100,
      align: column?.align === 'center' || column?.align === 'right'
        ? column.align
        : column?.align === 'justify'
          ? 'left'
          : 'left',
      formatter: column?.formatter,
    }))
  }
  return [
    { key: 'id', title: 'ID', width: 60, align: 'center' },
    { key: 'name', title: '名称', width: 140, align: 'left' },
    { key: 'qty', title: '数量', width: 100, align: 'right' },
    { key: 'price', title: '单价', width: 120, align: 'right' },
    { key: 'total', title: '合计', width: 120, align: 'right' },
  ]
}
function tableHeaderLabel(column) {
  return column?.title || ''
}
function tableColumnWidth(column) {
  const width = Number(column?.width)
  return Number.isFinite(width) && width > 0 ? width : 100
}
function tableGridStyle(object) {
  const trackList = tableColumns(object)
    .map(column => `minmax(0, ${tableColumnWidth(column)}fr)`)
    .join(' ')
  return {
    gridTemplateColumns: trackList || 'minmax(0, 1fr)',
  }
}
function tableCellStyle(column, object, section = 'body') {
  const sectionFontSize = section === 'header'
    ? object?.style?.headerFontSize || object?.style?.fontSize || 10
    : section === 'footer'
      ? object?.style?.footerFontSize || object?.style?.fontSize || 10
      : object?.style?.fontSize || 10
  const textAlignFallback = section === 'header'
    ? object?.style?.headerTextAlign || object?.style?.textAlign || 'left'
    : section === 'footer'
      ? object?.style?.footerTextAlign || object?.style?.textAlign || 'left'
      : object?.style?.textAlign || 'left'
  const textAlign = column?.align || textAlignFallback
  const verticalAlign = object?.style?.verticalAlign || 'top'
  const justifyContentMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  const alignItemsMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
  }
  return {
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    justifyContent: justifyContentMap[textAlign] || 'flex-start',
    alignItems: alignItemsMap[verticalAlign] || 'flex-start',
    textAlign,
    fontSize: `${Math.max(9, Number(sectionFontSize) || 10)}px`,
    color: section === 'header'
      ? object?.style?.headerColor || object?.style?.color || '#111827'
      : section === 'footer'
        ? object?.style?.footerColor || object?.style?.color || '#111827'
        : object?.style?.color || '#111827',
  }
}
function tableStyle(object) {
  const style = object.style || {}
  const padding = Math.max(0, Number(style.padding) || 0)
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0)
  const borderColor = style.borderColor || '#111827'
  const headerHeight = Math.max(0, Number(object?.props?.headerHeight) || 0)
  const rowHeight = Math.max(0, Number(object?.props?.rowHeight) || 0)
  const footerHeight = Math.max(0, Number(object?.props?.footerHeight) || 0)
  return {
    ...previewPanelStyle(object, '#ffffff'),
    'color': style.color || '#111827',
    'fontFamily': style.fontFamily || undefined,
    'fontSize': `${Math.max(9, Number(style.fontSize) || 10)}px`,
    'fontWeight': style.fontWeight || 'normal',
    'fontStyle': style.fontStyle || 'normal',
    'lineHeight': style.lineHeight || 1.4,
    'letterSpacing': `${Number.isFinite(Number(style.letterSpacing)) ? Number(style.letterSpacing) : 0}px`,
    '--table-cell-padding-y': `${Math.max(0, Math.round(mmToCssPx(padding) * 0.55))}px`,
    '--table-cell-padding-x': `${Math.max(0, Math.round(mmToCssPx(padding)))}px`,
    '--table-grid-border-width': `${borderWidth}px`,
    '--table-grid-border-style': style.borderStyle || 'solid',
    '--table-grid-border-color': borderColor,
    '--table-head-background': style.headerBackgroundColor || 'rgba(243, 244, 246, 0.98)',
    '--table-footer-background': style.footerBackgroundColor || 'rgba(249, 250, 251, 0.98)',
    '--table-head-color': style.headerColor || style.color || '#111827',
    '--table-footer-color': style.footerColor || style.color || '#111827',
    '--table-head-min-height': headerHeight > 0 ? `${Math.round(mmToCssPx(headerHeight))}px` : 'auto',
    '--table-row-min-height': rowHeight > 0 ? `${Math.round(mmToCssPx(rowHeight))}px` : 'auto',
    '--table-footer-min-height': footerHeight > 0 ? `${Math.round(mmToCssPx(footerHeight))}px` : 'auto',
  }
}
function tableBindingPlaceholder(variable, key, rowIndex = 0) {
  return `{{${variable}[${rowIndex}].${key}}}`
}
function tableDataSource(object) {
  if (Array.isArray(object.props?.sampleData)) {
    return object.props.sampleData
  }
  return []
}
function tableDesignRowCount(object) {
  const value = Number(object?.editorHints?.rowCount)
  return Number.isFinite(value) && value > 0 ? Math.max(1, Math.round(value)) : 0
}
function tablePreviewRowCount(object, rows) {
  const explicitCount = tableDesignRowCount(object)
  if (explicitCount > 0) {
    return explicitCount
  }
  if (rows.length > 0) {
    return rows.length
  }
  return 5
}
function tablePreviewLimit(object, totalRowCount) {
  if (object?.editorHints?.omitRows === false) {
    return totalRowCount
  }
  return Math.min(totalRowCount, 5)
}
function createTableBindingPlaceholderRows(object, columns, rowCount) {
  return Array.from({ length: rowCount }, (_, rowIndex) => columns.reduce((result, column) => {
    result[column.key] = tableBindingPlaceholder(object.props?.dataVariable, column.valuePath || column.key, rowIndex)
    return result
  }, {}))
}
function createEmptyTableRows(columns, rowCount) {
  return Array.from({ length: rowCount }, () => columns.reduce((result, column) => {
    result[column.key] = ''
    return result
  }, {}))
}
function tableSummaryMetrics(object) {
  const rows = tableDataSource(object)
  return rows.reduce((result, row) => {
    result.totalQty += Number(row?.qty) || 0
    result.totalAmount += Number(row?.total) || 0
    return result
  }, {
    totalQty: 0,
    totalAmount: 0,
  })
}
function tableReplaceSummaryToken(value, object) {
  if (typeof value !== 'string' || !value.includes('{#')) {
    return value
  }
  const { totalQty, totalAmount } = tableSummaryMetrics(object)
  return value
    .replaceAll('{#pageQty}', String(totalQty))
    .replaceAll('{#totalQty}', String(totalQty))
    .replaceAll('{#pageSum}', totalAmount.toFixed(2))
    .replaceAll('{#totalSum}', totalAmount.toFixed(2))
    .replaceAll('{#totalCap}', digitUppercase(totalAmount))
}
function digitUppercase(value) {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  let amount = Math.abs(Number(value) || 0)
  let result = ''
  for (let i = 0; i < fraction.length; i += 1) {
    result += (digit[Math.floor(amount * 10 * 10 ** i) % 10] + fraction[i]).replace(/零./, '')
  }
  result = result || '整'
  amount = Math.floor(amount)
  for (let i = 0; i < unit[0].length && amount > 0; i += 1) {
    let part = ''
    for (let j = 0; j < unit[1].length && amount > 0; j += 1) {
      part = digit[amount % 10] + unit[1][j] + part
      amount = Math.floor(amount / 10)
    }
    result = part.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + result
  }
  return result.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整')
}
function tableResolveCellValue(value, object) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.result != null && value.result !== '') {
      return String(value.result)
    }
    if (typeof value.field === 'string' && value.field) {
      return String(tableReplaceSummaryToken(value.field, object))
    }
    if (typeof value.value === 'string' && value.value) {
      return String(tableReplaceSummaryToken(value.value, object))
    }
  }
  if (value == null) {
    return ''
  }
  return typeof value === 'string' ? tableReplaceSummaryToken(value, object) : String(value)
}
function tableCellDisplayValue(row, column, object, section = 'body') {
  const result = resolveRelativeRecordPath(row, column.valuePath || column.key)
  const value = result.found ? result.value : row?.[column.key]
  const resolved = tableResolveCellValue(value, object)
  if (resolved === '' && section === 'body') {
    return ''
  }
  return formatTableValue(resolved, column?.formatter)
}
function tableRows(object) {
  const rows = tableDataSource(object)
  const previewLimit = tablePreviewLimit(object, tablePreviewRowCount(object, rows))
  const bindingPreviewRows = !rows.length && object.props?.dataVariable
    ? Array.from({ length: previewLimit }, (_, rowIndex) => tableColumns(object).reduce((result, column) => {
        result[column.key] = tableBindingPlaceholder(object.props.dataVariable, column.valuePath || column.key, rowIndex)
        return result
      }, {}))
    : null
  const previewRows = rows
  return (bindingPreviewRows || previewRows).slice(0, previewLimit).map((row, index) => ({
    ...row,
    __rowKey: `${object.id}-${index}`,
  }))
}
function tableShowsOmission(object) {
  if (object?.editorHints?.omitRows === false) {
    return false
  }
  return tableDataSource(object).length > tableRows(object).length
}
function renderedTableRows(object) {
  const rows = tableDataSource(object)
  const columns = tableColumns(object)
  const totalRowCount = tablePreviewRowCount(object, rows)
  const previewLimit = tablePreviewLimit(object, totalRowCount)
  let previewRows = rows.slice(0, previewLimit)
  if (!previewRows.length && columns.length) {
    previewRows = object.props?.dataVariable
      ? createTableBindingPlaceholderRows(object, columns, previewLimit)
      : createEmptyTableRows(columns, previewLimit)
  }
  return previewRows.map((row, index) => ({
    ...row,
    __rowKey: `${object.id}-${index}`,
  }))
}
function renderedTableShowsOmission(object) {
  if (object?.editorHints?.omitRows === false) {
    return false
  }
  const rows = tableDataSource(object)
  const totalRowCount = rows.length || tablePreviewRowCount(object, rows)
  return totalRowCount > renderedTableRows(object).length
}
function tableFooterRows(object) {
  if (object.props?.showFooter === false) {
    return []
  }
  const columns = tableColumns(object)
  const footerData = object.props?.footerData
  if (Array.isArray(footerData)) {
    return footerData.map((row, index) => ({
      ...row,
      __rowKey: `${object.id}-footer-${index}`,
    }))
  }
  if (footerData && typeof footerData === 'object' && Object.keys(footerData).length) {
    return [
      {
        ...footerData,
        __rowKey: `${object.id}-footer-0`,
      },
    ]
  }
  if (object.props?.footerDataVariable) {
    return [
      {
        ...columns.reduce((result, column) => {
          result[column.key] = `{{${object.props.footerDataVariable}.${column.key}}}`
          return result
        }, {}),
        __rowKey: `${object.id}-footer-0`,
      },
    ]
  }
  return []
}
function tableBindingTokens(object) {
  const tokens = []
  if (object.props?.dataVariable) {
    tokens.push({
      key: 'data',
      label: `数据: {{${object.props.dataVariable}}}`,
    })
  }
  if (object.props?.footerDataVariable) {
    tokens.push({
      key: 'footer',
      label: `页脚: {{${object.props.footerDataVariable}}}`,
    })
  }
  return tokens
}
function multiLabelConfig(object) {
  return {
    rows: Math.max(1, Number(object?.props?.rows) || 1),
    cols: Math.max(1, Number(object?.props?.cols) || 1),
    gapX: Math.max(0, Number(object?.props?.gapX) || 0),
    gapY: Math.max(0, Number(object?.props?.gapY) || 0),
    direction: object?.props?.direction === 'column' ? 'column' : 'row',
  }
}
function multiLabelBindingLabel(object) {
  if (object.props?.dataVariable) {
    return `数据: {{${object.props.dataVariable}}}`
  }
  return ''
}
function multiLabelGridStyle(object) {
  const config = multiLabelConfig(object)
  return {
    gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
    columnGap: `${mmToCssPx(config.gapX)}px`,
    rowGap: `${mmToCssPx(config.gapY)}px`,
  }
}
function multiLabelCellPosition(index, rows, cols, direction) {
  if (direction === 'column') {
    return {
      row: (index % rows) + 1,
      col: Math.floor(index / rows) + 1,
    }
  }
  return {
    row: Math.floor(index / cols) + 1,
    col: (index % cols) + 1,
  }
}
function multiLabelAlignItems(textAlign) {
  switch (textAlign) {
    case 'center':
      return 'center'
    case 'right':
      return 'flex-end'
    default:
      return 'flex-start'
  }
}
function multiLabelJustifyContent(verticalAlign) {
  switch (verticalAlign) {
    case 'middle':
      return 'center'
    case 'bottom':
      return 'flex-end'
    default:
      return 'flex-start'
  }
}
function multiLabelCellStyle(object, cell) {
  const style = object?.style || {}
  const fontSize = Math.max(8, Number(style.fontSize) || 10)
  const paddingMm = Math.max(0, Number(object?.props?.cellPadding ?? style.padding) || 0)
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0)
  const hasVisibleBorder = borderWidth > 0
  const color = previewForegroundColor(object)
  const backgroundColor = style.backgroundColor && style.backgroundColor !== 'transparent'
    ? style.backgroundColor
    : 'rgba(255, 255, 255, 0.96)'
  return {
    'gridRow': String(cell.row),
    'gridColumn': String(cell.col),
    'justifyContent': multiLabelJustifyContent(style.verticalAlign),
    'alignItems': multiLabelAlignItems(style.textAlign),
    'padding': `${Math.max(0, mmToCssPx(paddingMm))}px`,
    'borderWidth': `${borderWidth}px`,
    'borderStyle': hasVisibleBorder ? style.borderStyle || 'solid' : 'solid',
    'borderColor': hasVisibleBorder ? style.borderColor || color : 'transparent',
    'borderRadius': `${Math.max(0, Number(style.borderRadius) || 0)}px`,
    'background': backgroundColor,
    color,
    'opacity': Number.isFinite(Number(style.opacity)) ? Number(style.opacity) : 1,
    'textAlign': style.textAlign || 'left',
    'fontFamily': style.fontFamily || undefined,
    'fontStyle': style.fontStyle || 'normal',
    'lineHeight': style.lineHeight || 1.4,
    'letterSpacing': `${Number(style.letterSpacing) || 0}px`,
    '--multi-label-primary-size': `${fontSize}px`,
    '--multi-label-secondary-size': `${Math.max(8, Math.round(fontSize * 0.84))}px`,
    '--multi-label-index-size': `${Math.max(7, Math.round(fontSize * 0.72))}px`,
    '--multi-label-primary-weight': style.fontWeight || '700',
    '--multi-label-secondary-color': color,
    '--multi-label-index-color': style.borderColor || color,
  }
}
function multiLabelPreviewLines(item, fallbackIndex, object) {
  if (item == null || item === '') {
    if (object?.props?.dataVariable) {
      const base = `${object.props.dataVariable}[${fallbackIndex}]`
      return {
        primary: `{{${base}.${object?.props?.primaryPath || 'title'}}}`,
        secondary: object?.props?.secondaryPath ? `{{${base}.${object.props.secondaryPath}}}` : '',
        tertiary: object?.props?.tertiaryPath ? `{{${base}.${object.props.tertiaryPath}}}` : '',
      }
    }
    return {
      primary: '未绑定标签',
      secondary: '',
      tertiary: '',
    }
  }
  if (typeof item === 'string' || typeof item === 'number') {
    return {
      primary: String(item),
      secondary: '',
      tertiary: '',
    }
  }
  if (typeof item === 'object') {
    const mapped = (path) => {
      const result = resolveRelativeRecordPath(item, path)
      return result.found && result.value != null ? String(result.value) : path ? `{{${path}}}` : ''
    }
    return {
      primary: mapped(object?.props?.primaryPath),
      secondary: mapped(object?.props?.secondaryPath),
      tertiary: mapped(object?.props?.tertiaryPath),
    }
  }
  return {
    primary: '未配置标签',
    secondary: String(item),
    tertiary: '',
  }
}
function multiLabelCells(object) {
  const config = multiLabelConfig(object)
  const total = config.rows * config.cols
  const sampleData = Array.isArray(object?.props?.sampleData) ? object.props.sampleData : []
  return Array.from({ length: total }, (_, index) => {
    const item = sampleData[index]
    const { row, col } = multiLabelCellPosition(index, config.rows, config.cols, config.direction)
    const preview = multiLabelPreviewLines(item, index, object)
    return {
      key: `${object.id}-${index}`,
      row,
      col,
      indexLabel: `#${index + 1}`,
      ...preview,
    }
  })
}
function previewForegroundColor(object) {
  return object.style?.color || object.style?.borderColor || '#111827'
}
function previewBackgroundColor(object) {
  return object.style?.backgroundColor || '#ffffff'
}
function previewPanelStyle(object, fallbackBackground = 'transparent') {
  const style = object?.style || {}
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0)
  const padding = Math.max(0, Number(style.padding) || 0)
  const radius = Math.max(0, Number(style.borderRadius) || 0)
  const opacity = Number(style.opacity)
  return {
    boxSizing: 'border-box',
    padding: `${mmToCssPx(padding)}px`,
    border: borderWidth
      ? `${borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || previewForegroundColor(object)}`
      : '0 solid transparent',
    borderRadius: `${radius}px`,
    background: style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : fallbackBackground,
    opacity: Number.isFinite(opacity) ? opacity : 1,
  }
}
function imagePreviewStyle(object) {
  return previewPanelStyle(object, '#f8fafc')
}
function hashPreviewSeed(value) {
  const source = String(value || '')
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
function barcodePreviewStyle(object) {
  const options = machineCodeOptions(object.props)
  return {
    ...previewPanelStyle(object, '#ffffff'),
    padding: `${mmToCssPx(options.margin)}px`,
  }
}
function barcodeValueStyle(object) {
  const options = machineCodeOptions(object.props)
  return {
    color: previewForegroundColor(object),
    fontFamily: object.style?.fontFamily || 'sans-serif',
    fontSize: `${options.textFontSize}px`,
    fontWeight: object.style?.fontWeight || 'normal',
    letterSpacing: `${Number.isFinite(Number(object.style?.letterSpacing)) ? Number(object.style?.letterSpacing) : 1}px`,
    textAlign: object.style?.textAlign || 'center',
    marginTop: `${options.textMargin}px`,
  }
}
function barcodeBarsStyle(object) {
  const source = `${object.props?.format || 'CODE128'}:${encodedPreviewContent(object, '未配置编码值')}`
  const seed = hashPreviewSeed(source)
  const foreground = previewForegroundColor(object)
  const segments = []
  let cursor = 0
  let state = 1
  for (let index = 0; index < 48; index += 1) {
    const width = ((seed >> (index % 24)) & 0x3) + 1
    const nextCursor = Math.min(100, cursor + width)
    const color = state ? foreground : 'transparent'
    segments.push(`${color} ${cursor}%`, `${color} ${nextCursor}%`)
    cursor = nextCursor
    state = state ? 0 : 1
    if (cursor >= 100) {
      break
    }
  }
  if (cursor < 100) {
    segments.push(`transparent ${cursor}%`, `transparent 100%`)
  }
  return {
    backgroundImage: `linear-gradient(90deg, ${segments.join(', ')})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  }
}
function qrCodeSize(object) {
  const eccLevel = object.props?.eccLevel || 'M'
  switch (eccLevel) {
    case 'L':
      return 21
    case 'Q':
      return 25
    case 'H':
      return 29
    default:
      return 23
  }
}
function isQrFinderCell(size, row, column) {
  const anchors = [
    { row: 0, column: 0 },
    { row: 0, column: size - 7 },
    { row: size - 7, column: 0 },
  ]
  return anchors.some(anchor => row >= anchor.row && row < anchor.row + 7 && column >= anchor.column && column < anchor.column + 7)
}
function isQrFinderDark(size, row, column) {
  const anchors = [
    { row: 0, column: 0 },
    { row: 0, column: size - 7 },
    { row: size - 7, column: 0 },
  ]
  const anchor = anchors.find(item => row >= item.row && row < item.row + 7 && column >= item.column && column < item.column + 7)
  if (!anchor) {
    return false
  }
  const innerRow = row - anchor.row
  const innerColumn = column - anchor.column
  const onOuter = innerRow === 0 || innerRow === 6 || innerColumn === 0 || innerColumn === 6
  const onCenter = innerRow >= 2 && innerRow <= 4 && innerColumn >= 2 && innerColumn <= 4
  return onOuter || onCenter
}
function qrCodeCells(object) {
  const size = qrCodeSize(object)
  const seed = hashPreviewSeed(`${encodedPreviewContent(object, '未配置编码值')}:${object.props?.eccLevel || 'M'}`)
  const cells = []
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let dark
      if (isQrFinderCell(size, row, column)) {
        dark = isQrFinderDark(size, row, column)
      }
      else {
        const mask = ((seed >> ((row + column) % 24)) & 1) ^ (((row * 3 + column * 5 + seed) % 7) < 3 ? 1 : 0)
        dark = mask === 1
      }
      cells.push({
        key: `${row}-${column}`,
        dark,
      })
    }
  }
  return cells
}
function qrCodePreviewStyle(object) {
  const options = machineCodeOptions(object.props)
  return {
    ...previewPanelStyle(object, '#ffffff'),
    padding: `${mmToCssPx(options.margin)}px`,
  }
}
function qrCodeGridStyle(object) {
  const size = qrCodeSize(object)
  return {
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
    borderColor: previewForegroundColor(object),
  }
}
function qrCodeCellStyle(object, cell) {
  return {
    background: cell.dark ? previewForegroundColor(object) : previewBackgroundColor(object),
  }
}
function pageNumberContent(object) {
  const current = String(object.content || '1')
  const format = object.props?.format || '1'
  const totalPages = String(Math.max(1, Number(object.props?.totalPages) || 1))
  if (format === 'Page 1') {
    return `Page ${current}`
  }
  if (format === '1/N') {
    return `${current}/${totalPages}`
  }
  if (format === '第1页') {
    return `第 ${current} 页`
  }
  if (format === '第1页/共N页') {
    return `第 ${current} 页 / 共 N 页`
  }
  return current
}
function snapSourceLabel(source) {
  switch (source) {
    case 'page':
      return '页面'
    case 'guide':
      return '参考线'
    case 'grid':
      return '网格'
    default:
      return '吸附'
  }
}
function getPointerPointMm(event) {
  const paper = paperRef.value
  if (!paper) {
    return null
  }
  const paperRect = paper.getBoundingClientRect()
  const safeZoom = Number.isFinite(props.zoom) && props.zoom > 0 ? props.zoom : 1
  const localX = (event.clientX - paperRect.left) / safeZoom
  const localY = (event.clientY - paperRect.top) / safeZoom
  return {
    x: roundMm(localX / props.pixelsPerUnit),
    y: roundMm(localY / props.pixelsPerUnit),
  }
}
function clearCanvasSelection() {
  selectionStore.clearSelection()
  selectionStore.hoverObjectId = null
  selectionStore.activeHandle = null
  activeSnap.value = {
    x: null,
    y: null,
  }
}
function onCanvasSurfacePointerDown(event) {
  closeContextMenu()
  const target = event.target
  if (target instanceof Element && target.closest('.paper-canvas__interaction-layer')) {
    return
  }
  if (event.button !== 0) {
    clearCanvasSelection()
    return
  }
  const point = getPointerPointMm(event)
  if (!point) {
    clearCanvasSelection()
    return
  }
  selectionMarquee.value = {
    start: point,
    current: point,
    baseIds: event.shiftKey || event.ctrlKey || event.metaKey ? [...selectedIds.value] : [],
  }
  if (!selectionMarquee.value.baseIds.length) {
    clearCanvasSelection()
  }
  window.addEventListener('pointermove', onMarqueePointerMove)
  window.addEventListener('pointerup', onMarqueePointerUp)
}
function openContextMenu(object, event) {
  const group = currentPageGroups.value.find(candidate => candidate.elementIds?.includes(object.id))
  if (group) {
    selectionStore.selectGroup(group)
  }
  else if (!selectedIds.value.includes(object.id)) {
    selectionStore.select(object.id)
  }
  const point = getPointerPointMm(event)
  if (!point) {
    return
  }
  contextMenu.value = {
    x: Math.max(0, mmToCssPx(point.x)),
    y: Math.max(0, mmToCssPx(point.y)),
  }
}
function closeContextMenu() {
  contextMenu.value = null
}
function groupContextSelection() {
  const ids = selectedIds.value.filter(id => objectsById.value[id]?.pageId === currentPage.value?.id && !objectsById.value[id]?.locked)
  const result = createGroupCommand(documentStore, currentPage.value?.id, ids)
  if (result) {
    executeEditorCommand(historyStore, result.command)
    selectionStore.selectGroup(result.group)
  }
  closeContextMenu()
}
function ungroupContextSelection() {
  const selected = new Set(selectedIds.value)
  const groupIds = currentPageGroups.value.filter(group => group.elementIds?.some(id => selected.has(id))).map(group => group.id)
  const command = createUngroupCommand(documentStore, currentPage.value?.id, groupIds)
  if (command) {
    executeEditorCommand(historyStore, command)
  }
  closeContextMenu()
}
function deleteContextSelection() {
  const command = createRemoveObjectsCommand(documentStore, selectedIds.value)
  if (command) {
    executeEditorCommand(historyStore, command)
    selectionStore.clearSelection()
  }
  closeContextMenu()
}
function marqueeIntersects(object, bounds) {
  const right = object.x + object.width
  const bottom = object.y + object.height
  return right >= bounds.left && object.x <= bounds.right && bottom >= bounds.top && object.y <= bounds.bottom
}
function includeGroupedMembers(ids = []) {
  const selected = new Set(ids)
  currentPageGroups.value.forEach((group) => {
    if (group.elementIds?.some(id => selected.has(id))) {
      group.elementIds.forEach(id => selected.add(id))
    }
  })
  return [...selected]
}
function onMarqueePointerMove(event) {
  const marquee = selectionMarquee.value
  const point = getPointerPointMm(event)
  if (!marquee || !point) {
    return
  }
  marquee.current = point
  const bounds = {
    left: Math.min(marquee.start.x, point.x),
    right: Math.max(marquee.start.x, point.x),
    top: Math.min(marquee.start.y, point.y),
    bottom: Math.max(marquee.start.y, point.y),
  }
  const ids = pageObjects.value.filter(object => marqueeIntersects(object, bounds)).map(object => object.id)
  selectionStore.select(includeGroupedMembers([...marquee.baseIds, ...ids]))
}
function onMarqueePointerUp() {
  selectionMarquee.value = null
  window.removeEventListener('pointermove', onMarqueePointerMove)
  window.removeEventListener('pointerup', onMarqueePointerUp)
}
function stopObjectDrag() {
  window.removeEventListener('pointermove', onObjectPointerMove)
  window.removeEventListener('pointerup', onObjectPointerUp)
}
function onObjectLeave(objectId) {
  if (interactionState.value?.objectIds?.includes(objectId)) {
    return
  }
  if (hoverObjectId.value === objectId) {
    selectionStore.hoverObjectId = null
  }
}
function startObjectDrag(object, event) {
  if (event.button !== 0) {
    return
  }
  const point = getPointerPointMm(event)
  if (!point) {
    return
  }
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    const nextIds = selectedIds.value.includes(object.id)
      ? selectedIds.value.filter(id => id !== object.id)
      : [...selectedIds.value, object.id]
    selectionStore.select(nextIds)
    selectionStore.hoverObjectId = object.id
    selectionStore.activeHandle = null
    return
  }
  const group = currentPageGroups.value.find(candidate => candidate.elementIds?.includes(object.id))
  if (group) {
    selectionStore.selectGroup(group)
  }
  else if (!selectedIds.value.includes(object.id)) {
    selectionStore.select(object.id)
  }
  selectionStore.hoverObjectId = object.id
  selectionStore.activeHandle = null
  const objectIds = selectedIds.value.filter(id => objectsById.value[id]?.pageId === object.pageId && !objectsById.value[id]?.locked)
  if (!objectIds.length) {
    return
  }
  const startObjects = objectIds.map(id => ({
    id,
    x: objectsById.value[id].x,
    y: objectsById.value[id].y,
    width: objectsById.value[id].width,
    height: objectsById.value[id].height,
  }))
  interactionState.value = {
    mode: 'move',
    objectId: object.id,
    objectIds,
    startObjects,
    startPointerX: point.x,
    startPointerY: point.y,
    startObjectX: object.x,
    startObjectY: object.y,
    width: object.width,
    height: object.height,
  }
  stopObjectDrag()
  window.addEventListener('pointermove', onObjectPointerMove)
  window.addEventListener('pointerup', onObjectPointerUp)
}
function startObjectResize(object, handle, event) {
  if (event.button !== 0) {
    return
  }
  const point = getPointerPointMm(event)
  if (!point) {
    return
  }
  const group = currentPageGroups.value.find(candidate => candidate.elementIds?.includes(object.id))
  const groupObjects = group?.elementIds?.map(id => objectsById.value[id]).filter(Boolean) || []
  const canResizeGroup = groupObjects.length >= 2 && groupObjects.every(item => !item.locked)
  if (canResizeGroup) {
    selectionStore.selectGroup(group)
  }
  else {
    selectionStore.select(object.id)
  }
  selectionStore.hoverObjectId = object.id
  if (object.locked) {
    selectionStore.activeHandle = null
    return
  }
  selectionStore.activeHandle = handle
  const startObjects = canResizeGroup
    ? groupObjects.map(item => ({ id: item.id, x: item.x, y: item.y, width: item.width, height: item.height }))
    : []
  const groupBounds = canResizeGroup ? getObjectBounds(startObjects) : null
  interactionState.value = {
    mode: canResizeGroup ? 'resize-group' : 'resize',
    handle,
    objectId: object.id,
    objectIds: canResizeGroup ? startObjects.map(item => item.id) : [object.id],
    startObjects,
    groupBounds,
    startPointerX: point.x,
    startPointerY: point.y,
    startObjectX: object.x,
    startObjectY: object.y,
    startWidth: object.width,
    startHeight: object.height,
  }
  activeSnap.value = {
    x: null,
    y: null,
  }
  stopObjectDrag()
  window.addEventListener('pointermove', onObjectPointerMove)
  window.addEventListener('pointerup', onObjectPointerUp)
}
function getObjectBounds(objects = []) {
  const left = Math.min(...objects.map(item => item.x))
  const top = Math.min(...objects.map(item => item.y))
  const right = Math.max(...objects.map(item => item.x + item.width))
  const bottom = Math.max(...objects.map(item => item.y + item.height))
  return { x: left, y: top, width: right - left, height: bottom - top }
}
function clampResizeEdges(startRect, handle, deltaX, deltaY) {
  const minWidth = 0.1
  const minHeight = 0.1
  let left = startRect.x
  let right = startRect.x + startRect.width
  let top = startRect.y
  let bottom = startRect.y + startRect.height
  if (isAspectRatioLocked(startRect, handle)) {
    const aspectRatio = startRect.width / startRect.height || 1
    const maxWidthByPage = allowOverflowDrag.value
      ? Number.POSITIVE_INFINITY
      : handle.includes('w')
        ? right
        : pageWidthMm.value - left
    const maxHeightByPage = allowOverflowDrag.value
      ? Number.POSITIVE_INFINITY
      : handle.includes('n')
        ? bottom
        : pageHeightMm.value - top
    const widthLowerBound = Math.max(minWidth, minHeight * aspectRatio)
    const widthUpperBound = Math.min(maxWidthByPage, maxHeightByPage * aspectRatio)
    const heightLowerBound = Math.max(minHeight, minWidth / aspectRatio)
    const heightUpperBound = Math.min(maxHeightByPage, maxWidthByPage / aspectRatio)
    const rawWidth = handle.includes('w') ? startRect.width - deltaX : startRect.width + deltaX
    const rawHeight = handle.includes('n') ? startRect.height - deltaY : startRect.height + deltaY
    const widthDeltaRatio = Math.abs(rawWidth - startRect.width) / Math.max(startRect.width, 0.001)
    const heightDeltaRatio = Math.abs(rawHeight - startRect.height) / Math.max(startRect.height, 0.001)
    let nextWidth
    let nextHeight
    if (widthDeltaRatio >= heightDeltaRatio) {
      nextWidth = clamp(rawWidth, widthLowerBound, widthUpperBound)
      nextHeight = nextWidth / aspectRatio
    }
    else {
      nextHeight = clamp(rawHeight, heightLowerBound, heightUpperBound)
      nextWidth = nextHeight * aspectRatio
    }
    if (handle.includes('w')) {
      left = right - nextWidth
    }
    if (handle.includes('n')) {
      top = bottom - nextHeight
    }
    return {
      x: roundMm(left),
      y: roundMm(top),
      width: roundMm(nextWidth),
      height: roundMm(nextHeight),
    }
  }
  if (handle.includes('w')) {
    const minLeft = allowOverflowDrag.value ? Number.NEGATIVE_INFINITY : 0
    const maxLeft = right - minWidth
    left = clamp(startRect.x + deltaX, minLeft, maxLeft)
  }
  if (handle.includes('e')) {
    const minRight = left + minWidth
    const maxRight = allowOverflowDrag.value ? Number.POSITIVE_INFINITY : pageWidthMm.value
    right = clamp(startRect.x + startRect.width + deltaX, minRight, maxRight)
  }
  if (handle.includes('n')) {
    const minTop = allowOverflowDrag.value ? Number.NEGATIVE_INFINITY : 0
    const maxTop = bottom - minHeight
    top = clamp(startRect.y + deltaY, minTop, maxTop)
  }
  if (handle.includes('s')) {
    const minBottom = top + minHeight
    const maxBottom = allowOverflowDrag.value ? Number.POSITIVE_INFINITY : pageHeightMm.value
    bottom = clamp(startRect.y + startRect.height + deltaY, minBottom, maxBottom)
  }
  const width = roundMm(Math.max(minWidth, right - left))
  const height = roundMm(Math.max(minHeight, bottom - top))
  return {
    x: roundMm(left),
    y: roundMm(top),
    width,
    height,
  }
}
function onObjectPointerMove(event) {
  const drag = interactionState.value
  const point = getPointerPointMm(event)
  if (!drag || !point) {
    viewportStore.clearCoordinateReadout()
    return
  }
  const insidePage = point.x >= 0 && point.x <= pageWidthMm.value && point.y >= 0 && point.y <= pageHeightMm.value
  if (drag.mode === 'resize-group') {
    const nextBounds = clampResizeEdges(drag.groupBounds, drag.handle, point.x - drag.startPointerX, point.y - drag.startPointerY)
    const scaleX = nextBounds.width / Math.max(0.01, drag.groupBounds.width)
    const scaleY = nextBounds.height / Math.max(0.01, drag.groupBounds.height)
    const patches = drag.startObjects.map(item => ({
      id: item.id,
      patch: {
        x: roundMm(nextBounds.x + (item.x - drag.groupBounds.x) * scaleX),
        y: roundMm(nextBounds.y + (item.y - drag.groupBounds.y) * scaleY),
        width: roundMm(Math.max(0.1, item.width * scaleX)),
        height: roundMm(Math.max(0.1, item.height * scaleY)),
      },
    }))
    documentStore.applyObjectPatches(patches)
    selectionStore.activeHandle = drag.handle
    if (insidePage) {
      viewportStore.setPointerCoordinate(point.x, point.y, true)
    }
    return
  }
  if (drag.mode === 'resize') {
    const rawRect = clampResizeEdges({
      type: objectsById.value[drag.objectId]?.type,
      props: objectsById.value[drag.objectId]?.props,
      x: drag.startObjectX,
      y: drag.startObjectY,
      width: drag.startWidth,
      height: drag.startHeight,
    }, drag.handle, point.x - drag.startPointerX, point.y - drag.startPointerY)
    const resizeSnapResult = snapEnabled.value
      ? resolveResizeSnap(rawRect, {
          type: objectsById.value[drag.objectId]?.type,
          props: objectsById.value[drag.objectId]?.props,
          x: drag.startObjectX,
          y: drag.startObjectY,
          width: drag.startWidth,
          height: drag.startHeight,
        }, drag.handle)
      : null
    const nextRect = resizeSnapResult?.rect || rawRect
    activeSnap.value = resizeSnapResult?.activeSnap || { x: null, y: null }
    selectionStore.activeHandle = drag.handle
    if (insidePage) {
      viewportStore.setPointerCoordinate(point.x, point.y, true)
    }
    else {
      viewportStore.clearCoordinateReadout()
    }
    documentStore.updateObjectProps(drag.objectId, nextRect)
    return
  }
  const rawX = roundMm(drag.startObjectX + (point.x - drag.startPointerX))
  const rawY = roundMm(drag.startObjectY + (point.y - drag.startPointerY))
  const snapResult = snapEnabled.value
    ? resolveObjectSnap({
        x: rawX,
        y: rawY,
        width: drag.width,
        height: drag.height,
        pageWidthMm: pageWidthMm.value,
        pageHeightMm: pageHeightMm.value,
        verticalGuides: guidesVisible.value ? verticalGuides.value : [],
        horizontalGuides: guidesVisible.value ? horizontalGuides.value : [],
        gridSpacingMm: gridVisible.value ? gridDefinition.value.minorMm : null,
        pixelsPerUnit: props.pixelsPerUnit * props.zoom,
      })
    : null
  const targetX = snapResult ? snapResult.x : rawX
  const targetY = snapResult ? snapResult.y : rawY
  const nextX = clampObjectPosition(targetX, drag.width, pageWidthMm.value)
  const nextY = clampObjectPosition(targetY, drag.height, pageHeightMm.value)
  activeSnap.value = snapResult?.activeSnap || { x: null, y: null }
  if (insidePage) {
    viewportStore.setPointerCoordinate(point.x, point.y, true)
  }
  else {
    viewportStore.clearCoordinateReadout()
  }
  const deltaX = nextX - drag.startObjectX
  const deltaY = nextY - drag.startObjectY
  const patches = drag.startObjects.map(item => ({
    id: item.id,
    patch: {
      x: clampObjectPosition(item.x + deltaX, item.width, pageWidthMm.value),
      y: clampObjectPosition(item.y + deltaY, item.height, pageHeightMm.value),
    },
  }))
  documentStore.applyObjectPatches(patches)
}
function onObjectPointerUp() {
  const drag = interactionState.value
  if (!drag) {
    stopObjectDrag()
    return
  }
  const currentObject = objectsById.value[drag.objectId]
  if (currentObject) {
    if (drag.mode === 'resize-group') {
      const patches = drag.startObjects.map((item) => {
        const current = objectsById.value[item.id]
        return current ? { id: item.id, patch: { x: current.x, y: current.y, width: current.width, height: current.height } } : null
      }).filter(Boolean)
      const changed = patches.some(({ id, patch }) => {
        const previous = drag.startObjects.find(item => item.id === id)
        return previous && (previous.x !== patch.x || previous.y !== patch.y || previous.width !== patch.width || previous.height !== patch.height)
      })
      if (changed) {
        executeEditorCommand(historyStore, createPatchTransactionCommand(documentStore, 'Resize group', patches, { previousPatches: drag.startObjects.map(item => ({ id: item.id, patch: { x: item.x, y: item.y, width: item.width, height: item.height } })) }))
      }
    }
    else if (drag.mode === 'resize') {
      const previousPatch = {
        x: drag.startObjectX,
        y: drag.startObjectY,
        width: drag.startWidth,
        height: drag.startHeight,
      }
      const nextPatch = {
        x: currentObject.x,
        y: currentObject.y,
        width: currentObject.width,
        height: currentObject.height,
      }
      if (previousPatch.x !== nextPatch.x
        || previousPatch.y !== nextPatch.y
        || previousPatch.width !== nextPatch.width
        || previousPatch.height !== nextPatch.height) {
        executeEditorCommand(historyStore, createTransformObjectCommand(documentStore, drag.objectId, previousPatch, nextPatch, 'Resize'))
      }
    }
    else {
      const patches = drag.startObjects.map((item) => {
        const current = objectsById.value[item.id]
        return current ? { id: item.id, patch: { x: current.x, y: current.y } } : null
      }).filter(Boolean)
      const changed = patches.some(({ id, patch }) => {
        const previous = drag.startObjects.find(item => item.id === id)
        return previous && (previous.x !== patch.x || previous.y !== patch.y)
      })
      if (changed) {
        if (patches.length === 1) {
          const previous = drag.startObjects[0]
          executeEditorCommand(historyStore, createMoveObjectCommand(documentStore, previous.id, { x: previous.x, y: previous.y }, patches[0].patch))
        }
        else {
          executeEditorCommand(historyStore, createPatchTransactionCommand(documentStore, 'Move selection', patches, { previousPatches: drag.startObjects.map(item => ({ id: item.id, patch: { x: item.x, y: item.y } })) }))
        }
      }
    }
  }
  interactionState.value = null
  selectionStore.activeHandle = null
  activeSnap.value = {
    x: null,
    y: null,
  }
  stopObjectDrag()
}
onBeforeUnmount(() => {
  stopObjectDrag()
  onMarqueePointerUp()
})
</script>

<template>
  <article
    ref="paperRef"
    class="paper-canvas"
    :class="{ 'paper-canvas--outline-hidden': !pageOutlineVisible }"
    :style="paperStyle"
  >
    <div v-if="gridVisible" class="paper-canvas__grid" :style="gridStyle" />

    <div class="paper-canvas__safe-area" :class="{ 'is-hidden': !safeAreaVisible }" :style="safeAreaStyle">
      <span v-if="safeAreaVisible" class="paper-canvas__safe-label">安全区</span>
    </div>

    <div v-if="pageCornerVisible" class="paper-canvas__corner-marks">
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--top-left" />
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--top-right" />
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--bottom-left" />
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--bottom-right" />
    </div>

    <div
      v-if="headerLineVisible"
      class="paper-canvas__print-line paper-canvas__print-line--header"
      :style="headerLineStyle"
    />
    <div
      v-if="footerLineVisible"
      class="paper-canvas__print-line paper-canvas__print-line--footer"
      :style="footerLineStyle"
    />

    <div
      v-if="activeSnap.x"
      class="paper-canvas__snap-line paper-canvas__snap-line--vertical"
      :style="{ left: `${mmToRoundedCssPx(activeSnap.x.position)}px` }"
    >
      <span class="paper-canvas__snap-label">{{ snapSourceLabel(activeSnap.x.source) }}</span>
    </div>
    <div
      v-if="activeSnap.y"
      class="paper-canvas__snap-line paper-canvas__snap-line--horizontal"
      :style="{ top: `${mmToRoundedCssPx(activeSnap.y.position)}px` }"
    >
      <span class="paper-canvas__snap-label">{{ snapSourceLabel(activeSnap.y.source) }}</span>
    </div>

    <div class="paper-canvas__content-surface" @pointerdown="onCanvasSurfacePointerDown">
      <div v-if="selectionMarquee" class="paper-canvas__selection-marquee" :style="selectionMarqueeStyle" />
      <div class="paper-canvas__object-layer">
        <div
          v-for="object in pageObjects"
          :key="object.id"
          class="paper-canvas__object-node"
          :class="{
            'is-selected': selectedIds.includes(object.id),
            'is-hovered': hoverObjectId === object.id,
            'is-dragging': interactionState?.objectIds?.includes(object.id),
            'is-auto-height': isAutoHeightTextObject(object),
            'is-outside-safe-area': isOutsideSafeArea(object),
          }"
          :style="objectFrameStyle(object)"
          @pointerenter="hoverObjectId = object.id"
          @pointerleave="onObjectLeave(object.id)"
          @contextmenu.prevent="openContextMenu(object, $event)"
        >
          <div class="paper-canvas__object-content" :class="`is-${object.type}`" :style="objectContentStyle(object)">
            <ElementRenderer :object="object" @start-object-drag="startObjectDrag(object, $event)" />
          </div>

          <div
            class="paper-canvas__interaction-layer"
            :class="{ 'is-content-editing': ['table', 'text'].includes(object.type) && selectedIds.includes(object.id) && !object.locked }"
            @pointerdown.stop="startObjectDrag(object, $event)"
          >
            <span v-if="selectedIds.includes(object.id)" class="paper-canvas__selection-chrome" aria-hidden="true">
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--top-left" />
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--top-right" />
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--bottom-left" />
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--bottom-right" />
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--top" />
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--right" />
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--bottom" />
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--left" />
            </span>

            <template v-if="selectedIds.includes(object.id)">
              <button
                v-for="handle in visibleResizeHandles(object)"
                :key="handle.key"
                type="button"
                class="paper-canvas__selection-handle"
                :class="[
                  `paper-canvas__selection-handle--${handle.key}`,
                  { 'is-active': activeHandle === handle.key },
                ]"
                :aria-label="handle.label"
                @pointerdown.stop.prevent="startObjectResize(object, handle.key, $event)"
              />
            </template>

            <span class="paper-canvas__type-badge">{{ elementLabel(object.type) }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="contextMenu"
        class="paper-canvas__context-menu"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @pointerdown.stop
      >
        <button type="button" :disabled="selectedIds.length < 2" @click="groupContextSelection">
          编组
        </button>
        <button type="button" :disabled="!hasContextGroup" @click="ungroupContextSelection">
          取消编组
        </button>
        <button type="button" @click="deleteContextSelection">
          删除
        </button>
      </div>

      <div v-if="!pageObjects.length" class="paper-canvas__empty-state">
        <div class="paper-canvas__empty-badge">
          {{ canvasEmptyState.badge }}
        </div>
        <h2>{{ canvasEmptyState.title }}</h2>
        <p>{{ canvasEmptyState.description }}</p>
        <div class="paper-canvas__empty-actions">
          <span>{{ canvasEmptyState.helper }}</span>
          <span v-for="chip in canvasEmptyState.chips" :key="chip" class="paper-canvas__empty-chip">{{ chip }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.paper-canvas {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #d8dee8;
  box-shadow: none;
}

.paper-canvas--outline-hidden {
  border-color: transparent;
}

.paper-canvas__grid,
.paper-canvas__corner-marks,
.paper-canvas__object-layer {
  position: absolute;
  inset: 0;
}

.paper-canvas__grid,
.paper-canvas__corner-marks {
  pointer-events: none;
}

.paper-canvas__safe-area {
  position: absolute;
  border: 1px dashed rgba(100, 116, 139, 0.55);
  background: rgba(248, 250, 252, 0.22);
  pointer-events: none;
}

.paper-canvas__safe-area.is-hidden {
  border-color: transparent;
  background: transparent;
}

.paper-canvas__safe-label {
  position: absolute;
  top: -1px;
  left: 14px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #64748b;
  font-size: 11px;
  line-height: 1.4;
}

.paper-canvas__corner-mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.75);
}

.paper-canvas__corner-mark--top-left {
  top: -1px;
  left: -1px;
  border-width: 1px 0 0 1px;
}

.paper-canvas__corner-mark--top-right {
  top: -1px;
  right: -1px;
  border-width: 1px 1px 0 0;
}

.paper-canvas__corner-mark--bottom-left {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 1px 1px;
}

.paper-canvas__corner-mark--bottom-right {
  right: -1px;
  bottom: -1px;
  border-width: 0 1px 1px 0;
}

.paper-canvas__print-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(15, 23, 42, 0.55);
  pointer-events: none;
}

.paper-canvas__snap-line {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.paper-canvas__snap-line--vertical {
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(244, 114, 182, 0.95);
}

.paper-canvas__snap-line--horizontal {
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(244, 114, 182, 0.95);
}

.paper-canvas__snap-label {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border: 1px solid rgba(244, 114, 182, 0.28);
  background: rgba(255, 255, 255, 0.96);
  color: #9d174d;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.paper-canvas__content-surface {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.paper-canvas__object-node {
  position: absolute;
  box-sizing: border-box;
}

.paper-canvas__object-content {
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden;
  border: 1px solid transparent;
  background: transparent;
}

.paper-canvas__object-node.is-auto-height .paper-canvas__object-content {
  position: relative;
  inset: auto;
  min-height: 100%;
  overflow: visible;
}

.paper-canvas__binding-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1;
  max-width: calc(100% - 8px);
  padding: 1px 6px;
  border: 1px solid rgba(29, 78, 216, 0.18);
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.86);
  color: #1d4ed8;
  font-size: 9px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.paper-canvas__interaction-layer {
  position: absolute;
  inset: 0;
  padding: 0;
  margin: 0;
  border: 1px solid transparent;
  background: transparent;
  cursor: move;
}

.paper-canvas__selection-marquee {
  position: absolute;
  z-index: 20;
  box-sizing: border-box;
  border: 1px dashed #2563eb;
  background: rgba(37, 99, 235, 0.08);
  pointer-events: none;
}

.paper-canvas__context-menu {
  position: absolute;
  z-index: 30;
  display: flex;
  min-width: 112px;
  flex-direction: column;
  padding: 4px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.18);
}

.paper-canvas__context-menu button {
  padding: 7px 10px;
  border: 0;
  background: transparent;
  color: #1e293b;
  font-size: 12px;
  text-align: left;
}

.paper-canvas__context-menu button:hover:not(:disabled) { background: #eff6ff; color: #1d4ed8; }
.paper-canvas__context-menu button:disabled { color: #94a3b8; }

.paper-canvas__object-node.is-outside-safe-area:not(.is-selected)::after {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 7px;
  height: 7px;
  border: 1px solid #ffffff;
  border-radius: 50%;
  background: #d97706;
  content: "";
  pointer-events: none;
}

.paper-canvas__interaction-layer.is-content-editing {
  pointer-events: none;
  cursor: default;
}

.paper-canvas__interaction-layer.is-content-editing .paper-canvas__selection-handle {
  pointer-events: auto;
}

.paper-canvas__object-node.is-hovered .paper-canvas__interaction-layer {
  border-style: dashed;
  border-color: rgba(148, 163, 184, 0.45);
}

.paper-canvas__object-node.is-selected .paper-canvas__interaction-layer {
  border-style: solid;
  border-color: rgba(59, 130, 246, 0.28);
}

.paper-canvas__object-node.is-dragging .paper-canvas__interaction-layer {
  border-style: dashed;
  border-color: rgba(37, 99, 235, 0.72);
}

.paper-canvas__selection-chrome {
  position: absolute;
  inset: -1px;
  pointer-events: none;
  border: 1px solid rgba(59, 130, 246, 0.98);
}

.paper-canvas__selection-handle {
  position: absolute;
  z-index: 2;
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1px solid #ffffff;
  background: #3b82f6;
}

.paper-canvas__selection-handle.is-active {
  background: #1d4ed8;
}

.paper-canvas__selection-corner,
.paper-canvas__selection-edge {
  position: absolute;
  background: #3b82f6;
}

.paper-canvas__selection-corner {
  width: 10px;
  height: 10px;
}

.paper-canvas__selection-corner--top-left {
  top: -1px;
  left: -1px;
}

.paper-canvas__selection-corner--top-right {
  top: -1px;
  right: -1px;
}

.paper-canvas__selection-corner--bottom-left {
  left: -1px;
  bottom: -1px;
}

.paper-canvas__selection-corner--bottom-right {
  right: -1px;
  bottom: -1px;
}

.paper-canvas__selection-edge--top,
.paper-canvas__selection-edge--bottom {
  left: 50%;
  width: 14px;
  height: 4px;
  transform: translateX(-50%);
}

.paper-canvas__selection-edge--top {
  top: -2px;
}

.paper-canvas__selection-edge--bottom {
  bottom: -2px;
}

.paper-canvas__selection-edge--left,
.paper-canvas__selection-edge--right {
  top: 50%;
  width: 4px;
  height: 14px;
  transform: translateY(-50%);
}

.paper-canvas__selection-edge--left {
  left: -2px;
}

.paper-canvas__selection-edge--right {
  right: -2px;
}

.paper-canvas__selection-handle--nw,
.paper-canvas__selection-handle--se {
  cursor: nwse-resize;
}

.paper-canvas__selection-handle--ne,
.paper-canvas__selection-handle--sw {
  cursor: nesw-resize;
}

.paper-canvas__selection-handle--n,
.paper-canvas__selection-handle--s {
  cursor: ns-resize;
}

.paper-canvas__selection-handle--e,
.paper-canvas__selection-handle--w {
  cursor: ew-resize;
}

.paper-canvas__selection-handle--nw {
  top: -5px;
  left: -5px;
}

.paper-canvas__selection-handle--n {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.paper-canvas__selection-handle--ne {
  top: -5px;
  right: -5px;
}

.paper-canvas__selection-handle--e {
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
}

.paper-canvas__selection-handle--se {
  right: -5px;
  bottom: -5px;
}

.paper-canvas__selection-handle--s {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.paper-canvas__selection-handle--sw {
  left: -5px;
  bottom: -5px;
}

.paper-canvas__selection-handle--w {
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
}

.paper-canvas__type-badge {
  position: absolute;
  top: -22px;
  left: -1px;
  padding: 1px 6px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  line-height: 1.6;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.paper-canvas__object-node.is-selected .paper-canvas__type-badge,
.paper-canvas__object-node.is-hovered .paper-canvas__type-badge {
  opacity: 1;
}

.paper-canvas__text-content,
.paper-canvas__page-number-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
}

.paper-canvas__object-node.is-auto-height .paper-canvas__text-content {
  height: auto;
  min-height: 100%;
  overflow: visible;
}

.paper-canvas__page-number-content {
  min-width: 0;
}

.paper-canvas__image-shell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.paper-canvas__image-content {
  width: 100%;
  height: 100%;
  display: block;
}

.paper-canvas__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  color: #6b7280;
}

.paper-canvas__image-placeholder span {
  font-size: 13px;
  font-weight: 600;
}

.paper-canvas__image-placeholder small {
  font-size: 11px;
}

.paper-canvas__line-shape {
  width: 100%;
  margin-top: auto;
  margin-bottom: auto;
  border-top-width: inherit;
  border-top-style: inherit;
  border-top-color: inherit;
}

.paper-canvas__rect-shape,
.paper-canvas__circle-shape {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.paper-canvas__circle-shape {
  border-radius: 999px;
}

.paper-canvas__barcode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: #ffffff;
}

.paper-canvas__barcode-bars {
  height: calc(100% - 20px);
  min-height: 24px;
  background-image:
    linear-gradient(
      90deg,
      #111827 0,
      #111827 2px,
      transparent 2px,
      transparent 4px,
      #111827 4px,
      #111827 7px,
      transparent 7px,
      transparent 9px,
      #111827 9px,
      #111827 10px,
      transparent 10px,
      transparent 12px
    );
  background-size: 12px 100%;
}

.paper-canvas__barcode-value {
  text-align: center;
  font-size: 11px;
  letter-spacing: 1px;
  color: #111827;
}

.paper-canvas__qrcode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  padding: 10px;
  background: #ffffff;
}

.paper-canvas__qrcode-grid {
  display: grid;
  width: 100%;
  flex: 1;
  min-height: 0;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border: 1px solid #111827;
}

.paper-canvas__qrcode-grid span {
  background: #ffffff;
}

.paper-canvas__qrcode-grid span.is-dark {
  background: #111827;
}

.paper-canvas__qrcode-caption {
  min-width: 0;
  color: #6b7280;
  font-size: 10px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-canvas__table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid currentColor;
  background: #ffffff;
  font-size: 10px;
  color: #111827;
  overflow: hidden;
}

.paper-canvas__binding-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
  background: rgba(248, 250, 252, 0.9);
}

.paper-canvas__binding-pill {
  max-width: 100%;
  padding: 1px 6px;
  border: 1px solid rgba(59, 130, 246, 0.24);
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.68);
  font-size: 9px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-canvas__table-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  background: rgba(248, 250, 252, 0.92);
}

.paper-canvas__table-head,
.paper-canvas__table-row,
.paper-canvas__table-footer {
  display: grid;
}

.paper-canvas__table-head {
  background: var(--table-head-background, rgba(148, 163, 184, 0.16));
  font-weight: 700;
  color: var(--table-head-color, #111827);
  min-height: var(--table-head-min-height, auto);
}

.paper-canvas__table-head span,
.paper-canvas__table-row span,
.paper-canvas__table-footer span {
  padding: var(--table-cell-padding-y, 4px) var(--table-cell-padding-x, 6px);
  border-right: var(--table-grid-border-width, 1px) var(--table-grid-border-style, solid)
    var(--table-grid-border-color, currentColor);
  border-bottom: var(--table-grid-border-width, 1px) var(--table-grid-border-style, solid)
    var(--table-grid-border-color, currentColor);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.paper-canvas__table-head span:last-child,
.paper-canvas__table-row span:last-child,
.paper-canvas__table-footer span:last-child {
  border-right: 0;
}

.paper-canvas__table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.paper-canvas__table-row {
  min-height: var(--table-row-min-height, 0);
}

.paper-canvas__table-omission {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.paper-canvas__table-footer {
  background: var(--table-footer-background, rgba(59, 130, 246, 0.08));
  font-weight: 600;
  color: var(--table-footer-color, #111827);
  min-height: var(--table-footer-min-height, auto);
}

.paper-canvas__table-footer:last-of-type span {
  border-bottom: 0;
}

.paper-canvas__multi-label-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-canvas__multi-label-shell .paper-canvas__binding-strip {
  padding: 0;
  border-bottom: 0;
  background: transparent;
}

.paper-canvas__multi-label {
  display: grid;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 6px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.96));
}

.paper-canvas__multi-label-cell {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 6px;
  border: 1px dashed rgba(100, 116, 139, 0.7);
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  overflow: hidden;
}

.paper-canvas__multi-label-cell strong,
.paper-canvas__multi-label-cell small {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.paper-canvas__multi-label-cell strong {
  font-size: var(--multi-label-primary-size, 10px);
  font-weight: var(--multi-label-primary-weight, 700);
}

.paper-canvas__multi-label-cell small {
  color: var(--multi-label-secondary-color, #475569);
  font-size: var(--multi-label-secondary-size, 9px);
}

.paper-canvas__multi-label-index {
  position: absolute;
  top: 4px;
  right: 6px;
  color: var(--multi-label-index-color, #94a3b8);
  font-size: var(--multi-label-index-size, 8px);
  line-height: 1;
}

.paper-canvas__generic-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
}

.paper-canvas__empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px;
  text-align: center;
}

.paper-canvas__empty-badge {
  padding: 7px 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.paper-canvas__empty-state h2 {
  margin: 0;
  max-width: 460px;
  font-size: 24px;
  line-height: 1.35;
  color: #111827;
}

.paper-canvas__empty-state p {
  margin: 0;
  max-width: 460px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}

.paper-canvas__empty-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.paper-canvas__empty-chip {
  padding: 4px 8px;
  border: 1px solid #dbe4ef;
  background: #f8fbff;
  color: #49688f;
}
</style>
