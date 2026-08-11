<template>
  <div class="pd-table-element" :style="tableStyle">
    <div v-if="bindingTokens.length" class="pd-table-element__bindings">
      <span v-for="token in bindingTokens" :key="token.key">{{ token.label }}</span>
    </div>
    <div v-if="!columns.length" class="pd-table-element__empty">请先配置表格列</div>
    <template v-else>
      <div v-if="object.props?.showHeader !== false" class="pd-table-element__row pd-table-element__row--head" :style="gridStyle">
        <span v-for="column in columns" :key="column.key" :style="cellStyle(column, 'header')">{{ column.title }}</span>
      </div>
      <div class="pd-table-element__body">
        <div v-for="row in rows" :key="row.__key" class="pd-table-element__row" :style="gridStyle">
          <span v-for="column in columns" :key="column.key" :style="cellStyle(column)">{{ displayValue(row, column) }}</span>
        </div>
        <div v-if="showsOmission" class="pd-table-element__omission">···</div>
      </div>
      <div v-for="row in footerRows" :key="row.__key" class="pd-table-element__row pd-table-element__row--footer" :style="gridStyle">
        <span v-for="column in columns" :key="column.key" :style="cellStyle(column, 'footer')">{{ displayValue(row, column, 'footer') }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatTableSummaryCell } from "../../core/tableSummary.js";
import { mmToCssPx } from "../../editor/measurement.js";
import { formatTableValue, resolveRelativeRecordPath } from "../../runtime/propertySemantics.js";
import { hasBlankTableHeaders, previewPanelStyle } from "./elementPreview.js";

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const hideHeaderLabels = computed(() => hasBlankTableHeaders(props.object));

const columns = computed(() => {
  const source = Array.isArray(props.object.props?.columns) ? props.object.props.columns : [];
  return source.map((column, index) => {
    const fallback = `field${index + 1}`;
    const key = String(column?.key || column?.field || fallback);
    return {
      key,
      valuePath: String(column?.valuePath || key),
      title: hideHeaderLabels.value
        ? ""
        : typeof column?.title === "string"
          ? column.title
          : typeof column?.header === "string"
            ? column.header
            : `列 ${index + 1}`,
      width: Math.max(1, Number(column?.width) || 100),
      align: ["center", "right"].includes(column?.align) ? column.align : "left",
      formatter: column?.formatter,
    };
  });
});
const sourceRows = computed(() => {
  if (Array.isArray(props.object.props?.sampleData)) return props.object.props.sampleData;
  if (Array.isArray(props.object.props?.data)) return props.object.props.data;
  return [];
});
const requestedRowCount = computed(() => {
  const count = Number(props.object.editorHints?.rowCount);
  return Number.isFinite(count) && count > 0 ? Math.max(1, Math.round(count)) : sourceRows.value.length || 5;
});
const visibleRowCount = computed(() => props.object.editorHints?.omitRows === false ? requestedRowCount.value : Math.min(requestedRowCount.value, 5));
const rows = computed(() => {
  let value = sourceRows.value.slice(0, visibleRowCount.value);
  if (!value.length) {
    value = Array.from({ length: visibleRowCount.value }, (_, index) =>
      columns.value.reduce((row, column) => {
        row[column.key] = props.object.props?.dataVariable ? `{{${props.object.props.dataVariable}[${index}].${column.valuePath}}}` : "";
        return row;
      }, {})
    );
  }
  return value.map((row, index) => ({ ...row, __key: `${props.object.id}-row-${index}` }));
});
const showsOmission = computed(() => props.object.editorHints?.omitRows !== false && (sourceRows.value.length || requestedRowCount.value) > rows.value.length);
const footerRows = computed(() => {
  if (props.object.props?.showFooter === false) return [];
  const source = props.object.props?.footerData;
  if (Array.isArray(source)) return source.map((row, index) => ({ ...row, __key: `${props.object.id}-footer-${index}` }));
  if (source && typeof source === "object") return [{ ...source, __key: `${props.object.id}-footer-0` }];
  if (!props.object.props?.footerDataVariable) return [];
  return [{
    ...columns.value.reduce((row, column) => {
      row[column.key] = `{{${props.object.props.footerDataVariable}.${column.key}}}`;
      return row;
    }, {}),
    __key: `${props.object.id}-footer-0`,
  }];
});
const gridStyle = computed(() => ({
  gridTemplateColumns: columns.value.map((column) => `minmax(0, ${column.width}fr)`).join(" ") || "minmax(0, 1fr)",
}));
const tableStyle = computed(() => {
  const style = props.object.style || {};
  const padding = Math.max(0, Number(style.padding) || 0);
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
  const headerHeight = Math.max(0, Number(props.object.props?.headerHeight) || 0);
  const rowHeight = Math.max(0, Number(props.object.props?.rowHeight) || 0);
  const footerHeight = Math.max(0, Number(props.object.props?.footerHeight) || 0);
  return {
    ...previewPanelStyle(props.object, "#ffffff"),
    color: style.color || "#172033",
    fontFamily: style.fontFamily || undefined,
    fontSize: `${Math.max(9, Number(style.fontSize) || 10)}px`,
    fontWeight: style.fontWeight || "normal",
    fontStyle: style.fontStyle || "normal",
    lineHeight: style.lineHeight || 1.35,
    "--pd-table-cell-y": `${Math.max(1, Math.round(mmToCssPx(padding) * 0.55))}px`,
    "--pd-table-cell-x": `${Math.max(2, Math.round(mmToCssPx(padding)))}px`,
    "--pd-table-border": `${borderWidth}px ${style.borderStyle || "solid"} ${style.borderColor || style.color || "#172033"}`,
    "--pd-table-head-bg": style.headerBackgroundColor || "#edf3ff",
    "--pd-table-head-color": style.headerColor || style.color || "#172033",
    "--pd-table-footer-bg": style.footerBackgroundColor || "#f8fafc",
    "--pd-table-footer-color": style.footerColor || style.color || "#172033",
    "--pd-table-head-min-height": headerHeight > 0 ? `${Math.round(mmToCssPx(headerHeight))}px` : "auto",
    "--pd-table-row-min-height": rowHeight > 0 ? `${Math.round(mmToCssPx(rowHeight))}px` : "auto",
    "--pd-table-footer-min-height": footerHeight > 0 ? `${Math.round(mmToCssPx(footerHeight))}px` : "auto",
  };
});
const bindingTokens = computed(() => {
  const tokens = [];
  if (props.object.props?.dataVariable) tokens.push({ key: "data", label: `数据：{{${props.object.props.dataVariable}}}` });
  if (props.object.props?.footerDataVariable) tokens.push({ key: "footer", label: `页脚：{{${props.object.props.footerDataVariable}}}` });
  return tokens;
});
function cellStyle(column, section = "body") {
  const style = props.object.style || {};
  const textAlign = column.align || (section === "header" ? style.headerTextAlign : section === "footer" ? style.footerTextAlign : style.textAlign) || "left";
  const vertical = style.verticalAlign || "top";
  return {
    justifyContent: textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start",
    alignItems: vertical === "middle" ? "center" : vertical === "bottom" ? "flex-end" : "flex-start",
    textAlign,
    fontSize: `${Math.max(9, Number(section === "header" ? style.headerFontSize : section === "footer" ? style.footerFontSize : style.fontSize) || 10)}px`,
    color: section === "header" ? style.headerColor || style.color || "#172033" : section === "footer" ? style.footerColor || style.color || "#172033" : style.color || "#172033",
  };
}
function displayValue(row, column) {
  const resolved = resolveRelativeRecordPath(row, column.valuePath);
  let value = resolved.found ? resolved.value : row?.[column.key];
  value = formatTableSummaryCell(value, {
    pageRows: sourceRows.value,
    totalRows: sourceRows.value,
  });
  return formatTableValue(value, column.formatter);
}
</script>

<style scoped lang="scss">
.pd-table-element {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.pd-table-element__bindings {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 3px 5px;
  border-bottom: 1px dashed #cbd5e1;
  background: #f8fafc;
}

.pd-table-element__bindings span {
  max-width: 100%;
  padding: 1px 5px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8px;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-table-element__row {
  display: grid;
  min-width: 0;
}

.pd-table-element__row span {
  display: flex;
  min-width: 0;
  min-height: 0;
  padding: var(--pd-table-cell-y) var(--pd-table-cell-x);
  border-right: var(--pd-table-border);
  border-bottom: var(--pd-table-border);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-table-element__row span:last-child {
  border-right: 0;
}

.pd-table-element__row--head {
  min-height: var(--pd-table-head-min-height, 20px);
  background: var(--pd-table-head-bg);
  color: var(--pd-table-head-color);
  font-weight: 700;
}

.pd-table-element__body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.pd-table-element__body .pd-table-element__row {
  flex: 1 1 0;
  min-height: var(--pd-table-row-min-height, auto);
}

.pd-table-element__row--footer {
  min-height: var(--pd-table-footer-min-height, 20px);
  background: var(--pd-table-footer-bg);
  color: var(--pd-table-footer-color);
  font-weight: 600;
}

.pd-table-element__omission {
  display: grid;
  min-height: 0;
  flex: 1;
  place-items: center;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.pd-table-element__empty {
  display: grid;
  min-height: 0;
  flex: 1;
  place-items: center;
  padding: 12px;
  color: #64748b;
  font-size: 11px;
  text-align: center;
  background: #f8fafc;
}
</style>
