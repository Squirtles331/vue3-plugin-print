<template>
  <section class="runtime-document" :class="`runtime-document--${mode}`">
    <p v-for="issue in issues" :key="`${issue.path}-${issue.message}`" class="runtime-document__issue">
      {{ issue.message }}
    </p>
    <article v-for="page in paginated.pages" :key="page.id" class="runtime-page" :class="{ 'runtime-page--print-marks': hasPrintMarks }" :style="pageStyle">
      <template v-if="hasPrintMarks">
        <i class="runtime-print-mark runtime-print-mark--top-left"></i><i class="runtime-print-mark runtime-print-mark--top-right"></i><i class="runtime-print-mark runtime-print-mark--bottom-left"></i><i class="runtime-print-mark runtime-print-mark--bottom-right"></i>
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
          <img v-if="element.runtime.value?.status === 'resolved' || element.runtime.value?.status === 'authored'" :src="element.runtime.value.value" :style="{ objectFit: element.style?.objectFit || 'contain', objectPosition: imageObjectPosition(element.style) }" alt="" />
          <span v-else class="runtime-placeholder">{{ textValue(element.runtime.value, element.props?.placeholder || 'Unbound image') }}</span>
        </template>
        <template v-else-if="element.type === 'barcode'">
          <RuntimeBarcode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :format="element.props?.format" :show-value="element.props?.displayValue !== false" :foreground="element.style?.color" :background="element.style?.backgroundColor" v-bind="machineCodeOptions(element.props)" />
        </template>
        <template v-else-if="element.type === 'qrcode'">
          <RuntimeQrCode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :ecc-level="element.props?.eccLevel" :foreground="element.style?.color" :background="element.style?.backgroundColor" :margin="machineCodeOptions(element.props).margin" />
        </template>
        <template v-else-if="element.type === 'pageNumber'">
          <span>{{ pageNumberValue(element, page.runtime) }}</span>
        </template>
        <template v-else-if="element.type === 'line'">
          <span class="runtime-line"></span>
        </template>
        <template v-else-if="element.type === 'rect' || element.type === 'circle'">
          <span class="runtime-shape"></span>
        </template>
        <template v-else-if="element.type === 'table'">
          <table class="runtime-table">
            <thead v-if="element.props?.showHeader !== false" :style="tableHeaderStyle(element)"><tr><th v-for="column in tableColumns(element)" :key="columnKey(column)" :style="tableCellStyle(element, column, 'header')">{{ column.title || column.header || column.key || column.field }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, rowIndex) in tableRows(element)" :key="rowIndex"><td v-for="column in tableColumns(element)" :key="columnKey(column)" :style="tableCellStyle(element, column, 'body')">{{ tableCellValue(row, column) }}</td></tr>
              <tr v-if="!tableRows(element).length"><td :colspan="Math.max(1, tableColumns(element).length)" class="runtime-table__empty">{{ tableEmptyMessage(element) }}</td></tr>
            </tbody>
            <tfoot v-if="element.props?.showFooter !== false && tableFooterRows(element).length" :style="tableFooterStyle(element)"><tr v-for="(row, rowIndex) in tableFooterRows(element)" :key="rowIndex"><td v-for="column in tableColumns(element)" :key="columnKey(column)" :style="tableCellStyle(element, column, 'footer')">{{ tableCellValue(row, column) }}</td></tr></tfoot>
          </table>
        </template>
        <template v-else-if="element.type === 'multiLabel'">
          <div class="runtime-label-grid" :style="multiLabelStyle(element)">
            <div v-for="(item, itemIndex) in multiLabelItems(element)" :key="itemIndex" class="runtime-label-cell" :style="{ padding: `${Number(element.props?.cellPadding) || 0}mm` }"><strong>{{ labelPrimary(item, element, itemIndex) }}</strong><small v-if="element.props?.secondaryPath">{{ labelValue(item, element.props.secondaryPath) }}</small><small v-if="element.props?.tertiaryPath">{{ labelValue(item, element.props.tertiaryPath) }}</small></div>
          </div>
        </template>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { paginateRuntimeDocument } from "./pagination.js";
import { resolveRuntimeTemplate } from "./dataResolver.js";
import { createRuntimePageStyle, hasRuntimePrintMarks } from "./pageStyle.js";
import { formatTableValue, imageObjectPosition, machineCodeOptions, resolveRelativeRecordPath } from "./propertySemantics.js";
const RuntimeBarcode = defineAsyncComponent(() => import("./RuntimeBarcode.vue"));
const RuntimeQrCode = defineAsyncComponent(() => import("./RuntimeQrCode.vue"));

const props = defineProps({ document: { type: Object, required: true }, runtimeData: { type: Object, default: () => ({}) }, mode: { type: String, default: "preview" } });
const resolved = computed(() => resolveRuntimeTemplate(props.document, props.runtimeData));
const paginated = computed(() => paginateRuntimeDocument(resolved.value.document));
const issues = computed(() => resolved.value.issues || []);
const pageStyle = computed(() => createRuntimePageStyle(props.document));
const hasPrintMarks = computed(() => hasRuntimePrintMarks(props.document));

function printableElements(page) { return (page.elements || []).filter((element) => element.visible !== false && element.printable !== false); }
function elementStyle(element) { const style = element.style || {}; const autoHeight = element.type === 'text' && element.props?.autoHeight === true; const vertical = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[style.verticalAlign] || 'flex-start'; const horizontal = { left: 'flex-start', center: 'center', right: 'flex-end' }[style.textAlign] || 'flex-start'; return { left: `${element.x || 0}mm`, top: `${element.y || 0}mm`, width: `${element.width || 1}mm`, height: autoHeight ? 'auto' : `${element.height || 1}mm`, minHeight: autoHeight ? `${element.height || 1}mm` : undefined, overflow: autoHeight ? 'visible' : 'hidden', transform: `rotate(${Number(element.rotation) || 0}deg)`, zIndex: Number(element.zIndex) || 0, color: style.color || '#111827', background: style.backgroundColor || 'transparent', fontFamily: style.fontFamily || undefined, fontSize: `${Number(style.fontSize) || 12}px`, fontWeight: style.fontWeight || 'normal', fontStyle: style.fontStyle || 'normal', textDecoration: style.textDecoration || 'none', textAlign: style.textAlign || 'left', lineHeight: style.lineHeight || 1.4, letterSpacing: `${Number(style.letterSpacing) || 0}px`, border: `${Number(style.borderWidth) || 0}px ${style.borderStyle || 'solid'} ${style.borderColor || 'transparent'}`, borderRadius: `${Number(style.borderRadius) || 0}px`, padding: `${Number(style.padding) || 0}mm`, boxSizing: 'border-box', opacity: Number.isFinite(Number(style.opacity)) ? Number(style.opacity) : 1, alignItems: vertical, justifyContent: horizontal, whiteSpace: element.props?.whiteSpace || 'pre-wrap', writingMode: element.props?.writingMode || 'horizontal-tb' }; }
function textValue(value, fallback) { return value?.value || fallback; }
function valueClass(value) { return value?.status === 'missing' || value?.status === 'empty' ? 'runtime-placeholder' : ''; }
function columnKey(column) { return column?.key || column?.field || ''; }
function tableColumns(element) { return element.runtime?.table?.columns || []; }
function tableRows(element) { return element.runtime?.table?.rows || []; }
function tableFooterRows(element) { return element.runtime?.table?.footerRows || []; }
function tableEmptyMessage(element) { return element.runtime?.table?.dataStatus === 'missing' ? `Missing table data ${element.props?.dataVariable ? `{{${element.props.dataVariable}}}` : ''}` : 'No table rows'; }
function tableCellStyle(element, column, section = 'body') { const style = element.style || {}; const props = element.props || {}; const rowHeight = section === 'header' ? props.headerHeight : section === 'footer' ? props.footerHeight : props.rowHeight; return { width: `${Math.max(1, Number(column?.width) || 1)}px`, height: `${Math.max(1, Number(rowHeight) || 1)}mm`, textAlign: column?.align || style.textAlign || 'left', borderColor: style.borderColor || 'currentColor', borderWidth: `${Number(style.borderWidth) || 1}px`, borderStyle: style.borderStyle || 'solid', padding: `${Number(style.padding) || 0}mm` }; }
function tableCellValue(row, column) { const result = resolveRelativeRecordPath(row, column?.valuePath || columnKey(column)); return formatTableValue(result.found ? result.value : row?.[columnKey(column)], column?.formatter); }
function tableHeaderStyle(element) { const style = element.style || {}; return { background: style.headerBackgroundColor || style.backgroundColor || 'transparent', color: style.headerColor || style.color || 'inherit', fontSize: `${Number(style.headerFontSize) || Number(style.fontSize) || 12}px`, textAlign: style.headerTextAlign || style.textAlign || 'left' }; }
function tableFooterStyle(element) { const style = element.style || {}; return { background: style.footerBackgroundColor || style.backgroundColor || 'transparent', color: style.footerColor || style.color || 'inherit', fontSize: `${Number(style.footerFontSize) || Number(style.fontSize) || 12}px`, textAlign: style.footerTextAlign || style.textAlign || 'left' }; }
function multiLabelStyle(element) { return { gridTemplateColumns: `repeat(${Math.max(1, Number(element.props?.cols) || 1)}, 1fr)`, gridTemplateRows: `repeat(${Math.max(1, Number(element.props?.rows) || 1)}, 1fr)`, gridAutoFlow: element.props?.direction === 'column' ? 'column' : 'row', gap: `${Number(element.props?.gapY) || 0}mm ${Number(element.props?.gapX) || 0}mm` }; }
function multiLabelItems(element) { const total = Math.max(1, Number(element.props?.rows) || 1) * Math.max(1, Number(element.props?.cols) || 1); const rows = element.runtime?.multiLabel?.rows || []; return Array.from({ length: total }, (_, index) => rows[index] ?? null); }
function labelValue(item, path) { if (item == null) return ''; if (typeof item !== 'object') return path ? `{{${path}}}` : String(item); const result = resolveRelativeRecordPath(item, path); return result.found && result.value != null ? String(result.value) : path ? `{{${path}}}` : ''; }
function labelPrimary(item, element, index) { if (item == null) return element.runtime?.multiLabel?.status === 'missing' ? `{{${element.props?.dataVariable}[${index}]}}` : 'Unbound label'; return labelValue(item, element.props?.primaryPath); }
function pageNumberValue(element, pageRuntime) { const current = pageRuntime?.pageNumber || 1; const total = pageRuntime?.pageCount || 1; const format = element.props?.format || '1'; if (format === '1') return String(current); return String(format).replaceAll('N', total).replaceAll('1', current); }
</script>

<style scoped>
.runtime-document { display: flex; flex-direction: column; align-items: center; gap: 18px; color: #111827; }
.runtime-document__issue { width: min(100%, 780px); margin: 0; border-left: 3px solid #dc2626; background: #fef2f2; color: #991b1b; padding: 8px 10px; font-size: 12px; }
.runtime-page { position: relative; overflow: hidden; flex: 0 0 auto; box-shadow: 0 4px 16px rgb(15 23 42 / 12%); }
.runtime-print-mark { position: absolute; z-index: 20; width: 4mm; height: 4mm; border: 0 solid #111827; pointer-events: none; }.runtime-print-mark--top-left { top: 1mm; left: 1mm; border-top-width: .25mm; border-left-width: .25mm; }.runtime-print-mark--top-right { top: 1mm; right: 1mm; border-top-width: .25mm; border-right-width: .25mm; }.runtime-print-mark--bottom-left { bottom: 1mm; left: 1mm; border-bottom-width: .25mm; border-left-width: .25mm; }.runtime-print-mark--bottom-right { right: 1mm; bottom: 1mm; border-right-width: .25mm; border-bottom-width: .25mm; }
.runtime-element { position: absolute; display: flex; min-width: 0; min-height: 0; overflow: hidden; align-items: flex-start; justify-content: flex-start; white-space: pre-wrap; }
.runtime-element--image img { width: 100%; height: 100%; object-fit: contain; }
.runtime-element--line { align-items: center; }.runtime-line { width: 100%; border-top: inherit; }.runtime-shape { width: 100%; height: 100%; border: inherit; border-radius: inherit; background: inherit; }
.runtime-placeholder { color: #64748b; font-style: italic; }.runtime-table { width: 100%; border-collapse: collapse; table-layout: fixed; font: inherit; }.runtime-table th, .runtime-table td { overflow: hidden; border: 1px solid currentColor; padding: 2px 4px; text-overflow: ellipsis; white-space: nowrap; }.runtime-table__empty { color: #64748b; font-style: italic; text-align: center; }.runtime-label-grid { display: grid; width: 100%; height: 100%; }.runtime-label-cell { display: flex; min-width: 0; flex-direction: column; justify-content: center; overflow: hidden; border: 1px solid currentColor; padding: 2mm; }.runtime-label-cell strong, .runtime-label-cell small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.runtime-document--print { gap: 0; }.runtime-document--print .runtime-page { box-shadow: none; break-after: page; page-break-after: always; }
@media print { .runtime-document { display: block; }.runtime-document__issue { display: none; }.runtime-page { box-shadow: none; break-after: page; page-break-after: always; } }
</style>
