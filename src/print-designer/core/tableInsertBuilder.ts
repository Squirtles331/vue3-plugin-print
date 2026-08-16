export const TABLE_INSERT_MODES = {
    SAMPLE: "sample",
    CUSTOM: "custom",
} as any;
export const DEFAULT_TABLE_INSERT_MODE = TABLE_INSERT_MODES.SAMPLE as any;
export const DEFAULT_TABLE_INSERT_COLUMN_COUNT = 5 as any;
export const DEFAULT_TABLE_INSERT_ROW_COUNT = 26 as any;
export const DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT = 10 as any;
const SAMPLE_TABLE_ROW_HEIGHT = 6 as any;
const CUSTOM_TABLE_ROW_HEIGHT = 13 as any;
const DEFAULT_TABLE_COLUMN_WIDTH = 36 as any;
const LINE_ITEM_COLUMNS = [
    { key: "id", valuePath: "id", title: "ID", width: 60, align: "center" },
    { key: "name", valuePath: "name", title: "名称", width: 120, align: "left" },
    { key: "qty", valuePath: "qty", title: "数量", width: 72, align: "right" },
    { key: "price", valuePath: "price", title: "单价", width: 96, align: "right" },
    { key: "total", valuePath: "total", title: "合计", width: 96, align: "right" },
] as any;
function normalizePositiveInteger(value: any, fallback: any): any {
    const numeric = Number(value) as any;
    if (!Number.isFinite(numeric)) {
        return fallback;
    }
    return Math.max(1, Math.round(numeric));
}
export function createTableInsertColumns(count: any = DEFAULT_TABLE_INSERT_COLUMN_COUNT, { mode = DEFAULT_TABLE_INSERT_MODE }: any = {}): any {
    const columnCount = normalizePositiveInteger(count, DEFAULT_TABLE_INSERT_COLUMN_COUNT) as any;
    const useSampleColumns = mode === TABLE_INSERT_MODES.SAMPLE as any;
    return Array.from({ length: columnCount }, (_: any, index: any): any => {
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
export function createSampleTableRows(columns: any, rowCount: any = DEFAULT_TABLE_INSERT_ROW_COUNT): any {
    const normalizedColumns = Array.isArray(columns) ? columns : [] as any;
    const count = normalizePositiveInteger(rowCount, DEFAULT_TABLE_INSERT_ROW_COUNT) as any;
    return Array.from({ length: count }, (_: any, rowIndex: any): any => {
        const index = rowIndex + 1 as any;
        const qty = ((index - 1) % 5) + 1 as any;
        const price = 100 + (index - 1) * 10 as any;
        const lineItem = {
            id: String(index),
            name: `商品 ${index}`,
            qty: String(qty),
            price: String(price),
            total: String(qty * price),
        } as any;
        return normalizedColumns.reduce((result: any, column: any, columnIndex: any): any => {
            const key = column?.key || `field${columnIndex + 1}` as any;
            result[key] = lineItem[key] ?? (columnIndex === 0 ? String(index) : `示例 ${index}-${columnIndex + 1}`);
            return result;
        }, {});
    });
}
export function createTableSummaryRows(columns: any): any {
    const keys = new Set((Array.isArray(columns) ? columns : []).map((column: any): any => column?.key)) as any;
    if (!keys.has("id")) {
        return [];
    }
    return [
        { id: "本页合计", qty: "{#pageQty}", total: "{#pageSum}" },
        { id: "总计", qty: "{#totalQty}", total: "{#totalSum}" },
        { id: "大写金额", total: "{#totalCap}" },
    ].map((row: any): any => (Array.isArray(columns) ? columns : []).reduce((result: any, column: any): any => {
        const key = column?.key || "" as any;
        result[key] = row[key] || "";
        return result;
    }, {}));
}
function createInsertedTableSize(columnCount: any, rowCount: any, footerRowCount: any, { mode, rowHeight }: any = {}): any {
    const isCustom = mode === TABLE_INSERT_MODES.CUSTOM as any;
    const headerHeight = isCustom ? 0 : 7 as any;
    const footerHeight = isCustom ? 0 : footerRowCount * 7 as any;
    return {
        width: Math.min(220, Math.max(120, columnCount * DEFAULT_TABLE_COLUMN_WIDTH)),
        height: Math.min(220, Math.max(48, headerHeight + rowCount * rowHeight + footerHeight)),
    };
}
export function buildTableInsertOverrides({ mode = DEFAULT_TABLE_INSERT_MODE, columnCount = DEFAULT_TABLE_INSERT_COLUMN_COUNT, rowCount = mode === TABLE_INSERT_MODES.CUSTOM ? DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT : DEFAULT_TABLE_INSERT_ROW_COUNT, }: any = {}): any {
    const normalizedColumnCount = normalizePositiveInteger(columnCount, DEFAULT_TABLE_INSERT_COLUMN_COUNT) as any;
    const fallbackRowCount = mode === TABLE_INSERT_MODES.CUSTOM ? DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT : DEFAULT_TABLE_INSERT_ROW_COUNT as any;
    const normalizedRowCount = normalizePositiveInteger(rowCount, fallbackRowCount) as any;
    const isSample = mode === TABLE_INSERT_MODES.SAMPLE as any;
    const columns = createTableInsertColumns(normalizedColumnCount, { mode }) as any;
    const sampleData = isSample ? createSampleTableRows(columns, normalizedRowCount) : [] as any;
    const footerData = isSample ? createTableSummaryRows(columns) : [] as any;
    const rowHeight = isSample ? SAMPLE_TABLE_ROW_HEIGHT : CUSTOM_TABLE_ROW_HEIGHT as any;
    const size = createInsertedTableSize(normalizedColumnCount, normalizedRowCount, footerData.length, { mode, rowHeight }) as any;
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
