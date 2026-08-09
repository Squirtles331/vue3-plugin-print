import { createElement } from "../core/elementFactory.js";
import { createBlankTemplateDocument } from "./templateDocument.js";

function pageId() {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function textElement(page, overrides) {
  return createElement("text", { pageId: page, ...overrides });
}

function tableElement(page, overrides) {
  return createElement("table", { pageId: page, ...overrides });
}

function barcodeElement(page, overrides) {
  return createElement("barcode", { pageId: page, ...overrides });
}

function multiLabelElement(page, overrides) {
  return createElement("multiLabel", { pageId: page, ...overrides });
}

function createCatalogDocument({ name, paper, elements = [] }) {
  const id = pageId();
  return createBlankTemplateDocument({
    meta: { name, unit: "mm" },
    pageSettings: { paper, margin: { top: 10, right: 10, bottom: 10, left: 10 }, background: "#ffffff" },
    pages: [{ id, title: "Page 1", elements: elements(id) }],
  });
}

const STARTER_DEFINITIONS = [
  {
    id: "order-summary",
    category: "sales",
    categoryLabel: "销售单据",
    name: "订单摘要",
    description: "面向销售确认与收款核对的简洁单页布局。",
    thumbnail: { blocks: [{ x: 10, y: 10, w: 45, h: 8, tone: "strong" }, { x: 10, y: 24, w: 80, h: 4 }, { x: 10, y: 36, w: 80, h: 38, tone: "soft" }, { x: 58, y: 10, w: 32, h: 8, tone: "accent" }] },
    create: () => createCatalogDocument({
      name: "订单摘要",
      paper: { preset: "A4", widthMm: 210, heightMm: 297 },
      elements: (page) => [
        textElement(page, { name: "文档标题", x: 14, y: 14, width: 86, height: 10, content: "ORDER SUMMARY", style: { fontSize: 20, fontWeight: "bold", color: "#172554" } }),
        textElement(page, { name: "客户标签", x: 14, y: 34, width: 24, height: 7, content: "Customer", style: { fontSize: 11, fontWeight: "bold", color: "#475569" } }),
        textElement(page, { name: "客户名称", x: 40, y: 34, width: 72, height: 7, variable: "customer.name", style: { fontSize: 12 } }),
        textElement(page, { name: "订单标签", x: 120, y: 34, width: 24, height: 7, content: "Order", style: { fontSize: 11, fontWeight: "bold", color: "#475569" } }),
        textElement(page, { name: "订单编号", x: 146, y: 34, width: 46, height: 7, variable: "order.number", style: { fontSize: 12, textAlign: "right" } }),
        tableElement(page, { name: "订单明细", x: 14, y: 54, width: 182, height: 120, props: { columns: [{ key: "name", title: "Item", width: 90 }, { key: "quantity", title: "Qty", width: 30, align: "right" }, { key: "amount", title: "Amount", width: 50, align: "right" }], dataVariable: "order.items", showHeader: true, autoPaginate: true, rowHeight: 9, headerHeight: 10, footerHeight: 10, sampleData: [], footerData: [] }, style: { fontSize: 11, borderColor: "#94a3b8", headerBackgroundColor: "#e0e7ff" } }),
        textElement(page, { name: "总计标签", x: 132, y: 184, width: 24, height: 7, content: "Total", style: { fontSize: 11, fontWeight: "bold", color: "#475569" } }),
        textElement(page, { name: "总计金额", x: 158, y: 184, width: 38, height: 7, variable: "order.total", style: { fontSize: 14, fontWeight: "bold", textAlign: "right", color: "#172554" } }),
      ],
    }),
  },
  {
    id: "dispatch-note",
    category: "warehouse",
    categoryLabel: "仓储单据",
    name: "出库交接单",
    description: "适用于货物出库、交接与追踪编号确认。",
    thumbnail: { blocks: [{ x: 10, y: 10, w: 34, h: 8, tone: "strong" }, { x: 55, y: 10, w: 35, h: 8, tone: "accent" }, { x: 10, y: 28, w: 80, h: 28, tone: "soft" }, { x: 10, y: 64, w: 80, h: 10 }] },
    create: () => createCatalogDocument({
      name: "出库交接单",
      paper: { preset: "A5", widthMm: 148, heightMm: 210 },
      elements: (page) => [
        textElement(page, { name: "文档标题", x: 12, y: 14, width: 80, height: 10, content: "DISPATCH NOTE", style: { fontSize: 18, fontWeight: "bold", color: "#0f766e" } }),
        textElement(page, { name: "发货日期标签", x: 12, y: 34, width: 30, height: 7, content: "Dispatch date", style: { fontSize: 10, color: "#475569" } }),
        textElement(page, { name: "发货日期", x: 46, y: 34, width: 40, height: 7, variable: "dispatch.date", style: { fontSize: 11 } }),
        textElement(page, { name: "接收人标签", x: 12, y: 46, width: 30, height: 7, content: "Recipient", style: { fontSize: 10, color: "#475569" } }),
        textElement(page, { name: "接收人", x: 46, y: 46, width: 72, height: 7, variable: "recipient.name", style: { fontSize: 11 } }),
        tableElement(page, { name: "出库明细", x: 12, y: 64, width: 124, height: 78, props: { columns: [{ key: "sku", title: "SKU", width: 48 }, { key: "name", title: "Description", width: 50 }, { key: "qty", title: "Qty", width: 20, align: "right" }], dataVariable: "dispatch.items", showHeader: true, autoPaginate: true, rowHeight: 8, headerHeight: 9, footerHeight: 9, sampleData: [], footerData: [] }, style: { fontSize: 10, borderColor: "#99f6e4", headerBackgroundColor: "#ccfbf1" } }),
        barcodeElement(page, { name: "追踪条码", x: 12, y: 154, width: 72, height: 18, variable: "dispatch.trackingNumber", props: { format: "CODE128", displayValue: true }, style: { color: "#134e4a" } }),
      ],
    }),
  },
  {
    id: "product-label-sheet",
    category: "labels",
    categoryLabel: "商品标签",
    name: "货架标签页",
    description: "批量数据驱动的网格标签，用于货架和商品分拣。",
    thumbnail: { blocks: [{ x: 10, y: 10, w: 80, h: 8, tone: "strong" }, { x: 10, y: 26, w: 24, h: 20, tone: "soft" }, { x: 39, y: 26, w: 24, h: 20, tone: "soft" }, { x: 68, y: 26, w: 22, h: 20, tone: "soft" }, { x: 10, y: 52, w: 24, h: 20, tone: "soft" }, { x: 39, y: 52, w: 24, h: 20, tone: "soft" }, { x: 68, y: 52, w: 22, h: 20, tone: "soft" }] },
    create: () => createCatalogDocument({
      name: "货架标签页",
      paper: { preset: "A4", widthMm: 210, heightMm: 297 },
      elements: (page) => [
        textElement(page, { name: "标签页标题", x: 14, y: 12, width: 180, height: 8, content: "SHELF LABELS", style: { fontSize: 15, fontWeight: "bold", color: "#7c2d12", textAlign: "center" } }),
        multiLabelElement(page, { name: "标签网格", x: 14, y: 30, width: 182, height: 242, props: { rows: 4, cols: 3, gapX: 5, gapY: 5, direction: "row", dataVariable: "products", sampleData: [] }, style: { fontSize: 12, borderWidth: 1, borderColor: "#fdba74", color: "#7c2d12", backgroundColor: "#fff7ed", padding: 2 } }),
      ],
    }),
  },
  {
    id: "blank-custom-page",
    category: "blank",
    categoryLabel: "空白页面",
    name: "自定义空白页",
    description: "从无内容页面开始，按自己的纸张和元素组合设计。",
    thumbnail: { blocks: [{ x: 10, y: 10, w: 80, h: 80, tone: "outline" }] },
    create: () => createCatalogDocument({ name: "自定义空白页", paper: { preset: "A4", widthMm: 210, heightMm: 297 } }),
  },
];

export const STARTER_TEMPLATE_CATALOG = Object.freeze(STARTER_DEFINITIONS.map(({ create, ...definition }) => Object.freeze(definition)));

export function listStarterTemplates(category = "") {
  return STARTER_TEMPLATE_CATALOG.filter((template) => !category || template.category === category).map((template) => ({ ...template, thumbnail: { ...template.thumbnail, blocks: template.thumbnail.blocks.map((block) => ({ ...block })) } }));
}

export function instantiateStarterTemplate(id) {
  const definition = STARTER_DEFINITIONS.find((template) => template.id === id);
  if (!definition) {
    throw new Error("Starter template was not found.");
  }
  return definition.create();
}
