export const TABLE_INSERT_MODES = {
  SAMPLE: "sample",
  CUSTOM: "custom",
};

export const DEFAULT_TABLE_INSERT_MODE = TABLE_INSERT_MODES.CUSTOM;
export const DEFAULT_TABLE_INSERT_COLUMN_COUNT = 5;
export const DEFAULT_TABLE_INSERT_ROW_COUNT = 10;

function normalizePositiveInteger(value, fallback) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(1, Math.round(numeric));
}

export function createTableInsertColumns(count = DEFAULT_TABLE_INSERT_COLUMN_COUNT) {
  const columnCount = normalizePositiveInteger(count, DEFAULT_TABLE_INSERT_COLUMN_COUNT);

  return Array.from({ length: columnCount }, (_, index) => ({
    key: `field${index + 1}`,
    valuePath: `field${index + 1}`,
    title: `列 ${index + 1}`,
    width: 100,
    align: "left",
  }));
}

export function createSampleTableRows(columns, rowCount = DEFAULT_TABLE_INSERT_ROW_COUNT) {
  const normalizedColumns = Array.isArray(columns) ? columns : [];
  const count = normalizePositiveInteger(rowCount, DEFAULT_TABLE_INSERT_ROW_COUNT);

  return Array.from({ length: count }, (_, rowIndex) =>
    normalizedColumns.reduce((result, column, columnIndex) => {
      result[column.key] = columnIndex === 0 ? String(rowIndex + 1) : `示例 ${rowIndex + 1}-${columnIndex + 1}`;
      return result;
    }, {})
  );
}

function createInsertedTableSize(columnCount, rowCount) {
  return {
    width: Math.min(220, Math.max(120, columnCount * 36)),
    height: Math.min(220, Math.max(48, 16 + rowCount * 8)),
  };
}

export function buildTableInsertOverrides({
  mode = DEFAULT_TABLE_INSERT_MODE,
  columnCount = DEFAULT_TABLE_INSERT_COLUMN_COUNT,
  rowCount = DEFAULT_TABLE_INSERT_ROW_COUNT,
} = {}) {
  const normalizedColumnCount = normalizePositiveInteger(columnCount, DEFAULT_TABLE_INSERT_COLUMN_COUNT);
  const normalizedRowCount = normalizePositiveInteger(rowCount, DEFAULT_TABLE_INSERT_ROW_COUNT);
  const columns = createTableInsertColumns(normalizedColumnCount);
  const sampleData =
    mode === TABLE_INSERT_MODES.SAMPLE ? createSampleTableRows(columns, normalizedRowCount) : [];
  const size = createInsertedTableSize(normalizedColumnCount, normalizedRowCount);

  return {
    ...size,
    props: {
      columns,
      sampleData,
      footerData: [],
      showHeader: true,
      showFooter: false,
    },
    editorHints: {
      omitRows: false,
      rowCount: normalizedRowCount,
    },
  };
}
