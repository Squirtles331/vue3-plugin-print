const TABLE_CELL_STYLE_KEYS = new Set([
    "backgroundColor",
    "color",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "textAlign",
    "verticalAlign",
    "textDecoration",
]) as any;
function isObject(value: any): any {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function clone(value: any): any {
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(value);
        }
        catch {
            // Vue's reactive proxies are JSON-safe configuration but not structured-cloneable.
        }
    }
    return JSON.parse(JSON.stringify(value));
}
function spanValue(value: any, fallback: any = 1): any {
    const numeric = Math.floor(Number(value)) as any;
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}
export function normalizeTableColumn(column: any, index: any = 0): any {
    const fallback = `field${index + 1}` as any;
    const width = Number(column?.width) as any;
    const key = typeof column?.key === "string" && column.key.trim()
        ? column.key.trim()
        : fallback as any;
    const valuePath = typeof column?.valuePath === "string" && column.valuePath.trim()
        ? column.valuePath.trim()
        : key as any;
    const title = typeof column?.title === "string"
        ? column.title
        : `列 ${index + 1}` as any;
    return {
        key,
        valuePath,
        title,
        width: Number.isFinite(width) && width > 0 ? width : 100,
        align: column?.align === "center" || column?.align === "right" ? column.align : "left",
        ...(isObject(column?.formatter) ? { formatter: clone(column.formatter) } : {}),
    };
}
export function normalizeTableColumns(columns: any): any {
    const usedKeys = new Set() as any;
    return (Array.isArray(columns) ? columns : []).map((column: any, index: any): any => {
        const normalized = normalizeTableColumn(column, index) as any;
        let key = normalized.key as any;
        let suffix = 2 as any;
        while (usedKeys.has(key)) {
            key = `${normalized.key}_${suffix}`;
            suffix += 1;
        }
        usedKeys.add(key);
        return key === normalized.key ? normalized : { ...normalized, key, valuePath: normalized.valuePath === normalized.key ? key : normalized.valuePath };
    });
}
export function isTableCellDescriptor(value: any): any {
    return isObject(value) && ["value", "field", "result", "rowSpan", "colSpan", "style"].some((key: any): any => Object.hasOwn(value, key));
}
export function normalizeTableCellStyle(style: any): any {
    if (!isObject(style))
        return {};
    return Object.fromEntries(Object.entries(style).filter(([key, value]: any): any => TABLE_CELL_STYLE_KEYS.has(key) && value !== undefined && value !== null && value !== ""));
}
export function normalizeTableCell(value: any): any {
    if (!isTableCellDescriptor(value)) {
        return value == null ? "" : value;
    }
    const cell = {} as any;
    if (Object.hasOwn(value, "value"))
        cell.value = value.value == null ? "" : value.value;
    if (typeof value.field === "string" && value.field.trim())
        cell.field = value.field.trim();
    if (Object.hasOwn(value, "result"))
        cell.result = value.result == null ? "" : value.result;
    if (Object.hasOwn(value, "rowSpan"))
        cell.rowSpan = spanValue(value.rowSpan);
    if (Object.hasOwn(value, "colSpan"))
        cell.colSpan = spanValue(value.colSpan);
    const style = normalizeTableCellStyle(value.style) as any;
    if (Object.keys(style).length)
        cell.style = style;
    return cell;
}
export function toTableCellDescriptor(value: any): any {
    return isTableCellDescriptor(value) ? normalizeTableCell(value) : { value: value == null ? "" : value };
}
export function tableCellValue(value: any): any {
    if (!isTableCellDescriptor(value))
        return value == null ? "" : value;
    return value.value == null ? "" : value.value;
}
export function tableCellStyle(value: any): any {
    return isTableCellDescriptor(value) ? normalizeTableCellStyle(value.style) : {};
}
export function tableCellRowSpan(value: any): any {
    return isTableCellDescriptor(value) ? spanValue(value.rowSpan, 1) : 1;
}
export function tableCellColSpan(value: any): any {
    return isTableCellDescriptor(value) ? spanValue(value.colSpan, 1) : 1;
}
export function shouldRenderTableCell(value: any): any {
    return !(isTableCellDescriptor(value) && (tableCellRowSpan(value) === 0 || tableCellColSpan(value) === 0));
}
export function tableCellDisplayValue(value: any, rows: any = []): any {
    if (!isTableCellDescriptor(value))
        return value == null ? "" : value;
    const prefix = value.value == null ? "" : value.value as any;
    if (value.result !== undefined && value.result !== null && value.result !== "") {
        return `${prefix}${value.result}`;
    }
    if (value.field) {
        const total = (Array.isArray(rows) ? rows : []).reduce((sum: any, row: any): any => {
            const candidate = tableCellValue(row?.[value.field]) as any;
            const numeric = Number(candidate) as any;
            return sum + (Number.isFinite(numeric) ? numeric : 0);
        }, 0) as any;
        return `${prefix}${total}`;
    }
    return prefix;
}
export function createEmptyTableRow(columns: any): any {
    return normalizeTableColumns(columns).reduce((row: any, column: any): any => {
        row[column.key] = "";
        return row;
    }, {});
}
export function normalizeTableRow(row: any, columns: any): any {
    const source = isObject(row) ? row : {} as any;
    return normalizeTableColumns(columns).reduce((result: any, column: any): any => {
        result[column.key] = normalizeTableCell(source[column.key]);
        return result;
    }, {});
}
export function normalizeTableRows(rows: any, columns: any): any {
    return (Array.isArray(rows) ? rows : []).map((row: any): any => normalizeTableRow(row, columns));
}
export function ensureTableRow(rows: any, columns: any, rowIndex: any): any {
    const nextRows = normalizeTableRows(rows, columns) as any;
    while (nextRows.length <= rowIndex)
        nextRows.push(createEmptyTableRow(columns));
    return nextRows;
}
export function updateTableCell(rows: any, columns: any, rowIndex: any, key: any, value: any): any {
    const nextRows = ensureTableRow(rows, columns, rowIndex) as any;
    const current = nextRows[rowIndex]?.[key] as any;
    nextRows[rowIndex][key] = isTableCellDescriptor(current)
        ? { ...normalizeTableCell(current), value: value == null ? "" : value }
        : value == null ? "" : value;
    return nextRows;
}
export function getTableCellAnchor(rows: any, columns: any, rowIndex: any, columnIndex: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const normalizedRows = normalizeTableRows(rows, normalizedColumns) as any;
    if (rowIndex < 0 || columnIndex < 0 || rowIndex >= normalizedRows.length || columnIndex >= normalizedColumns.length)
        return null;
    for (let sourceRowIndex = 0 as any; sourceRowIndex <= rowIndex; sourceRowIndex += 1) {
        for (let sourceColumnIndex = 0 as any; sourceColumnIndex <= columnIndex; sourceColumnIndex += 1) {
            const sourceCell = normalizedRows[sourceRowIndex]?.[normalizedColumns[sourceColumnIndex].key] as any;
            if (!shouldRenderTableCell(sourceCell))
                continue;
            const rowSpan = tableCellRowSpan(sourceCell) as any;
            const colSpan = tableCellColSpan(sourceCell) as any;
            if (sourceRowIndex + rowSpan > rowIndex && sourceColumnIndex + colSpan > columnIndex) {
                return { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex, cell: sourceCell };
            }
        }
    }
    return null;
}
function boundsFromCells(cells: any, columns: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const rowIndexes = cells.map((cell: any): any => Number(cell?.rowIndex)).filter(Number.isFinite) as any;
    const columnIndexes = cells
        .map((cell: any): any => normalizedColumns.findIndex((column: any): any => column.key === cell?.colField))
        .filter((index: any): any => index >= 0) as any;
    if (!rowIndexes.length || !columnIndexes.length)
        return null;
    return {
        minRow: Math.min(...rowIndexes),
        maxRow: Math.max(...rowIndexes),
        minColumn: Math.min(...columnIndexes),
        maxColumn: Math.max(...columnIndexes),
    };
}
export function mergeTableCells(rows: any, columns: any, cells: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const nextRows = normalizeTableRows(rows, normalizedColumns) as any;
    const bounds = boundsFromCells(cells || [], normalizedColumns) as any;
    if (!bounds || (bounds.minRow === bounds.maxRow && bounds.minColumn === bounds.maxColumn)) {
        return { rows: nextRows, changed: false, reason: "请选择至少两个相邻单元格。" };
    }
    if (bounds.maxRow >= nextRows.length) {
        return { rows: nextRows, changed: false, reason: "选区超出表格数据范围。" };
    }
    for (let rowIndex = bounds.minRow as any; rowIndex <= bounds.maxRow; rowIndex += 1) {
        for (let columnIndex = bounds.minColumn as any; columnIndex <= bounds.maxColumn; columnIndex += 1) {
            const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex) as any;
            if (!anchor || anchor.rowIndex < bounds.minRow || anchor.rowIndex + tableCellRowSpan(anchor.cell) - 1 > bounds.maxRow || anchor.columnIndex < bounds.minColumn || anchor.columnIndex + tableCellColSpan(anchor.cell) - 1 > bounds.maxColumn) {
                return { rows: nextRows, changed: false, reason: "选区不能与已有合并单元格交叉。" };
            }
        }
    }
    const anchorKey = normalizedColumns[bounds.minColumn].key as any;
    const anchorCell = toTableCellDescriptor(nextRows[bounds.minRow][anchorKey]) as any;
    nextRows[bounds.minRow][anchorKey] = {
        ...anchorCell,
        rowSpan: bounds.maxRow - bounds.minRow + 1,
        colSpan: bounds.maxColumn - bounds.minColumn + 1,
    };
    for (let rowIndex = bounds.minRow as any; rowIndex <= bounds.maxRow; rowIndex += 1) {
        for (let columnIndex = bounds.minColumn as any; columnIndex <= bounds.maxColumn; columnIndex += 1) {
            if (rowIndex === bounds.minRow && columnIndex === bounds.minColumn)
                continue;
            const key = normalizedColumns[columnIndex].key as any;
            const cell = toTableCellDescriptor(nextRows[rowIndex][key]) as any;
            nextRows[rowIndex][key] = { ...cell, rowSpan: 0, colSpan: 0 };
        }
    }
    return { rows: nextRows, changed: true, bounds };
}
export function splitTableCell(rows: any, columns: any, rowIndex: any, colField: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const columnIndex = normalizedColumns.findIndex((column: any): any => column.key === colField) as any;
    const nextRows = normalizeTableRows(rows, normalizedColumns) as any;
    const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex) as any;
    if (!anchor || (tableCellRowSpan(anchor.cell) === 1 && tableCellColSpan(anchor.cell) === 1)) {
        return { rows: nextRows, changed: false, reason: "当前单元格未合并。" };
    }
    const rowSpan = tableCellRowSpan(anchor.cell) as any;
    const colSpan = tableCellColSpan(anchor.cell) as any;
    for (let targetRow = anchor.rowIndex as any; targetRow < anchor.rowIndex + rowSpan; targetRow += 1) {
        for (let targetColumn = anchor.columnIndex as any; targetColumn < anchor.columnIndex + colSpan; targetColumn += 1) {
            const key = normalizedColumns[targetColumn]?.key as any;
            if (!key || !nextRows[targetRow])
                continue;
            const cell = toTableCellDescriptor(nextRows[targetRow][key]) as any;
            delete cell.rowSpan;
            delete cell.colSpan;
            nextRows[targetRow][key] = Object.keys(cell).length === 1 && Object.hasOwn(cell, "value") ? cell.value : cell;
        }
    }
    return { rows: nextRows, changed: true, anchor };
}
export function applyTableCellStyle(rows: any, columns: any, cells: any, patch: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const nextRows = normalizeTableRows(rows, normalizedColumns) as any;
    const stylePatch = normalizeTableCellStyle(patch) as any;
    if (!Object.keys(stylePatch).length)
        return { rows: nextRows, changed: false };
    const unique = new Set() as any;
    (cells || []).forEach((selection: any): any => {
        const rowIndex = Number(selection?.rowIndex) as any;
        const columnIndex = normalizedColumns.findIndex((column: any): any => column.key === selection?.colField) as any;
        if (!Number.isFinite(rowIndex) || columnIndex < 0 || !nextRows[rowIndex])
            return;
        const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex) as any;
        if (!anchor)
            return;
        unique.add(`${anchor.rowIndex}:${anchor.columnIndex}`);
    });
    unique.forEach((coordinate: any): any => {
        const [rowIndex, columnIndex] = coordinate.split(":").map(Number) as any;
        const key = normalizedColumns[columnIndex].key as any;
        const cell = toTableCellDescriptor(nextRows[rowIndex][key]) as any;
        nextRows[rowIndex][key] = { ...cell, style: { ...normalizeTableCellStyle(cell.style), ...stylePatch } };
    });
    return { rows: nextRows, changed: unique.size > 0 };
}
export function normalizeTableRowHeights(value: any): any {
    const source = isObject(value) ? value : {} as any;
    const section = (key: any): any => Object.fromEntries(Object.entries(isObject(source[key]) ? source[key] : {})
        .map(([index, height]: any): any => [String(index), Number(height)])
        .filter(([index, height]: any): any => /^\d+$/.test(index) && Number.isFinite(height) && height > 0)) as any;
    return { body: section("body"), footer: section("footer") };
}
export function updateTableRowHeight(rowHeights: any, section: any, rowIndex: any, height: any): any {
    const next = normalizeTableRowHeights(rowHeights) as any;
    const numeric = Number(height) as any;
    if (!["body", "footer"].includes(section) || !Number.isFinite(numeric) || numeric <= 0)
        return next;
    next[section][String(Math.max(0, Math.floor(Number(rowIndex) || 0)))] = numeric;
    return next;
}
function shiftRowHeights(rowHeights: any, section: any, index: any, offset: any): any {
    const next = normalizeTableRowHeights(rowHeights) as any;
    const shifted = {} as any;
    Object.entries(next[section]).forEach(([key, value]: any): any => {
        const numericIndex = Number(key) as any;
        if (offset < 0 && numericIndex === index)
            return;
        const nextIndex = numericIndex >= index ? numericIndex + offset : numericIndex as any;
        if (nextIndex >= 0)
            shifted[String(nextIndex)] = value;
    });
    next[section] = shifted;
    return next;
}
export function insertTableRow(rows: any, columns: any, rowIndex: any, rowHeights: any, section: any = "body"): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const nextRows = normalizeTableRows(rows, normalizedColumns) as any;
    const index = Math.max(0, Math.min(nextRows.length, Math.floor(Number(rowIndex) || 0))) as any;
    nextRows.forEach((row: any, sourceRowIndex: any): any => {
        normalizedColumns.forEach((column: any): any => {
            const cell = row[column.key] as any;
            if (shouldRenderTableCell(cell) && sourceRowIndex < index && sourceRowIndex + tableCellRowSpan(cell) >= index) {
                row[column.key] = { ...toTableCellDescriptor(cell), rowSpan: tableCellRowSpan(cell) + 1 };
            }
        });
    });
    nextRows.splice(index, 0, createEmptyTableRow(normalizedColumns));
    return { rows: nextRows, rowHeights: shiftRowHeights(rowHeights, section, index, 1), index };
}
export function removeTableRow(rows: any, columns: any, rowIndex: any, rowHeights: any, section: any = "body"): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const nextRows = normalizeTableRows(rows, normalizedColumns) as any;
    const index = Math.floor(Number(rowIndex)) as any;
    if (!Number.isFinite(index) || index < 0 || index >= nextRows.length)
        return { rows: nextRows, rowHeights: normalizeTableRowHeights(rowHeights), changed: false };
    normalizedColumns.forEach((column: any): any => {
        for (let sourceRowIndex = 0 as any; sourceRowIndex < nextRows.length; sourceRowIndex += 1) {
            const cell = nextRows[sourceRowIndex]?.[column.key] as any;
            if (!shouldRenderTableCell(cell))
                continue;
            const span = tableCellRowSpan(cell) as any;
            if (sourceRowIndex === index && span > 1 && nextRows[index + 1]) {
                const promoted = { ...toTableCellDescriptor(cell), rowSpan: span - 1 } as any;
                nextRows[index + 1][column.key] = promoted;
            }
            else if (sourceRowIndex < index && sourceRowIndex + span > index) {
                const nextCell = { ...toTableCellDescriptor(cell), rowSpan: Math.max(1, span - 1) } as any;
                if (nextCell.rowSpan === 1)
                    delete nextCell.rowSpan;
                nextRows[sourceRowIndex][column.key] = nextCell;
            }
        }
    });
    nextRows.splice(index, 1);
    return { rows: nextRows, rowHeights: shiftRowHeights(rowHeights, section, index, -1), changed: true };
}
function nextColumnKey(columns: any): any {
    const existing = new Set(columns.map((column: any): any => column.key)) as any;
    let index = columns.length + 1 as any;
    while (existing.has(`field${index}`))
        index += 1;
    return `field${index}`;
}
export function insertTableColumn(columns: any, sampleData: any, footerData: any, columnIndex: any): any {
    const sourceColumns = normalizeTableColumns(columns) as any;
    const nextColumns = [...sourceColumns] as any;
    const index = Math.max(0, Math.min(nextColumns.length, Math.floor(Number(columnIndex) || 0))) as any;
    const key = nextColumnKey(nextColumns) as any;
    nextColumns.splice(index, 0, { key, valuePath: key, title: `列 ${nextColumns.length + 1}`, width: 100, align: "left" });
    const insert = (rows: any): any => normalizeTableRows(rows, sourceColumns).map((row: any): any => {
        const next = {} as any;
        nextColumns.forEach((column: any, currentIndex: any): any => {
            if (currentIndex === index) {
                next[column.key] = "";
            }
            else {
                const original = currentIndex > index ? sourceColumns[currentIndex - 1] : sourceColumns[currentIndex] as any;
                next[column.key] = normalizeTableCell(row[original?.key]);
            }
        });
        sourceColumns.forEach((column: any, sourceIndex: any): any => {
            const cell = row[column.key] as any;
            if (shouldRenderTableCell(cell) && sourceIndex < index && sourceIndex + tableCellColSpan(cell) >= index) {
                next[column.key] = { ...toTableCellDescriptor(next[column.key]), colSpan: tableCellColSpan(cell) + 1 };
                next[key] = { value: "", rowSpan: 0, colSpan: 0 };
            }
        });
        return next;
    }) as any;
    return { columns: nextColumns, sampleData: insert(sampleData), footerData: insert(footerData), index };
}
export function removeTableColumn(columns: any, sampleData: any, footerData: any, columnIndex: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const index = Math.floor(Number(columnIndex)) as any;
    if (normalizedColumns.length <= 1 || !Number.isFinite(index) || index < 0 || index >= normalizedColumns.length) {
        return { columns: normalizedColumns, sampleData: normalizeTableRows(sampleData, normalizedColumns), footerData: normalizeTableRows(footerData, normalizedColumns), changed: false };
    }
    const removed = normalizedColumns[index] as any;
    const nextColumns = normalizedColumns.filter((_: any, currentIndex: any): any => currentIndex !== index) as any;
    const remove = (rows: any): any => normalizeTableRows(rows, normalizedColumns).map((row: any): any => {
        const source = { ...row } as any;
        normalizedColumns.forEach((column: any, sourceIndex: any): any => {
            const cell = source[column.key] as any;
            if (!shouldRenderTableCell(cell))
                return;
            const span = tableCellColSpan(cell) as any;
            if (sourceIndex === index && span > 1) {
                const promotedColumn = normalizedColumns[index + 1] as any;
                source[promotedColumn.key] = { ...toTableCellDescriptor(cell), colSpan: span - 1 };
            }
            else if (sourceIndex < index && sourceIndex + span > index) {
                const nextCell = { ...toTableCellDescriptor(cell), colSpan: Math.max(1, span - 1) } as any;
                if (nextCell.colSpan === 1)
                    delete nextCell.colSpan;
                source[column.key] = nextCell;
            }
        });
        delete source[removed.key];
        return normalizeTableRow(source, nextColumns);
    }) as any;
    return { columns: nextColumns, sampleData: remove(sampleData), footerData: remove(footerData), changed: true, removed };
}
export function renameTableColumn(columns: any, sampleData: any, footerData: any, columnIndex: any, nextKey: any, nextTitle: any): any {
    const normalizedColumns = normalizeTableColumns(columns) as any;
    const index = Math.floor(Number(columnIndex)) as any;
    if (!Number.isFinite(index) || index < 0 || index >= normalizedColumns.length)
        return null;
    const current = normalizedColumns[index] as any;
    const key = String(nextKey || "").trim() || current.key as any;
    if (normalizedColumns.some((column: any, currentIndex: any): any => currentIndex !== index && column.key === key)) {
        return { error: "字段 key 不能重复。" };
    }
    const nextColumns = normalizedColumns.map((column: any, currentIndex: any): any => currentIndex === index
        ? { ...column, key, valuePath: column.valuePath === current.key ? key : column.valuePath, title: nextTitle == null ? column.title : String(nextTitle) }
        : column) as any;
    const rename = (rows: any): any => normalizeTableRows(rows, normalizedColumns).map((row: any): any => {
        const next = Object.fromEntries(Object.entries(row).map(([cellKey, cellValue]: any): any => {
            const cell = normalizeTableCell(cellValue) as any;
            return [cellKey, isTableCellDescriptor(cell) && cell.field === current.key ? { ...cell, field: key } : cell];
        })) as any;
        next[key] = next[current.key] ?? "";
        if (key !== current.key)
            delete next[current.key];
        return normalizeTableRow(next, nextColumns);
    }) as any;
    return { columns: nextColumns, sampleData: rename(sampleData), footerData: rename(footerData) };
}
export function tableRowHeight(props: any, section: any, rowIndex: any): any {
    const heights = normalizeTableRowHeights(props?.rowHeights) as any;
    if (section === "body")
        return Number(heights.body[String(rowIndex)]) || Number(props?.rowHeight) || 0;
    if (section === "footer")
        return Number(heights.footer[String(rowIndex)]) || Number(props?.footerHeight) || 0;
    return Number(props?.headerHeight) || 0;
}
export { TABLE_CELL_STYLE_KEYS };
