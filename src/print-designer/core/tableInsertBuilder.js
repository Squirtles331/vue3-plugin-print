export const TABLE_INSERT_MODES = {
  SAMPLE: "sample",
  CUSTOM: "custom",
};

export const DEFAULT_TABLE_INSERT_MODE = TABLE_INSERT_MODES.SAMPLE;
export const DEFAULT_TABLE_INSERT_COLUMN_COUNT = 5;
export const DEFAULT_TABLE_INSERT_ROW_COUNT = 26;
export const DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT = 10;

const SAMPLE_TABLE_ROW_HEIGHT = 6;
const CUSTOM_TABLE_ROW_HEIGHT = 13;
const DEFAULT_TABLE_COLUMN_WIDTH = 36;

const LINE_ITEM_COLUMNS = [
  { key: "id", valuePath: "id", title: "ID", width: 60, align: "center" },
  { key: "name", valuePath: "name", title: "名称", width: 120, align: "left" },
  { key: "qty", valuePath: "qty", title: "数量", width: 72, align: "right" },
  { key: "price", valuePath: "price", title: "单价", width: 96, align: "right" },
  { key: "total", valuePath: "total", title: "合计", width: 96, align: "right" },
];

function normalizePositiveInteger(value, fallback) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(1, Math.round(numeric));
}

export function createTableInsertColumns(count = DEFAULT_TABLE_INSERT_COLUMN_COUNT, { mode = DEFAULT_TABLE_INSERT_MODE } = {}) {
  const columnCount = normalizePositiveInteger(count, DEFAULT_TABLE_INSERT_COLUMN_COUNT);
  const useSampleColumns = mode === TABLE_INSERT_MODES.SAMPLE;

  return Array.from({ length: columnCount }, (_, index) => {
    if (useSampleColumns && LINE_ITEM_COLUMNS[index]) {
      return { ...LINE_ITEM_COLUMNS[index] };
    }

    return {
      key: `field${index + 1}`,
      valuePath: `field${index + 1}`,
      title: "",
      width: 100,
      align: "left",
    };
  });
}

export function createSampleTableRows(columns, rowCount = DEFAULT_TABLE_INSERT_ROW_COUNT) {
  const normalizedColumns = Array.isArray(columns) ? columns : [];
  const count = normalizePositiveInteger(rowCount, DEFAULT_TABLE_INSERT_ROW_COUNT);

  return Array.from({ length: count }, (_, rowIndex) => {
    const index = rowIndex + 1;
    const qty = ((index - 1) % 5) + 1;
    const price = 100 + (index - 1) * 10;
    const lineItem = {
      id: String(index),
      name: `商品 ${index}`,
      qty: String(qty),
      price: String(price),
      total: String(qty * price),
    };

    return normalizedColumns.reduce((result, column, columnIndex) => {
      const key = column?.key || `field${columnIndex + 1}`;
      result[key] = lineItem[key] ?? (columnIndex === 0 ? String(index) : `示例 ${index}-${columnIndex + 1}`);
      return result;
    }, {});
  });
}

export function createTableSummaryRows(columns) {
  const keys = new Set((Array.isArray(columns) ? columns : []).map((column) => column?.key));

  if (!keys.has("id")) {
    return [];
  }

  return [
    { id: "本页合计", qty: "{#pageQty}", total: "{#pageSum}" },
    { id: "总计", qty: "{#totalQty}", total: "{#totalSum}" },
    { id: "大写金额", total: "{#totalCap}" },
  ].map((row) =>
    (Array.isArray(columns) ? columns : []).reduce((result, column) => {
      const key = column?.key || "";
      result[key] = row[key] || "";
      return result;
    }, {})
  );
}

function createInsertedTableSize(columnCount, rowCount, footerRowCount, { mode, rowHeight } = {}) {
  const isCustom = mode === TABLE_INSERT_MODES.CUSTOM;
  const headerHeight = isCustom ? 0 : 7;
  const footerHeight = isCustom ? 0 : footerRowCount * 7;
  return {
    width: Math.min(220, Math.max(120, columnCount * DEFAULT_TABLE_COLUMN_WIDTH)),
    height: Math.min(220, Math.max(48, headerHeight + rowCount * rowHeight + footerHeight)),
  };
}

export function buildTableInsertOverrides({
  mode = DEFAULT_TABLE_INSERT_MODE,
  columnCount = DEFAULT_TABLE_INSERT_COLUMN_COUNT,
  rowCount = mode === TABLE_INSERT_MODES.CUSTOM ? DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT : DEFAULT_TABLE_INSERT_ROW_COUNT,
} = {}) {
  const normalizedColumnCount = normalizePositiveInteger(columnCount, DEFAULT_TABLE_INSERT_COLUMN_COUNT);
  const fallbackRowCount = mode === TABLE_INSERT_MODES.CUSTOM ? DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT : DEFAULT_TABLE_INSERT_ROW_COUNT;
  const normalizedRowCount = normalizePositiveInteger(rowCount, fallbackRowCount);
  const isSample = mode === TABLE_INSERT_MODES.SAMPLE;
  const columns = createTableInsertColumns(normalizedColumnCount, { mode });
  const sampleData = isSample ? createSampleTableRows(columns, normalizedRowCount) : [];
  const footerData = isSample ? createTableSummaryRows(columns) : [];
  const rowHeight = isSample ? SAMPLE_TABLE_ROW_HEIGHT : CUSTOM_TABLE_ROW_HEIGHT;
  const size = createInsertedTableSize(normalizedColumnCount, normalizedRowCount, footerData.length, { mode, rowHeight });

  return {
    ...size,
    props: {
      columns,
      sampleData,
      footerData,
      blankHeaders: !isSample,
      showHeader: isSample,
      showFooter: footerData.length > 0,
      headerHeight: 7,
      rowHeight,
      footerHeight: 7,
      rowHeights: { body: {}, footer: {} },
    },
    editorHints: {
      omitRows: false,
      rowCount: normalizedRowCount,
    },
  };
}
