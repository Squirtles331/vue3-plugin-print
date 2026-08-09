<template>
  <section class="runtime-document" :class="`runtime-document--${mode}`">
    <p v-for="issue in issues" :key="`${issue.path}-${issue.message}`" class="runtime-document__issue">
      {{ issue.message }}
    </p>
    <article v-for="page in paginated.pages" :key="page.id" class="runtime-page" :style="pageStyle">
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
          <img v-if="element.runtime.value?.status === 'resolved' || element.runtime.value?.status === 'authored'" :src="element.runtime.value.value" alt="" />
          <span v-else class="runtime-placeholder">{{ textValue(element.runtime.value, 'Unbound image') }}</span>
        </template>
        <template v-else-if="element.type === 'barcode'">
          <RuntimeBarcode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :format="element.props?.format" :show-value="element.props?.displayValue !== false" />
        </template>
        <template v-else-if="element.type === 'qrcode'">
          <RuntimeQrCode :value="element.runtime.value?.value" :status="element.runtime.value?.status" :ecc-level="element.props?.eccLevel" />
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
            <thead v-if="element.props?.showHeader !== false"><tr><th v-for="column in tableColumns(element)" :key="columnKey(column)">{{ column.title || column.header || column.key || column.field }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, rowIndex) in tableRows(element)" :key="rowIndex"><td v-for="column in tableColumns(element)" :key="columnKey(column)">{{ row[columnKey(column)] ?? '' }}</td></tr>
              <tr v-if="!tableRows(element).length"><td :colspan="Math.max(1, tableColumns(element).length)" class="runtime-table__empty">{{ tableEmptyMessage(element) }}</td></tr>
            </tbody>
            <tfoot v-if="element.props?.showFooter !== false && tableFooterRows(element).length"><tr v-for="(row, rowIndex) in tableFooterRows(element)" :key="rowIndex"><td v-for="column in tableColumns(element)" :key="columnKey(column)">{{ row[columnKey(column)] ?? '' }}</td></tr></tfoot>
          </table>
        </template>
        <template v-else-if="element.type === 'multiLabel'">
          <div class="runtime-label-grid" :style="multiLabelStyle(element)">
            <div v-for="(item, itemIndex) in multiLabelItems(element)" :key="itemIndex" class="runtime-label-cell"><strong>{{ labelPrimary(item, element, itemIndex) }}</strong><small>{{ labelSecondary(item) }}</small></div>
          </div>
        </template>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { paginateRuntimeDocument } from "./pagination.js";
import { resolveRuntimeTemplate } from "./dataResolver.js";
import RuntimeBarcode from "./RuntimeBarcode.vue";
import RuntimeQrCode from "./RuntimeQrCode.vue";

const props = defineProps({ document: { type: Object, required: true }, runtimeData: { type: Object, default: () => ({}) }, mode: { type: String, default: "preview" } });
const resolved = computed(() => resolveRuntimeTemplate(props.document, props.runtimeData));
const paginated = computed(() => paginateRuntimeDocument(resolved.value.document));
const issues = computed(() => resolved.value.issues || []);
const pageStyle = computed(() => ({ width: `${props.document?.pageSettings?.paper?.widthMm || 210}mm`, minHeight: `${props.document?.pageSettings?.paper?.heightMm || 297}mm` }));

function printableElements(page) { return (page.elements || []).filter((element) => element.visible !== false && element.printable !== false); }
function elementStyle(element) { const style = element.style || {}; return { left: `${element.x || 0}mm`, top: `${element.y || 0}mm`, width: `${element.width || 1}mm`, height: `${element.height || 1}mm`, transform: `rotate(${Number(element.rotation) || 0}deg)`, zIndex: Number(element.zIndex) || 0, color: style.color || '#111827', background: style.backgroundColor || 'transparent', fontFamily: style.fontFamily || undefined, fontSize: `${Number(style.fontSize) || 12}px`, fontWeight: style.fontWeight || 'normal', fontStyle: style.fontStyle || 'normal', textAlign: style.textAlign || 'left', lineHeight: style.lineHeight || 1.4, letterSpacing: `${Number(style.letterSpacing) || 0}px`, border: `${Number(style.borderWidth) || 0}px ${style.borderStyle || 'solid'} ${style.borderColor || 'transparent'}`, borderRadius: `${Number(style.borderRadius) || 0}px`, padding: `${Number(style.padding) || 0}mm`, boxSizing: 'border-box', opacity: Number.isFinite(Number(style.opacity)) ? Number(style.opacity) : 1 }; }
function textValue(value, fallback) { return value?.value || fallback; }
function valueClass(value) { return value?.status === 'missing' || value?.status === 'empty' ? 'runtime-placeholder' : ''; }
function columnKey(column) { return column?.key || column?.field || ''; }
function tableColumns(element) { return element.runtime?.table?.columns || []; }
function tableRows(element) { return element.runtime?.table?.rows || []; }
function tableFooterRows(element) { return element.runtime?.table?.footerRows || []; }
function tableEmptyMessage(element) { return element.runtime?.table?.dataStatus === 'missing' ? `Missing table data ${element.props?.dataVariable ? `{{${element.props.dataVariable}}}` : ''}` : 'No table rows'; }
function multiLabelStyle(element) { return { gridTemplateColumns: `repeat(${Math.max(1, Number(element.props?.cols) || 1)}, 1fr)`, gridTemplateRows: `repeat(${Math.max(1, Number(element.props?.rows) || 1)}, 1fr)`, gap: `${Number(element.props?.gapY) || 0}mm ${Number(element.props?.gapX) || 0}mm` }; }
function multiLabelItems(element) { const total = Math.max(1, Number(element.props?.rows) || 1) * Math.max(1, Number(element.props?.cols) || 1); const rows = element.runtime?.multiLabel?.rows || []; return Array.from({ length: total }, (_, index) => rows[index] ?? null); }
function labelPrimary(item, element, index) { if (item == null) return element.runtime?.multiLabel?.status === 'missing' ? `{{${element.props?.dataVariable}[${index}]}}` : 'Unbound label'; if (typeof item === 'object') return item.title || item.name || item.label || item.code || ''; return String(item); }
function labelSecondary(item) { return item && typeof item === 'object' ? item.code || item.detail || '' : ''; }
function pageNumberValue(element, pageRuntime) { const current = pageRuntime?.pageNumber || 1; const total = pageRuntime?.pageCount || 1; const format = element.props?.format || '1'; if (format === '1/N') return `${current}/${total}`; if (format === 'Page 1') return `Page ${current}`; return String(current); }
</script>

<style scoped>
.runtime-document { display: flex; flex-direction: column; align-items: center; gap: 18px; color: #111827; }
.runtime-document__issue { width: min(100%, 780px); margin: 0; border-left: 3px solid #dc2626; background: #fef2f2; color: #991b1b; padding: 8px 10px; font-size: 12px; }
.runtime-page { position: relative; overflow: hidden; flex: 0 0 auto; background: #fff; box-shadow: 0 4px 16px rgb(15 23 42 / 12%); }
.runtime-element { position: absolute; display: flex; min-width: 0; min-height: 0; overflow: hidden; align-items: flex-start; justify-content: flex-start; white-space: pre-wrap; }
.runtime-element--image img { width: 100%; height: 100%; object-fit: contain; }
.runtime-element--line { align-items: center; }.runtime-line { width: 100%; border-top: inherit; }.runtime-shape { width: 100%; height: 100%; border: inherit; border-radius: inherit; background: inherit; }
.runtime-placeholder { color: #64748b; font-style: italic; }.runtime-table { width: 100%; border-collapse: collapse; table-layout: fixed; font: inherit; }.runtime-table th, .runtime-table td { overflow: hidden; border: 1px solid currentColor; padding: 2px 4px; text-overflow: ellipsis; white-space: nowrap; }.runtime-table__empty { color: #64748b; font-style: italic; text-align: center; }.runtime-label-grid { display: grid; width: 100%; height: 100%; }.runtime-label-cell { display: flex; min-width: 0; flex-direction: column; justify-content: center; overflow: hidden; border: 1px solid currentColor; padding: 2mm; }.runtime-label-cell strong, .runtime-label-cell small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.runtime-document--print { gap: 0; }.runtime-document--print .runtime-page { box-shadow: none; break-after: page; page-break-after: always; }
@media print { .runtime-document { display: block; }.runtime-document__issue { display: none; }.runtime-page { box-shadow: none; break-after: page; page-break-after: always; } }
</style>
