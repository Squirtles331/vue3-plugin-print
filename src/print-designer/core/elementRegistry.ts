import { BARCODE_FORMATS, ElementType, PAGE_NUMBER_FORMATS, QRCODE_ECC_LEVELS } from "./constants";
import { buildTableInsertOverrides } from "./tableInsertBuilder";
import { BARCODE_INSPECTOR_SCHEMA, CIRCLE_INSPECTOR_SCHEMA, IMAGE_INSPECTOR_SCHEMA, LINE_INSPECTOR_SCHEMA, MULTI_LABEL_INSPECTOR_SCHEMA, PAGE_NUMBER_INSPECTOR_SCHEMA, QRCODE_INSPECTOR_SCHEMA, RECT_INSPECTOR_SCHEMA, TABLE_INSPECTOR_SCHEMA, TEXT_INSPECTOR_SCHEMA, } from "./elementInspectorSchemas";
const tableStyle = {
    fontSize: 12,
    color: "#111827",
    backgroundColor: "transparent",
    borderColor: "#111827",
    borderWidth: 1,
    headerBackgroundColor: "#f3f4f6",
    headerColor: "#111827",
    headerFontSize: 12,
    footerBackgroundColor: "#f8fafc",
    footerColor: "#111827",
    footerFontSize: 12,
    textAlign: "left",
    headerTextAlign: "left",
    footerTextAlign: "left",
    fontStyle: "normal",
    lineHeight: 1.35,
    padding: 0.8,
} as any;
export const ELEMENT_DEFINITIONS = {
    [ElementType.TEXT]: {
        label: "文本",
        createDefaults: (): any => ({ width: 40, height: 10, content: "", props: { autoHeight: false, whiteSpace: "pre-wrap", writingMode: "horizontal-tb" } }),
        renderer: "text", inspectorSchema: TEXT_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.IMAGE]: {
        label: "图片",
        createDefaults: (): any => ({ width: 36, height: 24, content: "", props: { src: "", placeholder: "", keepAspectRatio: true }, style: { objectFit: "contain", objectPosition: "50% 50%" } }),
        renderer: "image", inspectorSchema: IMAGE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.TABLE]: {
        label: "表格",
        createDefaults: (): any => ({
            ...buildTableInsertOverrides(),
            props: { ...buildTableInsertOverrides().props, dataVariable: "", footerDataVariable: "", transform: {}, autoPaginate: true, tfootRepeat: true, repeatPerPage: false },
            style: { ...tableStyle },
        }),
        renderer: "table", inspectorSchema: TABLE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.PAGE_NUMBER]: {
        label: "页码",
        createDefaults: (): any => ({ width: 12, height: 8, content: "", props: { format: PAGE_NUMBER_FORMATS[0], totalPages: 1 }, style: { textAlign: "center" } }),
        renderer: "pageNumber", inspectorSchema: PAGE_NUMBER_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.BARCODE]: {
        label: "条码",
        createDefaults: (): any => ({ width: 45, height: 16, content: "", props: { format: BARCODE_FORMATS[0], displayValue: true, margin: 0, textMargin: 2, textFontSize: 10 } }),
        renderer: "barcode", inspectorSchema: BARCODE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.QRCODE]: {
        label: "二维码",
        createDefaults: (): any => ({ width: 22, height: 22, content: "", props: { eccLevel: QRCODE_ECC_LEVELS[1], margin: 0 } }),
        renderer: "qrcode", inspectorSchema: QRCODE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.LINE]: {
        label: "线条",
        createDefaults: (): any => ({ width: 40, height: 1, style: { borderWidth: 1, borderColor: "#172033" }, props: {} }),
        renderer: "line", inspectorSchema: LINE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.RECT]: {
        label: "矩形",
        createDefaults: (): any => ({ width: 24, height: 18, style: { borderWidth: 1, borderColor: "#172033", backgroundColor: "transparent" }, props: {} }),
        renderer: "rect", inspectorSchema: RECT_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.CIRCLE]: {
        label: "圆形",
        createDefaults: (): any => ({ width: 20, height: 20, style: { borderWidth: 1, borderColor: "#172033", backgroundColor: "transparent", borderRadius: 999 }, props: {} }),
        renderer: "circle", inspectorSchema: CIRCLE_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
    [ElementType.MULTI_LABEL]: {
        label: "多标签",
        createDefaults: (): any => ({ width: 90, height: 50, props: { rows: 5, cols: 3, gapX: 12, gapY: 12, direction: "row", dataVariable: "", sampleData: [], primaryPath: "title", secondaryPath: "code", tertiaryPath: "", cellPadding: 2 }, style: { borderWidth: 1, borderColor: "#94a3b8", color: "#334155", backgroundColor: "#ffffff", fontSize: 12, padding: 1 } }),
        renderer: "multiLabel", inspectorSchema: MULTI_LABEL_INSPECTOR_SCHEMA, interactionPolicy: "box",
    },
} as any;
export const ELEMENT_PALETTE = Object.entries(ELEMENT_DEFINITIONS).map(([type, definition]: any): any => ({ type, label: definition.label })) as any;
export function getElementDefinition(type: any): any { return ELEMENT_DEFINITIONS[type] || null; }
export function isElementType(type: any): any { return Boolean(getElementDefinition(type)); }
