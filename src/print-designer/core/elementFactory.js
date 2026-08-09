import { createId, deepMerge } from "./clone";
import { ELEMENT_PALETTE, getElementDefinition, isElementType } from "./elementRegistry";

const ELEMENT_SIZE_RULES = {
  text: { minWidth: 16, minHeight: 6, maxWidth: 120, maxHeight: 40 },
  pageNumber: { minWidth: 10, minHeight: 6, maxWidth: 30, maxHeight: 16 },
  image: { minWidth: 18, minHeight: 18, maxWidth: 100, maxHeight: 80 },
  barcode: { minWidth: 24, minHeight: 10, maxWidth: 90, maxHeight: 40 },
  qrcode: { minWidth: 16, minHeight: 16, maxWidth: 40, maxHeight: 40 },
  line: { minWidth: 10, minHeight: 1, maxWidth: 160, maxHeight: 4 },
  rect: { minWidth: 10, minHeight: 10, maxWidth: 120, maxHeight: 80 },
  circle: { minWidth: 10, minHeight: 10, maxWidth: 50, maxHeight: 50 },
  table: { minWidth: 36, minHeight: 18, maxWidth: 240, maxHeight: 220 },
  multiLabel: { minWidth: 50, minHeight: 30, maxWidth: 180, maxHeight: 140 },
};

function defaultElementName(type) {
  return ELEMENT_PALETTE.find((item) => item.type === type)?.label || type || "element";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSizeValue(value, fallback, min, max) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return +clamp(numeric, min, max).toFixed(2);
}

function normalizeElementSize(element) {
  const rule = ELEMENT_SIZE_RULES[element.type];

  if (!rule) {
    return element;
  }

  const normalized = {
    ...element,
    width: normalizeSizeValue(element.width, rule.minWidth, rule.minWidth, rule.maxWidth),
    height: normalizeSizeValue(element.height, rule.minHeight, rule.minHeight, rule.maxHeight),
  };

  if (element.type === "circle") {
    const size = Math.min(normalized.width, normalized.height);
    return { ...normalized, width: size, height: size };
  }

  return normalized;
}

function baseElement(type = "") {
  return {
    id: "",
    type,
    name: defaultElementName(type),
    pageId: "page-1",
    x: 40,
    y: 40,
    width: 200,
    height: 100,
    content: "",
    variable: "",
    visible: true,
    locked: false,
    printable: true,
    rotation: 0,
    zIndex: 0,
    repeatPerPage: false,
    style: {
      fontFamily: "",
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      color: "#000000",
      backgroundColor: "transparent",
      textAlign: "left",
      verticalAlign: "top",
      lineHeight: 1.4,
      letterSpacing: 0,
      borderWidth: 0,
      borderStyle: "solid",
      borderColor: "#000000",
      borderRadius: 0,
      padding: 0,
      opacity: 1,
    },
    props: {},
  };
}

export function createElement(type, overrides = {}) {
  const definition = getElementDefinition(type);

  if (!definition) {
    throw new Error(`Unknown element type: ${type}`);
  }

  const merged = deepMerge(deepMerge(baseElement(type), definition.createDefaults()), overrides);
  const normalized = normalizeElementSize({
    ...merged,
    id: overrides.id || createId(type),
    type,
    name: overrides.name || merged.name || defaultElementName(type),
    props: merged.props || {},
  });

  return normalized;
}

export function getElementSizeRule(type) {
  return ELEMENT_SIZE_RULES[type] || null;
}

export { ELEMENT_PALETTE, isElementType, getElementDefinition };
