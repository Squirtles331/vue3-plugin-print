<script setup lang="ts">
import { normalizeTableColumns, shouldRenderTableCell, tableCellColSpan, tableCellDisplayValue, tableCellRowSpan, tableCellStyle as tableDescriptorStyle, tableRowHeight } from '../core/tableModel.js'
import { formatTableSummaryCell } from '../core/tableSummary.js'
import { resolveRuntimeTemplate } from './dataResolver.js'
import { createRuntimePageStyle, hasRuntimePrintMarks } from './pageStyle.js'
import { paginateRuntimeDocument } from './pagination.js'
import { formatTableValue, imageObjectPosition, machineCodeOptions, resolveRelativeRecordPath } from './propertySemantics.js'

const props = defineProps({ document: { type: Object, required: true }, runtimeData: { type: Object, default: () => ({}) }, mode: { type: String, default: 'preview' } })
const RuntimeBarcode = defineAsyncComponent(() => import('./RuntimeBarcode.vue'))
const RuntimeQrCode = defineAsyncComponent(() => import('./RuntimeQrCode.vue'))
const resolved = computed(() => resolveRuntimeTemplate(props.document, props.runtimeData))
const paginated = computed(() => paginateRuntimeDocument(resolved.value.document))
const issues = computed(() => resolved.value.issues || [])
const pageStyle = computed(() => createRuntimePageStyle(props.document))
const hasPrintMarks = computed(() => hasRuntimePrintMarks(props.document))
function printableElements(page) { return (page.elements || []).filter(element => element.visible !== false && element.printable !== false) }
function elementStyle(element) { const style = element.style || {}; const isTable = element.type === 'table'; const autoHeight = element.type === 'text' && element.props?.autoHeight === true; const contentHeight = isTable || autoHeight; const vertical = ({ top: 'flex-start', middle: 'center', bottom: 'flex-end' })[style.verticalAlign] || 'flex-start'; const horizontal = ({ left: 'flex-start', center: 'center', right: 'flex-end' })[style.textAlign] || 'flex-start'; return { left: `${element.x || 0}mm`, top: `${element.y || 0}mm`, width: `${element.width || 1}mm`, height: contentHeight ? 'auto' : `${element.height || 1}mm`, minHeight: autoHeight ? `${element.height || 1}mm` : undefined, overflow: contentHeight ? 'visible' : 'hidden', transform: `rotate(${Number(element.rotation) || 0}deg)`, zIndex: Number(element.zIndex) || 0, color: style.color || '#111827', background: style.backgroundColor || 'transparent', fontFamily: style.fontFamily || undefined, fontSize: `${Number(style.fontSize) || 12}px`, fontWeight: style.fontWeight || 'normal', fontStyle: style.fontStyle || 'normal', textDecoration: style.textDecoration || 'none', textAlign: style.textAlign || 'left', lineHeight: style.lineHeight || 1.4, letterSpacing: `${Number(style.letterSpacing) || 0}px`, border: isTable ? '0 solid transparent' : `${Number(style.borderWidth) || 0}px ${style.borderStyle || 'solid'} ${style.borderColor || 'transparent'}`, borderRadius: `${Number(style.borderRadius) || 0}px`, padding: isTable ? '0' : `${Number(style.padding) || 0}mm`, boxSizing: 'border-box', opacity: Number.isFinite(Number(style.opacity)) ? Number(style.opacity) : 1, alignItems: vertical, justifyContent: horizontal, whiteSpace: element.props?.whiteSpace || 'pre-wrap', writingMode: element.props?.writingMode || 'horizontal-tb' } }
function textValue(value, fallback) { return value?.value || (props.mode === 'print' ? '' : fallback) }
function valueClass(value) { return value?.status === 'missing' || value?.status === 'empty' ? 'runtime-placeholder' : '' }
function imageSource(element) { return String(element.runtime?.value?.value || '').trim() }
function columnKey(column) { return column?.key || '' }
function tableColumns(element) { return normalizeTableColumns(element.runtime?.table?.columns || []) }
function tableRows(element) { return element.runtime?.table?.rows || [] }
function tableAllRows(element) { return element.runtime?.table?.allRows || tableRows(element) }
function tableDisplayRows(element) {
  const rows = tableRows(element)
  if (rows.length)
    return rows
  return props.mode === 'print' ? [] : [null]
}
function tableFooterRows(element) { return element.runtime?.table?.footerRows || [] }
function hasBlankTableHeaders(element) {
  if (element.props?.blankHeaders === true)
    return true
  const columns = tableColumns(element)
  return columns.length > 0 && columns.every((column, index) => { const key = String(column?.key || `field${index + 1}`); const title = typeof column?.title === 'string' ? column.title.trim() : ''; return key === `field${index + 1}` && (!title || title === key || /^列\s*\d+$/.test(title)) })
}
function tableHeaderValue(element, column) {
  if (hasBlankTableHeaders(element))
    return ''
  return typeof column?.title === 'string' ? column.title : ''
}
function tableColumnStyle(column) { return { width: `${Math.max(1, Number(column?.width) || 1)}px` } }
function tableRowStyle(element, section, rowIndex) { const offset = section === 'body' ? Math.max(0, Number(element.runtime?.table?.rowOffset) || 0) : 0; const height = tableRowHeight(element.props, section, rowIndex + offset); return height > 0 ? { height: `${height}mm` } : {} }
function runtimeTableRawCell(row, column) { return row?.[columnKey(column)] }
function shouldRenderRuntimeTableCell(row, column) { return shouldRenderTableCell(runtimeTableRawCell(row, column)) }
function runtimeTableCellRowSpan(row, column) { const value = tableCellRowSpan(runtimeTableRawCell(row, column)); return value > 1 ? value : undefined }
function runtimeTableCellColSpan(row, column) { const value = tableCellColSpan(runtimeTableRawCell(row, column)); return value > 1 ? value : undefined }
function tableCellStyle(element, column, section = 'body', row = null) { const style = element.style || {}; const cellStyle = tableDescriptorStyle(runtimeTableRawCell(row, column)); const textAlign = cellStyle.textAlign || column?.align || (section === 'header' ? style.headerTextAlign : section === 'footer' ? style.footerTextAlign : style.textAlign) || 'left'; const color = cellStyle.color || (section === 'header' ? style.headerColor : section === 'footer' ? style.footerColor : style.color) || 'inherit'; return { textAlign, color, backgroundColor: cellStyle.backgroundColor || undefined, verticalAlign: cellStyle.verticalAlign || style.verticalAlign || 'top', fontSize: cellStyle.fontSize || undefined, fontWeight: cellStyle.fontWeight || undefined, fontStyle: cellStyle.fontStyle || undefined, textDecoration: cellStyle.textDecoration || undefined, borderColor: style.borderColor || 'currentColor', borderWidth: `${Number(style.borderWidth) || 1}px`, borderStyle: style.borderStyle || 'solid', padding: `${Number(style.padding) || 0}mm`, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', ...cellStyle } }
function tableCellValue(row, column, element, section = 'body') {
  if (row == null)
    return ''
  const result = resolveRelativeRecordPath(row, column?.valuePath || columnKey(column))
  const value = result.found ? result.value : runtimeTableRawCell(row, column)
  const sourceRows = section === 'footer' ? tableRows(element) : tableRows(element)
  const text = tableCellDisplayValue(value, sourceRows)
  return formatTableValue(formatTableSummaryCell(text, { pageRows: tableRows(element), totalRows: tableAllRows(element) }), column?.formatter)
}
function tableHeaderStyle(element) { const style = element.style || {}; return { background: style.headerBackgroundColor || style.backgroundColor || 'transparent', color: style.headerColor || style.color || 'inherit', fontSize: `${Number(style.headerFontSize) || Number(style.fontSize) || 12}px`, textAlign: style.headerTextAlign || style.textAlign || 'left' } }
function tableFooterStyle(element) { const style = element.style || {}; return { background: style.footerBackgroundColor || style.backgroundColor || 'transparent', color: style.footerColor || style.color || 'inherit', fontSize: `${Number(style.footerFontSize) || Number(style.fontSize) || 12}px`, textAlign: style.footerTextAlign || style.textAlign || 'left' } }
function multiLabelStyle(element) { return { gridTemplateColumns: `repeat(${Math.max(1, Number(element.props?.cols) || 1)}, 1fr)`, gridTemplateRows: `repeat(${Math.max(1, Number(element.props?.rows) || 1)}, 1fr)`, gridAutoFlow: element.props?.direction === 'column' ? 'column' : 'row', gap: `${Number(element.props?.gapY) || 0}mm ${Number(element.props?.gapX) || 0}mm` } }
function multiLabelItems(element) { const total = Math.max(1, Number(element.props?.rows) || 1) * Math.max(1, Number(element.props?.cols) || 1); const rows = element.runtime?.multiLabel?.rows || []; return Array.from({ length: total }, (_, index) => rows[index] ?? null) }
function labelValue(item, path) {
  if (item == null)
    return ''
  if (typeof item !== 'object')
    return path ? (props.mode === 'print' ? '' : `{{${path}}}`) : String(item)
  const result = resolveRelativeRecordPath(item, path)
  return result.found && result.value != null ? String(result.value) : path ? (props.mode === 'print' ? '' : `{{${path}}}`) : ''
}
function labelPrimary(item, element, index) {
  if (item == null)
    return props.mode === 'print' ? '' : element.runtime?.multiLabel?.status === 'missing' ? `{{${element.props?.dataVariable}[${index}]}}` : 'Unbound label'
  return labelValue(item, element.props?.primaryPath)
}
function pageNumberValue(element, pageRuntime) {
  const current = pageRuntime?.pageNumber || 1
  const total = pageRuntime?.pageCount || 1
  const format = element.props?.format || '1'
  if (format === '1')
    return String(current)
  return String(format).replaceAll('N', total).replaceAll('1', current)
}
</script>

<template>
  <section class="runtime-document" :class="`runtime-document--${mode}`">
    <p v-for="issue in issues" :key="`${issue.path}-${issue.message}`" class="runtime-document__issue">
      {{ issue.message }}
    </p>
    <article v-for="page in paginated.pages" :key="page.id" class="runtime-page" :class="{ 'runtime-page--print-marks': hasPrintMarks }" :style="pageStyle">
      <template v-if="hasPrintMarks">
        <i class="runtime-print-mark runtime-print-mark--top-left" /><i class="runtime-print-mark runtime-print-mark--top-right" /><i class="runtime-print-mark runtime-print-mark--bottom-left" /><i class="runtime-print-mark runtime-print-mark--bottom-right" />
      </template>
      <div
        v-for="element in printableElements(page)"
        :key="element.id"
        class="runtime-element"
        :class="`runtime-element--${element.type}`"
        :style="elementStyle(element)"
      >
        <template v-if="element.type === 'text'">
          <span :class="valueClass(element.runtime.value)">{{ textValue(element.runtime.value, 'Unbound text') }}</span>
        </template>
        <template v-else-if="element.type === 'image'">
          <img v-if="imageSource(element)" :src="imageSource(element)" :style="{ objectFit: element.style?.objectFit || 'contain', objectPosition: imageObjectPosition(element.style) }" alt="">
          <span v-else-if="mode !== 'print'" class="runtime-placeholder">{{ textValue(element.runtime.value, element.props?.placeholder || 'Unbound image') }}</span>
        </template>
        <template v-else-if="element.type === 'barcode'">
          <RuntimeBarcode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :format="element.props?.format" :show-value="element.props?.displayValue !== false" :foreground="element.style?.color" :background="element.style?.backgroundColor" :mode="mode" v-bind="machineCodeOptions(element.props)" />
        </template>
        <template v-else-if="element.type === 'qrcode'">
          <RuntimeQrCode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :ecc-level="element.props?.eccLevel" :foreground="element.style?.color" :background="element.style?.backgroundColor" :margin="machineCodeOptions(element.props).margin" :mode="mode" />
        </template>
        <template v-else-if="element.type === 'pageNumber'">
          <span>{{ pageNumberValue(element, page.runtime) }}</span>
        </template>
        <template v-else-if="element.type === 'line'">
          <span class="runtime-line" />
        </template>
        <template v-else-if="element.type === 'rect' || element.type === 'circle'">
          <span class="runtime-shape" />
        </template>
        <template v-else-if="element.type === 'table'">
          <table class="runtime-table">
            <colgroup><col v-for="column in tableColumns(element)" :key="columnKey(column)" :style="tableColumnStyle(column)"></colgroup>
            <thead v-if="element.props?.showHeader !== false" :style="tableHeaderStyle(element)">
              <tr :style="tableRowStyle(element, 'header', 0)">
                <th v-for="column in tableColumns(element)" :key="columnKey(column)" :style="tableCellStyle(element, column, 'header')">
                  {{ tableHeaderValue(element, column) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in tableDisplayRows(element)" :key="rowIndex" :style="tableRowStyle(element, 'body', rowIndex)">
                <td v-if="row == null" class="runtime-table__empty" :colspan="Math.max(1, tableColumns(element).length)">
                  No data
                </td>
                <template v-else>
                  <template v-for="column in tableColumns(element)" :key="columnKey(column)">
                    <td
                      v-if="shouldRenderRuntimeTableCell(row, column)"
                      :rowspan="runtimeTableCellRowSpan(row, column)"
                      :colspan="runtimeTableCellColSpan(row, column)"
                      :style="tableCellStyle(element, column, 'body', row)"
                    >
                      {{ tableCellValue(row, column, element, 'body') }}
                    </td>
                  </template>
                </template>
              </tr>
            </tbody>
            <tfoot v-if="element.props?.showFooter !== false && tableFooterRows(element).length" :style="tableFooterStyle(element)">
              <tr v-for="(row, rowIndex) in tableFooterRows(element)" :key="rowIndex" :style="tableRowStyle(element, 'footer', rowIndex)">
                <template v-for="column in tableColumns(element)" :key="columnKey(column)">
                  <td v-if="shouldRenderRuntimeTableCell(row, column)" :rowspan="runtimeTableCellRowSpan(row, column)" :colspan="runtimeTableCellColSpan(row, column)" :style="tableCellStyle(element, column, 'footer', row)">
                    {{ tableCellValue(row, column, element, 'footer') }}
                  </td>
                </template>
              </tr>
            </tfoot>
          </table>
        </template>
        <template v-else-if="element.type === 'multiLabel'">
          <div class="runtime-label-grid" :style="multiLabelStyle(element)">
            <div v-for="(item, itemIndex) in multiLabelItems(element)" :key="itemIndex" class="runtime-label-cell" :style="{ padding: `${Number(element.props?.cellPadding) || 0}mm` }">
              <strong>{{ labelPrimary(item, element, itemIndex) }}</strong><small v-if="element.props?.secondaryPath">{{ labelValue(item, element.props.secondaryPath) }}</small><small v-if="element.props?.tertiaryPath">{{ labelValue(item, element.props.tertiaryPath) }}</small>
            </div>
          </div>
        </template>
      </div>
    </article>
  </section>
</template>

<style scoped>
.runtime-document { display: flex; flex-direction: column; align-items: center; gap: 18px; color: #111827; }
.runtime-document__issue { width: min(100%, 780px); margin: 0; border-left: 3px solid #dc2626; background: #fef2f2; color: #991b1b; padding: 8px 10px; font-size: 12px; }
.runtime-page { position: relative; overflow: hidden; flex: 0 0 auto; box-shadow: 0 4px 16px rgb(15 23 42 / 12%); }
.runtime-print-mark { position: absolute; z-index: 20; width: 4mm; height: 4mm; border: 0 solid #111827; pointer-events: none; }.runtime-print-mark--top-left { top: 1mm; left: 1mm; border-top-width: .25mm; border-left-width: .25mm; }.runtime-print-mark--top-right { top: 1mm; right: 1mm; border-top-width: .25mm; border-right-width: .25mm; }.runtime-print-mark--bottom-left { bottom: 1mm; left: 1mm; border-bottom-width: .25mm; border-left-width: .25mm; }.runtime-print-mark--bottom-right { right: 1mm; bottom: 1mm; border-right-width: .25mm; border-bottom-width: .25mm; }
.runtime-element { position: absolute; display: flex; min-width: 0; min-height: 0; overflow: hidden; align-items: flex-start; justify-content: flex-start; white-space: pre-wrap; }
.runtime-element--image img { width: 100%; height: 100%; object-fit: contain; }
.runtime-element--line { align-items: center; }.runtime-line { width: 100%; border-top: inherit; }.runtime-shape { width: 100%; height: 100%; border: inherit; border-radius: inherit; background: inherit; }
.runtime-placeholder { color: #64748b; font-style: italic; }.runtime-table { width: 100%; height: auto; border-collapse: collapse; table-layout: fixed; font: inherit; }.runtime-table th, .runtime-table td { overflow: hidden; border: 1px solid currentColor; padding: 2px 4px; text-overflow: ellipsis; white-space: nowrap; }.runtime-table__empty { color: #64748b; font-style: italic; text-align: center; }.runtime-label-grid { display: grid; width: 100%; height: 100%; }.runtime-label-cell { display: flex; min-width: 0; flex-direction: column; justify-content: center; overflow: hidden; border: 1px solid currentColor; padding: 2mm; }.runtime-label-cell strong, .runtime-label-cell small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.runtime-document--print { gap: 0; }.runtime-document--print .runtime-page { box-shadow: none; break-after: page; page-break-after: always; }
@media print { .runtime-document { display: block; }.runtime-document__issue { display: none; }.runtime-page { box-shadow: none; break-after: page; page-break-after: always; } }
</style>
