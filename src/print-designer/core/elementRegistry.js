import { BARCODE_FORMATS, ElementType, PAGE_NUMBER_FORMATS, QRCODE_ECC_LEVELS } from "./constants";
import {
  BARCODE_INSPECTOR_SCHEMA,
  CIRCLE_INSPECTOR_SCHEMA,
  IMAGE_INSPECTOR_SCHEMA,
  LINE_INSPECTOR_SCHEMA,
  MULTI_LABEL_INSPECTOR_SCHEMA,
  PAGE_NUMBER_INSPECTOR_SCHEMA,
  QRCODE_INSPECTOR_SCHEMA,
  RECT_INSPECTOR_SCHEMA,
  TABLE_INSPECTOR_SCHEMA,
  TEXT_INSPECTOR_SCHEMA,
} from "./elementInspectorSchemas";

function defaultTableColumns() {
  return Array.from({ length: 5 }, (_, index) => ({
    key: `field${index + 1}`,
    title: `列 ${index + 1}`,
    width: 100,
    align: index === 0 ? "center" : "left",
  }));
}

const tableStyle = {
  fontSize: 14,
  color: "#172033",
  backgroundColor: "transparent",
  borderColor: "#64748b",
  borderWidth: 1,
  headerBackgroundColor: "#eef2ff",
  headerColor: "#172033",
  headerFontSize: 14,
  footerBackgroundColor: "#f8fafc",
  footerColor: "#172033",
  footerFontSize: 14,
  textAlign: "left",
  headerTextAlign: "left",
  footerTextAlign: "left",
  fontStyle: "normal",
  lineHeight: 1.45,
  padding: 1.2,
};

export const ELEMENT_DEFINITIONS = {
  [ElementType.TEXT]: {
    label: "文本",
    createDefaults: () => ({ width: 40, height: 10, content: "", props: { autoHeight: false, whiteSpace: "pre-wrap", writingMode: "horizontal-tb" } }),
    renderer: "text", inspectorSchema: TEXT_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.IMAGE]: {
    label: "图片",
    createDefaults: () => ({ width: 36, height: 24, content: "", props: { src: "", placeholder: "", keepAspectRatio: true }, style: { objectFit: "contain" } }),
    renderer: "image", inspectorSchema: IMAGE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.TABLE]: {
    label: "表格",
    createDefaults: () => ({
      width: 180, height: 100,
      props: { columns: defaultTableColumns(), sampleData: [], footerData: [], columnsVariable: "", dataVariable: "", footerDataVariable: "", customScriptVariable: "", autoPaginate: true, tfootRepeat: true, showHeader: true, showFooter: false, designOmitRows: true, designRowCount: 10, headerHeight: 10, rowHeight: 8, footerHeight: 10, embeddedCellTextPosition: "overlap", embeddedCellTextLayer: "below", repeatPerPage: false, customScript: "" },
      style: { ...tableStyle },
    }),
    renderer: "table", inspectorSchema: TABLE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.PAGE_NUMBER]: {
    label: "页码",
    createDefaults: () => ({ width: 12, height: 8, content: "", props: { format: PAGE_NUMBER_FORMATS[0], totalPages: 1 }, style: { textAlign: "center" } }),
    renderer: "pageNumber", inspectorSchema: PAGE_NUMBER_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.BARCODE]: {
    label: "条码",
    createDefaults: () => ({ width: 45, height: 16, content: "", props: { format: BARCODE_FORMATS[0], displayValue: true } }),
    renderer: "barcode", inspectorSchema: BARCODE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.QRCODE]: {
    label: "二维码",
    createDefaults: () => ({ width: 22, height: 22, content: "", props: { eccLevel: QRCODE_ECC_LEVELS[1] } }),
    renderer: "qrcode", inspectorSchema: QRCODE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.LINE]: {
    label: "线条",
    createDefaults: () => ({ width: 40, height: 1, style: { borderWidth: 1, borderColor: "#172033" }, props: {} }),
    renderer: "line", inspectorSchema: LINE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.RECT]: {
    label: "矩形",
    createDefaults: () => ({ width: 24, height: 18, style: { borderWidth: 1, borderColor: "#172033", backgroundColor: "transparent" }, props: {} }),
    renderer: "rect", inspectorSchema: RECT_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.CIRCLE]: {
    label: "圆形",
    createDefaults: () => ({ width: 20, height: 20, style: { borderWidth: 1, borderColor: "#172033", backgroundColor: "transparent", borderRadius: 999 }, props: {} }),
    renderer: "circle", inspectorSchema: CIRCLE_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
  [ElementType.MULTI_LABEL]: {
    label: "多标签",
    createDefaults: () => ({ width: 90, height: 50, props: { rows: 5, cols: 3, gapX: 12, gapY: 12, direction: "row", dataVariable: "", sampleData: [] }, style: { borderWidth: 1, borderColor: "#94a3b8", color: "#334155", backgroundColor: "#ffffff", fontSize: 12, padding: 1 } }),
    renderer: "multiLabel", inspectorSchema: MULTI_LABEL_INSPECTOR_SCHEMA, interactionPolicy: "box",
  },
};

export const ELEMENT_PALETTE = Object.entries(ELEMENT_DEFINITIONS).map(([type, definition]) => ({ type, label: definition.label }));
export function getElementDefinition(type) { return ELEMENT_DEFINITIONS[type] || null; }
export function isElementType(type) { return Boolean(getElementDefinition(type)); }
