const TABLE_CELL_STYLE_KEYS = new Set([
  "backgroundColor",
  "color",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "textAlign",
  "verticalAlign",
  "textDecoration",
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Vue's reactive proxies are JSON-safe configuration but not structured-cloneable.
    }
  }
  return JSON.parse(JSON.stringify(value));
}

function spanValue(value, fallback = 1) {
  const numeric = Math.floor(Number(value));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

export function normalizeTableColumn(column, index = 0) {
  const fallback = `field${index + 1}`;
  const width = Number(column?.width);
  const key = typeof column?.key === "string" && column.key.trim()
    ? column.key.trim()
    : fallback;
  const valuePath = typeof column?.valuePath === "string" && column.valuePath.trim()
    ? column.valuePath.trim()
    : key;
  const title = typeof column?.title === "string"
    ? column.title
    : `列 ${index + 1}`;

  return {
    key,
    valuePath,
    title,
    width: Number.isFinite(width) && width > 0 ? width : 100,
    align: column?.align === "center" || column?.align === "right" ? column.align : "left",
    ...(isObject(column?.formatter) ? { formatter: clone(column.formatter) } : {}),
  };
}

export function normalizeTableColumns(columns) {
  const usedKeys = new Set();
  return (Array.isArray(columns) ? columns : []).map((column, index) => {
    const normalized = normalizeTableColumn(column, index);
    let key = normalized.key;
    let suffix = 2;
    while (usedKeys.has(key)) {
      key = `${normalized.key}_${suffix}`;
      suffix += 1;
    }
    usedKeys.add(key);
    return key === normalized.key ? normalized : { ...normalized, key, valuePath: normalized.valuePath === normalized.key ? key : normalized.valuePath };
  });
}

export function isTableCellDescriptor(value) {
  return isObject(value) && ["value", "field", "result", "rowSpan", "colSpan", "style"].some((key) => Object.hasOwn(value, key));
}

export function normalizeTableCellStyle(style) {
  if (!isObject(style)) return {};
  return Object.fromEntries(
    Object.entries(style).filter(([key, value]) => TABLE_CELL_STYLE_KEYS.has(key) && value !== undefined && value !== null && value !== ""),
  );
}

export function normalizeTableCell(value) {
  if (!isTableCellDescriptor(value)) {
    return value == null ? "" : value;
  }

  const cell = {};
  if (Object.hasOwn(value, "value")) cell.value = value.value == null ? "" : value.value;
  if (typeof value.field === "string" && value.field.trim()) cell.field = value.field.trim();
  if (Object.hasOwn(value, "result")) cell.result = value.result == null ? "" : value.result;
  if (Object.hasOwn(value, "rowSpan")) cell.rowSpan = spanValue(value.rowSpan);
  if (Object.hasOwn(value, "colSpan")) cell.colSpan = spanValue(value.colSpan);
  const style = normalizeTableCellStyle(value.style);
  if (Object.keys(style).length) cell.style = style;
  return cell;
}

export function toTableCellDescriptor(value) {
  return isTableCellDescriptor(value) ? normalizeTableCell(value) : { value: value == null ? "" : value };
}

export function tableCellValue(value) {
  if (!isTableCellDescriptor(value)) return value == null ? "" : value;
  return value.value == null ? "" : value.value;
}

export function tableCellStyle(value) {
  return isTableCellDescriptor(value) ? normalizeTableCellStyle(value.style) : {};
}

export function tableCellRowSpan(value) {
  return isTableCellDescriptor(value) ? spanValue(value.rowSpan, 1) : 1;
}

export function tableCellColSpan(value) {
  return isTableCellDescriptor(value) ? spanValue(value.colSpan, 1) : 1;
}

export function shouldRenderTableCell(value) {
  return !(isTableCellDescriptor(value) && (tableCellRowSpan(value) === 0 || tableCellColSpan(value) === 0));
}

export function tableCellDisplayValue(value, rows = []) {
  if (!isTableCellDescriptor(value)) return value == null ? "" : value;
  const prefix = value.value == null ? "" : value.value;
  if (value.result !== undefined && value.result !== null && value.result !== "") {
    return `${prefix}${value.result}`;
  }
  if (value.field) {
    const total = (Array.isArray(rows) ? rows : []).reduce((sum, row) => {
      const candidate = tableCellValue(row?.[value.field]);
      const numeric = Number(candidate);
      return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);
    return `${prefix}${total}`;
  }
  return prefix;
}

export function createEmptyTableRow(columns) {
  return normalizeTableColumns(columns).reduce((row, column) => {
    row[column.key] = "";
    return row;
  }, {});
}

export function normalizeTableRow(row, columns) {
  const source = isObject(row) ? row : {};
  return normalizeTableColumns(columns).reduce((result, column) => {
    result[column.key] = normalizeTableCell(source[column.key]);
    return result;
  }, {});
}

export function normalizeTableRows(rows, columns) {
  return (Array.isArray(rows) ? rows : []).map((row) => normalizeTableRow(row, columns));
}

export function ensureTableRow(rows, columns, rowIndex) {
  const nextRows = normalizeTableRows(rows, columns);
  while (nextRows.length <= rowIndex) nextRows.push(createEmptyTableRow(columns));
  return nextRows;
}

export function updateTableCell(rows, columns, rowIndex, key, value) {
  const nextRows = ensureTableRow(rows, columns, rowIndex);
  const current = nextRows[rowIndex]?.[key];
  nextRows[rowIndex][key] = isTableCellDescriptor(current)
    ? { ...normalizeTableCell(current), value: value == null ? "" : value }
    : value == null ? "" : value;
  return nextRows;
}

export function getTableCellAnchor(rows, columns, rowIndex, columnIndex) {
  const normalizedColumns = normalizeTableColumns(columns);
  const normalizedRows = normalizeTableRows(rows, normalizedColumns);
  if (rowIndex < 0 || columnIndex < 0 || rowIndex >= normalizedRows.length || columnIndex >= normalizedColumns.length) return null;

  for (let sourceRowIndex = 0; sourceRowIndex <= rowIndex; sourceRowIndex += 1) {
    for (let sourceColumnIndex = 0; sourceColumnIndex <= columnIndex; sourceColumnIndex += 1) {
      const sourceCell = normalizedRows[sourceRowIndex]?.[normalizedColumns[sourceColumnIndex].key];
      if (!shouldRenderTableCell(sourceCell)) continue;
      const rowSpan = tableCellRowSpan(sourceCell);
      const colSpan = tableCellColSpan(sourceCell);
      if (sourceRowIndex + rowSpan > rowIndex && sourceColumnIndex + colSpan > columnIndex) {
        return { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex, cell: sourceCell };
      }
    }
  }
  return null;
}

function boundsFromCells(cells, columns) {
  const normalizedColumns = normalizeTableColumns(columns);
  const rowIndexes = cells.map((cell) => Number(cell?.rowIndex)).filter(Number.isFinite);
  const columnIndexes = cells
    .map((cell) => normalizedColumns.findIndex((column) => column.key === cell?.colField))
    .filter((index) => index >= 0);
  if (!rowIndexes.length || !columnIndexes.length) return null;
  return {
    minRow: Math.min(...rowIndexes),
    maxRow: Math.max(...rowIndexes),
    minColumn: Math.min(...columnIndexes),
    maxColumn: Math.max(...columnIndexes),
  };
}

export function mergeTableCells(rows, columns, cells) {
  const normalizedColumns = normalizeTableColumns(columns);
  const nextRows = normalizeTableRows(rows, normalizedColumns);
  const bounds = boundsFromCells(cells || [], normalizedColumns);
  if (!bounds || (bounds.minRow === bounds.maxRow && bounds.minColumn === bounds.maxColumn)) {
    return { rows: nextRows, changed: false, reason: "请选择至少两个相邻单元格。" };
  }
  if (bounds.maxRow >= nextRows.length) {
    return { rows: nextRows, changed: false, reason: "选区超出表格数据范围。" };
  }

  for (let rowIndex = bounds.minRow; rowIndex <= bounds.maxRow; rowIndex += 1) {
    for (let columnIndex = bounds.minColumn; columnIndex <= bounds.maxColumn; columnIndex += 1) {
      const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex);
      if (!anchor || anchor.rowIndex < bounds.minRow || anchor.rowIndex + tableCellRowSpan(anchor.cell) - 1 > bounds.maxRow || anchor.columnIndex < bounds.minColumn || anchor.columnIndex + tableCellColSpan(anchor.cell) - 1 > bounds.maxColumn) {
        return { rows: nextRows, changed: false, reason: "选区不能与已有合并单元格交叉。" };
      }
    }
  }

  const anchorKey = normalizedColumns[bounds.minColumn].key;
  const anchorCell = toTableCellDescriptor(nextRows[bounds.minRow][anchorKey]);
  nextRows[bounds.minRow][anchorKey] = {
    ...anchorCell,
    rowSpan: bounds.maxRow - bounds.minRow + 1,
    colSpan: bounds.maxColumn - bounds.minColumn + 1,
  };

  for (let rowIndex = bounds.minRow; rowIndex <= bounds.maxRow; rowIndex += 1) {
    for (let columnIndex = bounds.minColumn; columnIndex <= bounds.maxColumn; columnIndex += 1) {
      if (rowIndex === bounds.minRow && columnIndex === bounds.minColumn) continue;
      const key = normalizedColumns[columnIndex].key;
      const cell = toTableCellDescriptor(nextRows[rowIndex][key]);
      nextRows[rowIndex][key] = { ...cell, rowSpan: 0, colSpan: 0 };
    }
  }

  return { rows: nextRows, changed: true, bounds };
}

export function splitTableCell(rows, columns, rowIndex, colField) {
  const normalizedColumns = normalizeTableColumns(columns);
  const columnIndex = normalizedColumns.findIndex((column) => column.key === colField);
  const nextRows = normalizeTableRows(rows, normalizedColumns);
  const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex);
  if (!anchor || (tableCellRowSpan(anchor.cell) === 1 && tableCellColSpan(anchor.cell) === 1)) {
    return { rows: nextRows, changed: false, reason: "当前单元格未合并。" };
  }

  const rowSpan = tableCellRowSpan(anchor.cell);
  const colSpan = tableCellColSpan(anchor.cell);
  for (let targetRow = anchor.rowIndex; targetRow < anchor.rowIndex + rowSpan; targetRow += 1) {
    for (let targetColumn = anchor.columnIndex; targetColumn < anchor.columnIndex + colSpan; targetColumn += 1) {
      const key = normalizedColumns[targetColumn]?.key;
      if (!key || !nextRows[targetRow]) continue;
      const cell = toTableCellDescriptor(nextRows[targetRow][key]);
      delete cell.rowSpan;
      delete cell.colSpan;
      nextRows[targetRow][key] = Object.keys(cell).length === 1 && Object.hasOwn(cell, "value") ? cell.value : cell;
    }
  }
  return { rows: nextRows, changed: true, anchor };
}

export function applyTableCellStyle(rows, columns, cells, patch) {
  const normalizedColumns = normalizeTableColumns(columns);
  const nextRows = normalizeTableRows(rows, normalizedColumns);
  const stylePatch = normalizeTableCellStyle(patch);
  if (!Object.keys(stylePatch).length) return { rows: nextRows, changed: false };

  const unique = new Set();
  (cells || []).forEach((selection) => {
    const rowIndex = Number(selection?.rowIndex);
    const columnIndex = normalizedColumns.findIndex((column) => column.key === selection?.colField);
    if (!Number.isFinite(rowIndex) || columnIndex < 0 || !nextRows[rowIndex]) return;
    const anchor = getTableCellAnchor(nextRows, normalizedColumns, rowIndex, columnIndex);
    if (!anchor) return;
    unique.add(`${anchor.rowIndex}:${anchor.columnIndex}`);
  });

  unique.forEach((coordinate) => {
    const [rowIndex, columnIndex] = coordinate.split(":").map(Number);
    const key = normalizedColumns[columnIndex].key;
    const cell = toTableCellDescriptor(nextRows[rowIndex][key]);
    nextRows[rowIndex][key] = { ...cell, style: { ...normalizeTableCellStyle(cell.style), ...stylePatch } };
  });
  return { rows: nextRows, changed: unique.size > 0 };
}

export function normalizeTableRowHeights(value) {
  const source = isObject(value) ? value : {};
  const section = (key) => Object.fromEntries(
    Object.entries(isObject(source[key]) ? source[key] : {})
      .map(([index, height]) => [String(index), Number(height)])
      .filter(([index, height]) => /^\d+$/.test(index) && Number.isFinite(height) && height > 0),
  );
  return { body: section("body"), footer: section("footer") };
}

export function updateTableRowHeight(rowHeights, section, rowIndex, height) {
  const next = normalizeTableRowHeights(rowHeights);
  const numeric = Number(height);
  if (!["body", "footer"].includes(section) || !Number.isFinite(numeric) || numeric <= 0) return next;
  next[section][String(Math.max(0, Math.floor(Number(rowIndex) || 0)))] = numeric;
  return next;
}

function shiftRowHeights(rowHeights, section, index, offset) {
  const next = normalizeTableRowHeights(rowHeights);
  const shifted = {};
  Object.entries(next[section]).forEach(([key, value]) => {
    const numericIndex = Number(key);
    if (offset < 0 && numericIndex === index) return;
    const nextIndex = numericIndex >= index ? numericIndex + offset : numericIndex;
    if (nextIndex >= 0) shifted[String(nextIndex)] = value;
  });
  next[section] = shifted;
  return next;
}

export function insertTableRow(rows, columns, rowIndex, rowHeights, section = "body") {
  const normalizedColumns = normalizeTableColumns(columns);
  const nextRows = normalizeTableRows(rows, normalizedColumns);
  const index = Math.max(0, Math.min(nextRows.length, Math.floor(Number(rowIndex) || 0)));
  nextRows.forEach((row, sourceRowIndex) => {
    normalizedColumns.forEach((column) => {
      const cell = row[column.key];
      if (shouldRenderTableCell(cell) && sourceRowIndex < index && sourceRowIndex + tableCellRowSpan(cell) >= index) {
        row[column.key] = { ...toTableCellDescriptor(cell), rowSpan: tableCellRowSpan(cell) + 1 };
      }
    });
  });
  nextRows.splice(index, 0, createEmptyTableRow(normalizedColumns));
  return { rows: nextRows, rowHeights: shiftRowHeights(rowHeights, section, index, 1), index };
}

export function removeTableRow(rows, columns, rowIndex, rowHeights, section = "body") {
  const normalizedColumns = normalizeTableColumns(columns);
  const nextRows = normalizeTableRows(rows, normalizedColumns);
  const index = Math.floor(Number(rowIndex));
  if (!Number.isFinite(index) || index < 0 || index >= nextRows.length) return { rows: nextRows, rowHeights: normalizeTableRowHeights(rowHeights), changed: false };

  normalizedColumns.forEach((column) => {
    for (let sourceRowIndex = 0; sourceRowIndex < nextRows.length; sourceRowIndex += 1) {
      const cell = nextRows[sourceRowIndex]?.[column.key];
      if (!shouldRenderTableCell(cell)) continue;
      const span = tableCellRowSpan(cell);
      if (sourceRowIndex === index && span > 1 && nextRows[index + 1]) {
        const promoted = { ...toTableCellDescriptor(cell), rowSpan: span - 1 };
        nextRows[index + 1][column.key] = promoted;
      } else if (sourceRowIndex < index && sourceRowIndex + span > index) {
        const nextCell = { ...toTableCellDescriptor(cell), rowSpan: Math.max(1, span - 1) };
        if (nextCell.rowSpan === 1) delete nextCell.rowSpan;
        nextRows[sourceRowIndex][column.key] = nextCell;
      }
    }
  });
  nextRows.splice(index, 1);
  return { rows: nextRows, rowHeights: shiftRowHeights(rowHeights, section, index, -1), changed: true };
}

function nextColumnKey(columns) {
  const existing = new Set(columns.map((column) => column.key));
  let index = columns.length + 1;
  while (existing.has(`field${index}`)) index += 1;
  return `field${index}`;
}

export function insertTableColumn(columns, sampleData, footerData, columnIndex) {
  const sourceColumns = normalizeTableColumns(columns);
  const nextColumns = [...sourceColumns];
  const index = Math.max(0, Math.min(nextColumns.length, Math.floor(Number(columnIndex) || 0)));
  const key = nextColumnKey(nextColumns);
  nextColumns.splice(index, 0, { key, valuePath: key, title: `列 ${nextColumns.length + 1}`, width: 100, align: "left" });
  const insert = (rows) => normalizeTableRows(rows, sourceColumns).map((row) => {
    const next = {};
    nextColumns.forEach((column, currentIndex) => {
      if (currentIndex === index) {
        next[column.key] = "";
      } else {
        const original = currentIndex > index ? sourceColumns[currentIndex - 1] : sourceColumns[currentIndex];
        next[column.key] = normalizeTableCell(row[original?.key]);
      }
    });
    sourceColumns.forEach((column, sourceIndex) => {
      const cell = row[column.key];
      if (shouldRenderTableCell(cell) && sourceIndex < index && sourceIndex + tableCellColSpan(cell) >= index) {
        next[column.key] = { ...toTableCellDescriptor(next[column.key]), colSpan: tableCellColSpan(cell) + 1 };
        next[key] = { value: "", rowSpan: 0, colSpan: 0 };
      }
    });
    return next;
  });
  return { columns: nextColumns, sampleData: insert(sampleData), footerData: insert(footerData), index };
}

export function removeTableColumn(columns, sampleData, footerData, columnIndex) {
  const normalizedColumns = normalizeTableColumns(columns);
  const index = Math.floor(Number(columnIndex));
  if (normalizedColumns.length <= 1 || !Number.isFinite(index) || index < 0 || index >= normalizedColumns.length) {
    return { columns: normalizedColumns, sampleData: normalizeTableRows(sampleData, normalizedColumns), footerData: normalizeTableRows(footerData, normalizedColumns), changed: false };
  }
  const removed = normalizedColumns[index];
  const nextColumns = normalizedColumns.filter((_, currentIndex) => currentIndex !== index);
  const remove = (rows) => normalizeTableRows(rows, normalizedColumns).map((row) => {
    const source = { ...row };
    normalizedColumns.forEach((column, sourceIndex) => {
      const cell = source[column.key];
      if (!shouldRenderTableCell(cell)) return;
      const span = tableCellColSpan(cell);
      if (sourceIndex === index && span > 1) {
        const promotedColumn = normalizedColumns[index + 1];
        source[promotedColumn.key] = { ...toTableCellDescriptor(cell), colSpan: span - 1 };
      } else if (sourceIndex < index && sourceIndex + span > index) {
        const nextCell = { ...toTableCellDescriptor(cell), colSpan: Math.max(1, span - 1) };
        if (nextCell.colSpan === 1) delete nextCell.colSpan;
        source[column.key] = nextCell;
      }
    });
    delete source[removed.key];
    return normalizeTableRow(source, nextColumns);
  });
  return { columns: nextColumns, sampleData: remove(sampleData), footerData: remove(footerData), changed: true, removed };
}

export function renameTableColumn(columns, sampleData, footerData, columnIndex, nextKey, nextTitle) {
  const normalizedColumns = normalizeTableColumns(columns);
  const index = Math.floor(Number(columnIndex));
  if (!Number.isFinite(index) || index < 0 || index >= normalizedColumns.length) return null;
  const current = normalizedColumns[index];
  const key = String(nextKey || "").trim() || current.key;
  if (normalizedColumns.some((column, currentIndex) => currentIndex !== index && column.key === key)) {
    return { error: "字段 key 不能重复。" };
  }
  const nextColumns = normalizedColumns.map((column, currentIndex) => currentIndex === index
    ? { ...column, key, valuePath: column.valuePath === current.key ? key : column.valuePath, title: nextTitle == null ? column.title : String(nextTitle) }
    : column);
  const rename = (rows) => normalizeTableRows(rows, normalizedColumns).map((row) => {
    const next = Object.fromEntries(Object.entries(row).map(([cellKey, cellValue]) => {
      const cell = normalizeTableCell(cellValue);
      return [cellKey, isTableCellDescriptor(cell) && cell.field === current.key ? { ...cell, field: key } : cell];
    }));
    next[key] = next[current.key] ?? "";
    if (key !== current.key) delete next[current.key];
    return normalizeTableRow(next, nextColumns);
  });
  return { columns: nextColumns, sampleData: rename(sampleData), footerData: rename(footerData) };
}

export function tableRowHeight(props, section, rowIndex) {
  const heights = normalizeTableRowHeights(props?.rowHeights);
  if (section === "body") return Number(heights.body[String(rowIndex)]) || Number(props?.rowHeight) || 0;
  if (section === "footer") return Number(heights.footer[String(rowIndex)]) || Number(props?.footerHeight) || 0;
  return Number(props?.headerHeight) || 0;
}

export { TABLE_CELL_STYLE_KEYS };
