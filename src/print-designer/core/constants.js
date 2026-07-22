/**
 * 打印设计器核心常量与数据模型定义
 * 参考还原文档第二节：数据模型需严格对齐
 */

// 元素类型枚举
export const ElementType = {
  TEXT: "text",
  IMAGE: "image",
  TABLE: "table",
  PAGE_NUMBER: "pageNumber",
  BARCODE: "barcode",
  QRCODE: "qrcode",
  LINE: "line",
  RECT: "rect",
  CIRCLE: "circle",
  MULTI_LABEL: "multiLabel",
};

// 单位系统：内部统一用 px 存储，显示层换算
export const Unit = {
  PX: "px",
  MM: "mm",
  PT: "pt",
  IN: "in",
  CM: "cm",
};

// 96 DPI 下每单位对应的像素数
export const DPI = 96;
export const PX_PER_UNIT = {
  px: 1,
  mm: DPI / 25.4, // ≈ 3.7795
  cm: DPI / 2.54, // ≈ 37.795
  in: DPI, // 96
  pt: DPI / 72, // ≈ 1.3333
};

// 单位换算：px -> 目标单位
export function pxToUnit(px, unit) {
  return px / (PX_PER_UNIT[unit] || 1);
}

// 单位换算：目标单位 -> px
export function unitToPx(value, unit) {
  return value * (PX_PER_UNIT[unit] || 1);
}

// 画布默认尺寸 A4 @ 96DPI ≈ 794 × 1123 px
export const DEFAULT_CANVAS_SIZE = { width: 794, height: 1123 };

// 常用纸张预设（px @96DPI，纵向）
export const PAPER_PRESETS = {
  A4: { label: "A4", width: 794, height: 1123 },
  A5: { label: "A5", width: 559, height: 794 },
  B5: { label: "B5", width: 665, height: 944 },
  Letter: { label: "Letter", width: 816, height: 1056 },
};

// 缩放范围
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 4;
export const ZOOM_STEP = 0.1;

// 条码支持格式
export const BARCODE_FORMATS = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14", "MSI"];

// 二维码纠错档位
export const QRCODE_ECC_LEVELS = ["L", "M", "Q", "H"];

// 页码格式模板
export const PAGE_NUMBER_FORMATS = ["1", "Page 1", "1/N", "第1页", "第1页/共N页"];

// 历史记录动作类型（用于历史面板显示）
export const HistoryAction = {
  ADD: "add",
  DELETE: "delete",
  MOVE: "move",
  RESIZE: "resize",
  STYLE: "style",
  PASTE: "paste",
  LAYER: "layer",
  PAGE: "page",
  TABLE: "table",
  OTHER: "other",
};
