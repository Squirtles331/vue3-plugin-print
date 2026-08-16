<template>
  <div class="pd-table-element" :class="{ 'is-editable': canEditTable }" :style="tableStyle" @pointerdown.stop>
    <template v-if="canEditTable">
      <span class="pd-table-element__drag-zone pd-table-element__drag-zone--top" @pointerdown.stop="emitDrag"></span>
      <span class="pd-table-element__drag-zone pd-table-element__drag-zone--right" @pointerdown.stop="emitDrag"></span>
      <span class="pd-table-element__drag-zone pd-table-element__drag-zone--bottom" @pointerdown.stop="emitDrag"></span>
      <span class="pd-table-element__drag-zone pd-table-element__drag-zone--left" @pointerdown.stop="emitDrag"></span>
    </template>

    <div v-if="bindingTokens.length" class="pd-table-element__bindings">
      <span v-for="token in bindingTokens" :key="token.key">{{ token.label }}</span>
    </div>

    <div v-if="!columns.length" class="pd-table-element__empty">请先配置表格列</div>

    <div v-else ref="tableHostRef" class="pd-table-element__table-wrap">
      <table class="pd-table-element__table" :style="tableLayoutStyle">
        <colgroup>
          <col v-for="column in columns" :key="column.key" :style="columnWidthStyle(column)" />
        </colgroup>

        <thead v-if="object.props?.showHeader !== false" class="pd-table-element__head">
          <tr :style="rowStyle('header', 0)">
            <th
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              :style="cellStyle(column, null, 'header')"
              @dblclick.stop="startHeaderEdit($event, columnIndex)"
            >
              {{ column.title }}
              <span
                v-if="canEditTable && columnIndex < columns.length - 1"
                class="pd-table-element__column-resize-handle"
                @pointerdown.stop.prevent="startColumnResize($event, columnIndex)"
              ></span>
              <span
                v-if="canEditTable && columnIndex === columns.length - 1"
                class="pd-table-element__row-resize-handle"
                @pointerdown.stop.prevent="startRowResize($event, 'header', 0)"
              ></span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="row.__pdKey" :style="rowStyle('body', rowIndex)">
            <template v-for="(column, columnIndex) in columns" :key="`${row.__pdKey}-${column.key}`">
              <td
                v-if="shouldRenderCell(row, column)"
                :class="{ 'is-selected': isCellSelected(rowIndex, column.key, 'body') }"
                :rowspan="cellRowSpan(row, column)"
                :colspan="cellColSpan(row, column)"
                :style="cellStyle(column, row, 'body')"
                @pointerdown.stop="startCellSelection($event, rowIndex, column.key, 'body')"
                @pointerenter="expandCellSelection(rowIndex, column.key, 'body')"
                @dblclick.stop="startCellInlineEdit($event, rowIndex, column.key, 'body')"
              >
                <textarea
                  v-if="isInlineEditingCurrentCell(rowIndex, column.key, 'body')"
                  ref="inlineEditorRef"
                  class="pd-table-element__cell-editor"
                  :value="inlineEditingValue"
                  @input="inlineEditingValue = ($event.target as HTMLInputElement).value"
                  @pointerdown.stop
                  @keydown="handleInlineCellEditorKeydown"
                  @blur="commitCellInlineEdit"
                ></textarea>
                <template v-else>{{ displayValue(row, column) }}</template>
                <span
                  v-if="canEditTable && columnIndex < columns.length - 1"
                  class="pd-table-element__column-resize-handle"
                  @pointerdown.stop.prevent="startColumnResize($event, columnIndex)"
                ></span>
                <span
                  v-if="canEditTable && isLastVisibleColumn(row, column, columnIndex)"
                  class="pd-table-element__row-resize-handle"
                  @pointerdown.stop.prevent="startRowResize($event, 'body', rowIndex)"
                ></span>
              </td>
            </template>
          </tr>
          <tr v-if="showsOmission" class="pd-table-element__omission">
            <td :colspan="columns.length">⋯</td>
          </tr>
        </tbody>

        <tfoot v-if="footerRows.length" class="pd-table-element__footer">
          <tr v-for="(row, rowIndex) in footerRows" :key="row.__pdKey" :style="rowStyle('footer', rowIndex)">
            <template v-for="(column, columnIndex) in columns" :key="`${row.__pdKey}-${column.key}`">
              <td
                v-if="shouldRenderCell(row, column)"
                :class="{ 'is-selected': isCellSelected(rowIndex, column.key, 'footer') }"
                :rowspan="cellRowSpan(row, column)"
                :colspan="cellColSpan(row, column)"
                :style="cellStyle(column, row, 'footer')"
                @pointerdown.stop="startCellSelection($event, rowIndex, column.key, 'footer')"
                @pointerenter="expandCellSelection(rowIndex, column.key, 'footer')"
                @dblclick.stop="startFooterEdit($event, rowIndex, column.key)"
              >
                <template v-if="isInlineEditingCurrentCell(rowIndex, column.key, 'footer')">
                  <textarea
                    ref="inlineEditorRef"
                    class="pd-table-element__cell-editor"
                    :value="inlineEditingValue"
                    @input="inlineEditingValue = ($event.target as HTMLInputElement).value"
                    @pointerdown.stop
                    @keydown="handleInlineCellEditorKeydown"
                    @blur="commitCellInlineEdit"
                  ></textarea>
                </template>
                <template v-else>{{ displayValue(row, column) }}</template>
                <span
                  v-if="canEditTable && columnIndex < columns.length - 1"
                  class="pd-table-element__column-resize-handle"
                  @pointerdown.stop.prevent="startColumnResize($event, columnIndex)"
                ></span>
                <span
                  v-if="canEditTable && isLastVisibleColumn(row, column, columnIndex)"
                  class="pd-table-element__row-resize-handle"
                  @pointerdown.stop.prevent="startRowResize($event, 'footer', rowIndex)"
                ></span>
              </td>
            </template>
          </tr>
        </tfoot>
      </table>
    </div>

    <form
      v-if="editForm.kind"
      ref="editFormRef"
      class="pd-table-element__edit-popover"
      :style="{ top: `${editForm.position.top}px`, left: `${editForm.position.left}px` }"
      @pointerdown.stop
      @submit.prevent="saveEditForm"
    >
      <template v-if="editForm.kind === 'header'">
        <label>
          <span>表头文本</span>
          <input v-model="editForm.title" autofocus />
        </label>
        <label>
          <span>字段 key</span>
          <input v-model="editForm.key" />
        </label>
      </template>
      <template v-else>
        <label>
          <span>单元格文本</span>
          <input v-model="editForm.value" autofocus />
        </label>
        <label>
          <span>汇总字段</span>
          <select v-model="editForm.field" @change="editForm.field = editForm.field === editForm.colField ? editForm.field : ''">
            <option value="">不汇总</option>
            <option v-for="column in columns" :key="column.key" :value="column.key">{{ column.title }}（{{ column.key }}）</option>
          </select>
        </label>
      </template>
      <div class="pd-table-element__edit-actions">
        <button type="button" @click="closeEditForm">取消</button>
        <button type="submit">保存</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { normalizeTableCell, normalizeTableColumns, normalizeTableRowHeights, tableCellColSpan, tableCellDisplayValue, tableCellRowSpan, tableCellStyle, tableCellValue, tableRowHeight, updateTableCell, updateTableRowHeight, renameTableColumn, shouldRenderTableCell, } from "../../core/tableModel.js";
import { formatTableSummaryCell } from "../../core/tableSummary.js";
import { MM_TO_CSS_PX, mmToCssPx } from "../../editor/measurement.js";
import { createUpdateObjectPropsCommand } from "../../editor/commands/documentCommands.js";
import { executeEditorCommand } from "../../editor/commands/executeCommand.js";
import { useEditorDocumentStore } from "../../editor/stores/documentStore.js";
import { useEditorHistoryStore } from "../../editor/stores/historyStore.js";
import { useEditorSelectionStore } from "../../editor/stores/selectionStore.js";
import { formatTableValue, resolveRelativeRecordPath } from "../../runtime/propertySemantics.js";
import { hasBlankTableHeaders } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const emit = defineEmits(["start-object-drag"]) as any;
const documentStore = useEditorDocumentStore() as any;
const historyStore = useEditorHistoryStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const { selectedIds, tableSelection } = storeToRefs(selectionStore) as any;
const tableHostRef = ref(null) as any;
const inlineEditorRef = ref(null) as any;
const inlineEditingCell = ref(null) as any;
const inlineEditingValue = ref("") as any;
const selectionStart = ref(null) as any;
const isSelecting = ref(false) as any;
const tempColumnWidths = ref({}) as any;
const tempRowHeights = ref({}) as any;
const columnResize = ref(null) as any;
const rowResize = ref(null) as any;
const editFormRef = ref(null) as any;
const editForm = ref({ kind: "", index: -1, rowIndex: -1, colField: "", title: "", key: "", value: "", field: "", position: { top: 0, left: 0 } }) as any;
const hideHeaderLabels = computed((): any => hasBlankTableHeaders(props.object)) as any;
const columns = computed((): any => normalizeTableColumns(props.object.props?.columns)) as any;
const canEditTable = computed((): any => selectedIds.value.length === 1 && selectedIds.value[0] === props.object.id && !props.object.locked) as any;
const sourceRows = computed((): any => {
    if (Array.isArray(props.object.props?.sampleData))
        return props.object.props.sampleData;
    return [];
}) as any;
const omitRows = computed((): any => props.object.editorHints?.omitRows ?? true) as any;
const requestedRowCount = computed((): any => {
    const value = Number(props.object.editorHints?.rowCount);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : sourceRows.value.length || 5;
}) as any;
const visibleRowCount = computed((): any => omitRows.value ? Math.min(requestedRowCount.value, 5) : requestedRowCount.value) as any;
const rows = computed((): any => Array.from({ length: visibleRowCount.value }, (_: any, index: any): any => ({
    ...(sourceRows.value[index] && typeof sourceRows.value[index] === "object" ? sourceRows.value[index] : {}),
    __pdKey: `${props.object.id}-body-${index}`,
}))) as any;
const showsOmission = computed((): any => omitRows.value && Math.max(sourceRows.value.length, requestedRowCount.value) > rows.value.length) as any;
const footerRows = computed((): any => {
    if (props.object.props?.showFooter === false)
        return [];
    const source = props.object.props?.footerData;
    if (Array.isArray(source))
        return source.map((row: any, index: any): any => ({ ...(row || {}), __pdKey: `${props.object.id}-footer-${index}` }));
    if (source && typeof source === "object")
        return [{ ...source, __pdKey: `${props.object.id}-footer-0` }];
    if (!props.object.props?.footerDataVariable)
        return [];
    return [columns.value.reduce((row: any, column: any): any => {
            row[column.key] = `{{${props.object.props.footerDataVariable}.${column.key}}}`;
            row.__pdKey = `${props.object.id}-footer-0`;
            return row;
        }, {})];
}) as any;
const totalColumnWidth = computed((): any => columns.value.reduce((sum: any, column: any): any => sum + displayColumnWidth(column), 0) || 1) as any;
const tableLayoutStyle = computed((): any => ({ width: "100%", height: "100%", tableLayout: "fixed" })) as any;
const tableStyle = computed((): any => {
    const style = props.object.style || {};
    const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
    const borderStyle = style.borderStyle || "solid";
    const padding = Math.max(0, Number(style.padding) || 0);
    const opacity = Number(style.opacity);
    return {
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: `${Math.max(0, Number(style.borderRadius) || 0)}px`,
        background: style.backgroundColor && style.backgroundColor !== "transparent" ? style.backgroundColor : "#ffffff",
        color: style.color || "#172033",
        fontFamily: style.fontFamily || undefined,
        fontSize: `${Math.max(9, Number(style.fontSize) || 10)}px`,
        fontWeight: style.fontWeight || "normal",
        fontStyle: style.fontStyle || "normal",
        lineHeight: style.lineHeight || 1.35,
        letterSpacing: `${Number(style.letterSpacing) || 0}px`,
        opacity: Number.isFinite(opacity) ? opacity : 1,
        "--pd-table-cell-y": `${Math.round(mmToCssPx(padding) * 0.55)}px`,
        "--pd-table-cell-x": `${Math.round(mmToCssPx(padding))}px`,
        "--pd-table-border": borderWidth && borderStyle !== "none" ? `${borderWidth}px ${borderStyle} ${style.borderColor || style.color || "#172033"}` : "0 solid transparent",
    };
}) as any;
const bindingTokens = computed((): any => {
    const tokens = [];
    if (props.object.props?.dataVariable)
        tokens.push({ key: "data", label: `数据：{{${props.object.props.dataVariable}}}` });
    if (props.object.props?.footerDataVariable)
        tokens.push({ key: "footer", label: `页脚：{{${props.object.props.footerDataVariable}}}` });
    return tokens;
}) as any;
function emitDrag(event: any): any {
    if (!canEditTable.value)
        return;
    emit("start-object-drag", event);
}
function displayColumnWidth(column: any): any {
    const temporary = Number(tempColumnWidths.value[column.key]);
    return Number.isFinite(temporary) && temporary > 0 ? temporary : column.width;
}
function columnWidthStyle(column: any): any {
    return { width: `${(displayColumnWidth(column) / totalColumnWidth.value) * 100}%` };
}
function rawCell(row: any, column: any): any {
    return row?.[column.key];
}
function shouldRenderCell(row: any, column: any): any {
    return shouldRenderTableCell(rawCell(row, column));
}
function cellRowSpan(row: any, column: any): any {
    const value = tableCellRowSpan(rawCell(row, column));
    return value > 1 ? value : undefined;
}
function cellColSpan(row: any, column: any): any {
    const value = tableCellColSpan(rawCell(row, column));
    return value > 1 ? value : undefined;
}
function isLastVisibleColumn(row: any, column: any, columnIndex: any): any {
    return columnIndex + tableCellColSpan(rawCell(row, column)) >= columns.value.length;
}
function cellStyle(column: any, row: any, section: any = "body"): any {
    const style = props.object.style || {};
    const textAlign = column.align || (section === "header" ? style.headerTextAlign : section === "footer" ? style.footerTextAlign : style.textAlign) || "left";
    const fontSize = Number(section === "header" ? style.headerFontSize : section === "footer" ? style.footerFontSize : style.fontSize) || 10;
    const sectionBackground = section === "header" ? style.headerBackgroundColor || "#edf3ff" : section === "footer" ? style.footerBackgroundColor || "#f8fafc" : undefined;
    const sectionColor = section === "header" ? style.headerColor || style.color || "#172033" : section === "footer" ? style.footerColor || style.color || "#172033" : style.color || "#172033";
    return {
        position: "relative",
        padding: "var(--pd-table-cell-y) var(--pd-table-cell-x)",
        border: "var(--pd-table-border)",
        backgroundColor: sectionBackground,
        color: sectionColor,
        textAlign,
        verticalAlign: style.verticalAlign || "top",
        fontSize: `${Math.max(9, fontSize)}px`,
        fontWeight: section === "header" ? "700" : section === "footer" ? "600" : style.fontWeight || "normal",
        fontStyle: style.fontStyle || "normal",
        textDecoration: style.textDecoration || "none",
        lineHeight: style.lineHeight || 1.35,
        letterSpacing: `${Number(style.letterSpacing) || 0}px`,
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        ...tableCellStyle(rawCell(row, column)),
    };
}
function rowStyle(section: any, rowIndex: any): any {
    const key = `${section}:${rowIndex}`;
    const temporary = Number(tempRowHeights.value[key]);
    const height = Number.isFinite(temporary) && temporary > 0 ? temporary : tableRowHeight(props.object.props, section, rowIndex);
    return height > 0 ? { height: `${mmToCssPx(height)}px` } : {};
}
function displayValue(row: any, column: any): any {
    const resolved = resolveRelativeRecordPath(row, column.valuePath);
    const value = resolved.found ? resolved.value : rawCell(row, column);
    const text = tableCellDisplayValue(value, sourceRows.value);
    return formatTableValue(formatTableSummaryCell(text, { pageRows: sourceRows.value, totalRows: sourceRows.value }), column.formatter);
}
function isCellSelected(rowIndex: any, colField: any, section: any): any {
    return tableSelection.value?.tableId === props.object.id
        && tableSelection.value.cells.some((cell: any): any => cell.rowIndex === rowIndex && cell.colField === colField && cell.section === section);
}
function setSelection(cells: any, section: any): any {
    selectionStore.setTableSelection(props.object.id, cells, section);
}
function startCellSelection(event: any, rowIndex: any, colField: any, section: any): any {
    if (!canEditTable.value || event.button !== 0)
        return;
    isSelecting.value = true;
    selectionStart.value = { rowIndex, colField, section };
    setSelection([{ rowIndex, colField, section }], section);
}
function expandCellSelection(rowIndex: any, colField: any, section: any): any {
    const start = selectionStart.value;
    if (!isSelecting.value || !start || start.section !== section)
        return;
    const startColumn = columns.value.findIndex((column: any): any => column.key === start.colField);
    const endColumn = columns.value.findIndex((column: any): any => column.key === colField);
    if (startColumn < 0 || endColumn < 0)
        return;
    const cells = [];
    for (let row = Math.min(start.rowIndex, rowIndex); row <= Math.max(start.rowIndex, rowIndex); row += 1) {
        for (let column = Math.min(startColumn, endColumn); column <= Math.max(startColumn, endColumn); column += 1) {
            cells.push({ rowIndex: row, colField: columns.value[column].key, section });
        }
    }
    setSelection(cells, section);
}
function stopCellSelection(): any {
    isSelecting.value = false;
    selectionStart.value = null;
}
function isInlineEditingCurrentCell(rowIndex: any, colField: any, section: any): any {
    const editing = inlineEditingCell.value;
    return Boolean(editing && editing.rowIndex === rowIndex && editing.colField === colField && editing.section === section);
}
async function startCellInlineEdit(event: any, rowIndex: any, colField: any, section: any): Promise<any> {
    if (!canEditTable.value)
        return;
    const row = section === "footer" ? footerRows.value[rowIndex] : rows.value[rowIndex];
    inlineEditingCell.value = { rowIndex, colField, section };
    inlineEditingValue.value = String(tableCellValue(rawCell(row, { key: colField })) ?? "");
    setSelection([{ rowIndex, colField, section }], section);
    await nextTick();
    const editor = Array.isArray(inlineEditorRef.value) ? inlineEditorRef.value.at(-1) : inlineEditorRef.value;
    editor?.focus?.();
    editor?.select?.();
}
function commitObjectPatch(patch: any, label: any): any {
    if (!canEditTable.value)
        return false;
    const command = createUpdateObjectPropsCommand(documentStore, props.object.id, patch);
    if (!command)
        return false;
    command.label = label;
    executeEditorCommand(historyStore, command);
    return true;
}
function commitTableProps(patch: any, label: any): any {
    return commitObjectPatch({ props: { ...(props.object.props || {}), ...patch } }, label);
}
function commitCellInlineEdit(): any {
    const editing = inlineEditingCell.value;
    if (!editing)
        return;
    const target = editing.section === "footer" ? props.object.props?.footerData : props.object.props?.sampleData;
    const nextRows = updateTableCell(target, columns.value, editing.rowIndex, editing.colField, inlineEditingValue.value);
    commitTableProps({ [editing.section === "footer" ? "footerData" : "sampleData"]: nextRows }, "编辑表格单元格");
    inlineEditingCell.value = null;
    inlineEditingValue.value = "";
}
function cancelCellInlineEdit(): any {
    inlineEditingCell.value = null;
    inlineEditingValue.value = "";
}
function handleInlineCellEditorKeydown(event: any): any {
    event.stopPropagation();
    if (event.key === "Escape") {
        event.preventDefault();
        cancelCellInlineEdit();
    }
    else if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        commitCellInlineEdit();
    }
}
function startHeaderEdit(event: any, index: any): any {
    if (!canEditTable.value || !columns.value[index])
        return;
    const column = columns.value[index];
    editForm.value = { kind: "header", index, rowIndex: -1, colField: "", title: column.title, key: column.key, value: "", field: "", position: popoverPosition(event) };
}
function startFooterEdit(event: any, rowIndex: any, colField: any): any {
    if (!canEditTable.value)
        return;
    const cell = normalizeTableCell(footerRows.value[rowIndex]?.[colField]);
    editForm.value = {
        kind: "footer",
        index: -1,
        rowIndex,
        colField,
        title: "",
        key: "",
        value: String(tableCellValue(cell) ?? ""),
        field: cell?.field === colField ? colField : "",
        position: popoverPosition(event),
    };
    setSelection([{ rowIndex, colField, section: "footer" }], "footer");
}
function popoverPosition(event: any): any {
    return { top: Math.max(8, event.clientY + 8), left: Math.max(8, event.clientX + 8) };
}
function closeEditForm(): any {
    editForm.value = { kind: "", index: -1, rowIndex: -1, colField: "", title: "", key: "", value: "", field: "", position: { top: 0, left: 0 } };
}
function saveEditForm(): any {
    const form = editForm.value;
    if (form.kind === "header") {
        const next = renameTableColumn(columns.value, props.object.props?.sampleData, props.object.props?.footerData, form.index, form.key, form.title);
        if (next?.error)
            return;
        if (next)
            commitTableProps(next, "编辑表格列");
    }
    else if (form.kind === "footer") {
        const rows = updateTableCell(props.object.props?.footerData, columns.value, form.rowIndex, form.colField, form.value);
        const cell = normalizeTableCell(rows[form.rowIndex][form.colField]);
        const summaryField = form.field === form.colField ? form.colField : "";
        rows[form.rowIndex][form.colField] = summaryField ? { ...cell, field: summaryField } : ((): any => {
            const nextCell = { ...cell };
            delete nextCell.field;
            return Object.keys(nextCell).length === 1 && Object.hasOwn(nextCell, "value") ? nextCell.value : nextCell;
        })();
        commitTableProps({ footerData: rows }, "编辑表脚单元格");
    }
    closeEditForm();
}
function startColumnResize(event: any, index: any): any {
    if (!canEditTable.value)
        return;
    const column = columns.value[index];
    const hostWidth = tableHostRef.value?.getBoundingClientRect().width || 1;
    columnResize.value = { index, startX: event.clientX, startWidth: displayColumnWidth(column), hostWidth, total: totalColumnWidth.value };
    window.addEventListener("pointermove", moveColumnResize);
    window.addEventListener("pointerup", endColumnResize, { once: true });
}
function moveColumnResize(event: any): any {
    if (!columnResize.value)
        return;
    const resize = columnResize.value;
    const column = columns.value[resize.index];
    if (!column)
        return;
    const deltaWeight = ((event.clientX - resize.startX) / Math.max(1, resize.hostWidth)) * resize.total;
    tempColumnWidths.value = { ...tempColumnWidths.value, [column.key]: Math.max(10, resize.startWidth + deltaWeight) };
}
function endColumnResize(): any {
    const resize = columnResize.value;
    window.removeEventListener("pointermove", moveColumnResize);
    columnResize.value = null;
    if (!resize)
        return;
    const column = columns.value[resize.index];
    const width = Number(tempColumnWidths.value[column?.key]);
    tempColumnWidths.value = {};
    if (!column || !Number.isFinite(width) || width <= 0)
        return;
    const nextColumns = columns.value.map((item: any, index: any): any => index === resize.index ? { ...item, width } : item);
    commitTableProps({ columns: nextColumns }, "调整表格列宽");
}
function startRowResize(event: any, section: any, rowIndex: any): any {
    if (!canEditTable.value)
        return;
    const row = event.currentTarget?.closest("tr");
    const fallback = tableRowHeight(props.object.props, section, rowIndex) || 6;
    rowResize.value = { section, rowIndex, startY: event.clientY, startHeight: (row?.getBoundingClientRect().height || mmToCssPx(fallback)) / MM_TO_CSS_PX };
    window.addEventListener("pointermove", moveRowResize);
    window.addEventListener("pointerup", endRowResize, { once: true });
}
function moveRowResize(event: any): any {
    if (!rowResize.value)
        return;
    const resize = rowResize.value;
    const height = Math.max(4, resize.startHeight + (event.clientY - resize.startY) / MM_TO_CSS_PX);
    tempRowHeights.value = { ...tempRowHeights.value, [`${resize.section}:${resize.rowIndex}`]: height };
}
function endRowResize(): any {
    const resize = rowResize.value;
    window.removeEventListener("pointermove", moveRowResize);
    rowResize.value = null;
    if (!resize)
        return;
    const key = `${resize.section}:${resize.rowIndex}`;
    const height = Number(tempRowHeights.value[key]);
    tempRowHeights.value = {};
    if (!Number.isFinite(height) || height <= 0)
        return;
    if (resize.section === "header") {
        commitTableProps({ headerHeight: height }, "调整表头高度");
    }
    else {
        commitTableProps({ rowHeights: updateTableRowHeight(normalizeTableRowHeights(props.object.props?.rowHeights), resize.section, resize.rowIndex, height) }, "调整表格行高");
    }
}
function onDocumentPointerDown(event: any): any {
    if (editFormRef.value && !editFormRef.value.contains(event.target))
        closeEditForm();
}
watch((): any => selectedIds.value.join(","), (): any => {
    if (!canEditTable.value) {
        cancelCellInlineEdit();
        closeEditForm();
        selectionStore.clearTableSelection(props.object.id);
    }
});
window.addEventListener("pointerup", stopCellSelection);
window.addEventListener("pointerdown", onDocumentPointerDown);
onBeforeUnmount((): any => {
    window.removeEventListener("pointerup", stopCellSelection);
    window.removeEventListener("pointerdown", onDocumentPointerDown);
    window.removeEventListener("pointermove", moveColumnResize);
    window.removeEventListener("pointermove", moveRowResize);
    selectionStore.clearTableSelection(props.object.id);
});
</script>

<style scoped lang="scss">
.pd-table-element {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.pd-table-element__drag-zone {
  position: absolute;
  z-index: 8;
}

.pd-table-element__drag-zone--top,
.pd-table-element__drag-zone--bottom {
  right: 6px;
  left: 6px;
  height: 5px;
  cursor: move;
}

.pd-table-element__drag-zone--top { top: 0; }
.pd-table-element__drag-zone--bottom { bottom: 0; }

.pd-table-element__drag-zone--left,
.pd-table-element__drag-zone--right {
  top: 6px;
  bottom: 6px;
  width: 5px;
  cursor: move;
}

.pd-table-element__drag-zone--left { left: 0; }
.pd-table-element__drag-zone--right { right: 0; }

.pd-table-element__bindings {
  display: flex;
  z-index: 1;
  flex: 0 0 auto;
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

.pd-table-element__table-wrap {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.pd-table-element__table {
  border-collapse: collapse;
  border-spacing: 0;
}

.pd-table-element__table th,
.pd-table-element__table td {
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.pd-table-element__table td.is-selected {
  outline: 2px solid rgb(59 130 246 / 86%);
  outline-offset: -2px;
}

.pd-table-element__column-resize-handle {
  position: absolute;
  z-index: 10;
  top: 0;
  right: -4px;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
}

.pd-table-element__row-resize-handle {
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: -4px;
  left: 0;
  height: 8px;
  cursor: row-resize;
}

.pd-table-element__cell-editor {
  display: block;
  width: 100%;
  min-height: 20px;
  padding: 0;
  border: 0;
  resize: none;
  color: inherit;
  background: transparent;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  outline: 0;
}

.pd-table-element__omission td {
  color: #94a3b8;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-align: center;
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

.pd-table-element__edit-popover {
  position: fixed;
  z-index: 1000;
  display: grid;
  width: 220px;
  gap: 8px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 18%);
  color: #0f172a;
}

.pd-table-element__edit-popover label {
  display: grid;
  gap: 3px;
  font-size: 11px;
}

.pd-table-element__edit-popover input,
.pd-table-element__edit-popover select {
  min-width: 0;
  padding: 5px 6px;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  color: inherit;
  background: #ffffff;
}

.pd-table-element__edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.pd-table-element__edit-actions button {
  padding: 4px 8px;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
}

.pd-table-element__edit-actions button[type="submit"] {
  border-color: #2563eb;
  color: #ffffff;
  background: #2563eb;
}
</style>
