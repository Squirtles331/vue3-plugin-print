import { toRaw } from "vue";
import { createElement, getElementSizeRule, isElementType } from "../core/elementFactory.js";
import { validateElementProperties } from "../core/propertyCapabilities.js";
import { normalizeTableRowHeights, normalizeTableRows } from "../core/tableModel.js";

export const TEMPLATE_SCHEMA_VERSION = 2;

export const TEMPLATE_LIMITS = Object.freeze({
  maxPages: 100,
  maxElementsPerPage: 500,
  maxElements: 2_000,
  maxSerializedCharacters: 5 * 1024 * 1024,
  maxStringCharacters: 2 * 1024 * 1024,
});

const DEFAULT_PAPER = {
  preset: "A4",
  widthMm: 210,
  heightMm: 297,
  orientation: "portrait",
};

const DEFAULT_MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };

function clone(value) {
  const rawValue = toRaw(value);

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(rawValue);
    } catch {
      // JSON template data should still serialize even if a reactive proxy leaks in.
    }
  }

  return JSON.parse(JSON.stringify(rawValue));
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boundedNumber(value, fallback, min, max, precision = 2) {
  const parsed = numeric(value, fallback);
  return +Math.min(max, Math.max(min, parsed)).toFixed(precision);
}

function boolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function newId(prefix = "tpl") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePageGroups(sourceGroups, elements) {
  if (!Array.isArray(sourceGroups)) {
    return [];
  }

  const knownElementIds = new Set(elements.map((element) => element.id));
  const claimedElementIds = new Set();
  const groupIds = new Set();

  return sourceGroups.reduce((groups, value, index) => {
    const source = object(value);
    const id = text(source.id, `group-${index + 1}`);
    if (groupIds.has(id)) {
      return groups;
    }

    const elementIds = [...new Set(Array.isArray(source.elementIds) ? source.elementIds.map((item) => String(item || "").trim()) : [])]
      .filter((elementId) => elementId && knownElementIds.has(elementId) && !claimedElementIds.has(elementId));
    if (elementIds.length < 2) {
      return groups;
    }

    groupIds.add(id);
    elementIds.forEach((elementId) => claimedElementIds.add(elementId));
    groups.push({
      id,
      name: text(source.name, `Group ${groups.length + 1}`),
      elementIds,
    });
    return groups;
  }, []);
}

function stripEditorState(page, index) {
  const source = object(page);
  const { elements = [], groups = [], isCurrent, size, orientation, thumbnail, selected, hovered, editing, interactionState, ...pageData } = source;
  const id = text(pageData.id, `page-${index + 1}`);
  const normalizedElements = Array.isArray(elements) ? elements.map((element, elementIndex) => normalizeElement(element, elementIndex, id)) : [];

  return {
    ...clone(pageData),
    id,
    title: text(pageData.title, `Page ${index + 1}`),
    elements: normalizedElements,
    groups: normalizePageGroups(groups, normalizedElements),
  };
}

function normalizeTableProps(sourceProps) {
  const source = object(sourceProps);
  const { headers, rows, footerRows, dataKey, footerKey, columnKey, columnsVariable, transformConfig, customScript, customScriptVariable, designOmitRows, designRowCount, embeddedCellTextPosition, embeddedCellTextLayer, ...props } = source;

  const normalizeColumn = (column) => {
    const value = object(column);
    const formatter = object(value.formatter || value.format);
    return {
      ...value,
      key: optionalText(value.key || value.field),
      valuePath: optionalText(value.valuePath || value.key || value.field),
      title: optionalText(value.title || value.header || value.key || value.field),
      width: boundedNumber(value.width, 20, 1, 240, 2),
      align: ["left", "center", "right"].includes(value.align) ? value.align : "left",
      ...(Object.keys(formatter).length ? { formatter } : {}),
    };
  };

  const columns = Array.isArray(props.columns) ? props.columns : Array.isArray(headers) ? headers : null;
  const sampleData = Array.isArray(props.sampleData) ? props.sampleData : Array.isArray(rows) ? rows : Array.isArray(props.data) ? props.data : null;
  const footerData = Array.isArray(props.footerData) ? props.footerData : Array.isArray(footerRows) ? footerRows : null;
  const normalizedColumns = columns ? columns.map(normalizeColumn) : [];

  return {
    ...props,
    ...(columns ? { columns: normalizedColumns } : {}),
    ...(sampleData ? { sampleData: normalizedColumns.length ? normalizeTableRows(sampleData, normalizedColumns) : sampleData } : {}),
    ...(footerData ? { footerData: normalizedColumns.length ? normalizeTableRows(footerData, normalizedColumns) : footerData } : {}),
    ...(props.rowHeights != null ? { rowHeights: normalizeTableRowHeights(props.rowHeights) } : {}),
    dataVariable: optionalText(props.dataVariable || dataKey),
    footerDataVariable: optionalText(props.footerDataVariable || footerKey),
    transform: object(props.transform || transformConfig),
  };
}

function normalizeTableEditorHints(source) {
  const hints = object(source.editorHints);
  const props = object(source.props);
  return {
    omitRows: boolean(hints.omitRows ?? props.designOmitRows, true),
    rowCount: boundedNumber(hints.rowCount ?? props.designRowCount, 10, 1, 500, 0),
  };
}

function normalizeElement(element, index, pageId) {
  const source = object(element);
  const {
    selected,
    hovered,
    editing,
    interactionState,
    display,
    isLocked,
    isPrint,
    angle,
    left,
    top,
    dataKey,
    imageUrl,
    codeFormat,
    errorCorrectionLevel,
    pageNumberFormat,
    opacity: legacyOpacity,
    ...elementData
  } = source;
  const type = text(source.type);

  if (!isElementType(type)) {
    return {
      ...clone(elementData),
      id: text(source.id, `${pageId}-element-${index + 1}`),
      pageId,
      type,
      style: clone(object(source.style)),
      props: clone(object(source.props)),
    };
  }

  const sourceProps = object(source.props);
  const normalizedProps = {
    ...(type === "table" ? normalizeTableProps(sourceProps) : sourceProps),
    ...(type === "image" && imageUrl ? { src: imageUrl } : {}),
    ...(type === "barcode" && codeFormat ? { format: codeFormat } : {}),
    ...(type === "qrcode" && errorCorrectionLevel ? { eccLevel: errorCorrectionLevel } : {}),
    ...(type === "pageNumber" && pageNumberFormat ? { format: pageNumberFormat } : {}),
    ...(type === "multiLabel" && sourceProps.columns != null && sourceProps.cols == null ? { cols: sourceProps.columns } : {}),
  };
  const normalizedStyle = {
    ...object(source.style),
    ...(legacyOpacity != null && object(source.style).opacity == null ? { opacity: legacyOpacity } : {}),
  };
  const normalized = createElement(type, {
    ...elementData,
    id: text(source.id, `${pageId}-element-${index + 1}`),
    pageId,
    x: source.x ?? left,
    y: source.y ?? top,
    rotation: source.rotation ?? angle,
    variable: source.variable ?? dataKey,
    visible: source.visible ?? display,
    locked: source.locked ?? isLocked,
    printable: source.printable ?? isPrint,
    style: normalizedStyle,
    props: normalizedProps,
    ...(type === "table" ? { editorHints: normalizeTableEditorHints(source) } : {}),
  });

  return {
    ...normalized,
    id: text(source.id, `${pageId}-element-${index + 1}`),
    pageId,
    name: text(source.name, normalized.name),
    content: source.content == null ? "" : String(source.content),
    variable: optionalText(source.variable ?? dataKey),
    visible: boolean(source.visible ?? display, true),
    locked: boolean(source.locked ?? isLocked, false),
    printable: boolean(source.printable ?? isPrint, true),
    repeatPerPage: boolean(source.repeatPerPage, false),
    rotation: boundedNumber(source.rotation ?? angle, 0, -360, 360, 2),
    zIndex: Math.max(0, Math.round(numeric(source.zIndex, index))),
    style: {
      ...normalized.style,
      opacity: boundedNumber(normalizedStyle.opacity, normalized.style.opacity ?? 1, 0, 1, 3),
    },
    ...(type === "table" ? { editorHints: normalizeTableEditorHints(source) } : {}),
  };
}

function normalizePageSettings(value) {
  const source = object(value);
  const paper = object(source.paper || source.paperSize);
  const margin = object(source.margin);
  const widthMm = boundedNumber(paper.widthMm ?? source.pageWidthMm ?? source.widthMm, DEFAULT_PAPER.widthMm, 20, 1_000, 1);
  const heightMm = boundedNumber(paper.heightMm ?? source.pageHeightMm ?? source.heightMm, DEFAULT_PAPER.heightMm, 20, 1_500, 1);
  const marginX = source.marginXMm ?? source.marginX;
  const marginY = source.marginYMm ?? source.marginY;
  const cornerMarks = object(source.cornerMarks);
  const headerLine = object(source.headerLine);
  const footerLine = object(source.footerLine);
  const printMarks = object(source.printMarks);

  return {
    paper: {
      preset: text(paper.preset ?? source.paperPreset, DEFAULT_PAPER.preset),
      widthMm,
      heightMm,
      orientation: widthMm > heightMm ? "landscape" : "portrait",
    },
    margin: {
      top: boundedNumber(margin.top ?? marginY, DEFAULT_MARGIN.top, 0, 200, 1),
      right: boundedNumber(margin.right ?? marginX, DEFAULT_MARGIN.right, 0, 200, 1),
      bottom: boundedNumber(margin.bottom ?? marginY, DEFAULT_MARGIN.bottom, 0, 200, 1),
      left: boundedNumber(margin.left ?? marginX, DEFAULT_MARGIN.left, 0, 200, 1),
    },
    background: text(source.background ?? source.pageBackground, "#ffffff"),
    cornerMarks: {
      visible: boolean(cornerMarks.visible ?? source.pageCornerVisible, true),
    },
    headerLine: {
      visible: boolean(headerLine.visible ?? source.headerLineVisible, false),
      offsetMm: boundedNumber(headerLine.offsetMm ?? source.headerOffsetMm, 26.5, 0, 200, 1),
    },
    footerLine: {
      visible: boolean(footerLine.visible ?? source.footerLineVisible, false),
      offsetMm: boundedNumber(footerLine.offsetMm ?? source.footerOffsetMm, 26.5, 0, 200, 1),
    },
    printMarks: {
      visible: boolean(printMarks.visible ?? source.printMarksVisible, false),
    },
  };
}

function normalizeSource(source) {
  if (!source || typeof source !== "object") {
    return createBlankTemplateDocument();
  }

  const rawTemplate = source.template && typeof source.template === "object" ? source.template : source;
  const meta = object(rawTemplate.meta);
  const pages = Array.isArray(rawTemplate.pages) ? rawTemplate.pages : [];
  const now = new Date().toISOString();

  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    id: text(rawTemplate.id || meta.id, newId()),
    meta: {
      name: text(meta.name ?? rawTemplate.name, "Untitled print template"),
      unit: "mm",
      createdAt: text(meta.createdAt, now),
      updatedAt: text(meta.updatedAt, now),
    },
    pageSettings: normalizePageSettings(rawTemplate.pageSettings),
    pages: pages.length ? pages.map(stripEditorState) : [createBlankPage()],
  };
}

function findExecutableLegacyFields(source, issues) {
  const rawTemplate = source?.template && typeof source.template === "object" ? source.template : source;
  (rawTemplate?.pages || []).forEach((page, pageIndex) => {
    (page?.elements || []).forEach((element, elementIndex) => {
      const props = object(element?.props);
      if (props.customScript || props.customScriptVariable) {
        issues.push({
          path: `pages[${pageIndex}].elements[${elementIndex}].props`,
          message: "Executable legacy table fields were removed. Use declarative transforms instead.",
          severity: "warning",
        });
      }
      if (props.columnsVariable || props.columnKey) {
        issues.push({
          path: `pages[${pageIndex}].elements[${elementIndex}].props.columnsVariable`,
          message: "Dynamic table column schemas were removed. Static authored columns are used.",
          severity: "warning",
        });
      }
    });
  });
}

function addRawBoundedIssues(rawTemplate, issues) {
  const pages = Array.isArray(rawTemplate?.pages) ? rawTemplate.pages : [];
  const totalElements = pages.reduce((total, page) => total + (Array.isArray(page?.elements) ? page.elements.length : 0), 0);

  if (pages.length > TEMPLATE_LIMITS.maxPages) {
    issues.push({ path: "pages", message: `A template supports at most ${TEMPLATE_LIMITS.maxPages} pages.`, severity: "error" });
  }
  if (totalElements > TEMPLATE_LIMITS.maxElements) {
    issues.push({ path: "pages", message: `A template supports at most ${TEMPLATE_LIMITS.maxElements} elements.`, severity: "error" });
  }

  pages.forEach((page, pageIndex) => {
    const elements = Array.isArray(page?.elements) ? page.elements : [];
    if (elements.length > TEMPLATE_LIMITS.maxElementsPerPage) {
      issues.push({ path: `pages[${pageIndex}].elements`, message: `A page supports at most ${TEMPLATE_LIMITS.maxElementsPerPage} elements.`, severity: "error" });
    }

    elements.forEach((element, elementIndex) => {
      const rule = getElementSizeRule(element?.type);
      if (!rule) {
        return;
      }
      ["x", "y", "width", "height", "rotation", "zIndex"].forEach((key) => {
        const value = element?.[key];
        if (value != null && !Number.isFinite(Number(value))) {
          issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].${key}`, message: `${key} must be numeric.`, severity: "error" });
        }
      });
      if (element?.width != null && (Number(element.width) < rule.minWidth || Number(element.width) > rule.maxWidth)) {
        issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].width`, message: `width must be between ${rule.minWidth} and ${rule.maxWidth}.`, severity: "error" });
      }
      if (element?.height != null && (Number(element.height) < rule.minHeight || Number(element.height) > rule.maxHeight)) {
        issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].height`, message: `height must be between ${rule.minHeight} and ${rule.maxHeight}.`, severity: "error" });
      }
    });
  });
}

function addRawGroupIssues(rawTemplate, issues) {
  if (Number(rawTemplate?.schemaVersion || 0) < 2) {
    return;
  }

  const claimedElementIds = new Set();
  const groupIds = new Set();
  (Array.isArray(rawTemplate?.pages) ? rawTemplate.pages : []).forEach((page, pageIndex) => {
    const elementIds = new Set((Array.isArray(page?.elements) ? page.elements : []).map((element) => String(element?.id || "").trim()).filter(Boolean));
    const groups = Array.isArray(page?.groups) ? page.groups : [];
    groups.forEach((group, groupIndex) => {
      const path = `pages[${pageIndex}].groups[${groupIndex}]`;
      const id = String(group?.id || "").trim();
      if (!id || groupIds.has(id)) {
        issues.push({ path: `${path}.id`, message: "Group id must be unique.", severity: "error" });
      }
      groupIds.add(id);

      const ids = Array.isArray(group?.elementIds) ? group.elementIds.map((item) => String(item || "").trim()) : [];
      if (ids.length < 2 || new Set(ids).size !== ids.length) {
        issues.push({ path: `${path}.elementIds`, message: "A group must contain at least two unique elements.", severity: "error" });
      }
      ids.forEach((elementId) => {
        if (!elementIds.has(elementId)) {
          issues.push({ path: `${path}.elementIds`, message: "Group members must belong to the same page.", severity: "error" });
        }
        if (claimedElementIds.has(elementId)) {
          issues.push({ path: `${path}.elementIds`, message: "An element can belong to only one group.", severity: "error" });
        }
        claimedElementIds.add(elementId);
      });
    });
  });
}

function addStringSizeIssues(value, path, issues, visited = new WeakSet()) {
  if (typeof value === "string" && value.length > TEMPLATE_LIMITS.maxStringCharacters) {
    issues.push({ path, message: `Value exceeds ${TEMPLATE_LIMITS.maxStringCharacters} characters.`, severity: "error" });
    return;
  }
  if (!value || typeof value !== "object" || visited.has(value)) {
    return;
  }
  visited.add(value);
  Object.entries(value).forEach(([key, child]) => addStringSizeIssues(child, `${path}.${key}`, issues, visited));
}

export function createBlankPage() {
  return {
    id: "page-1",
    title: "Page 1",
    elements: [],
    groups: [],
  };
}

export function createBlankTemplateDocument(overrides = {}) {
  const now = new Date().toISOString();
  const document = {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    id: newId(),
    meta: {
      name: "Untitled print template",
      unit: "mm",
      createdAt: now,
      updatedAt: now,
    },
    pageSettings: normalizePageSettings(),
    pages: [createBlankPage()],
  };

  return normalizeSource({ ...document, ...clone(overrides) });
}

export function migrateTemplateDocument(source) {
  const version = Number(source?.schemaVersion || 0);

  if (version > TEMPLATE_SCHEMA_VERSION) {
    return {
      document: null,
      issues: [{ path: "schemaVersion", message: `Template schema version ${version} is newer than this editor supports.`, severity: "error" }],
      fromVersion: version,
    };
  }

  const issues = version === TEMPLATE_SCHEMA_VERSION ? [] : [{ path: "schemaVersion", message: `A legacy template was normalized to schema version ${TEMPLATE_SCHEMA_VERSION}.`, severity: "warning" }];
  const rawTemplate = source?.template && typeof source.template === "object" ? source.template : source;
  if (rawTemplate?.meta?.unit && rawTemplate.meta.unit !== "mm") {
    issues.push({ path: "meta.unit", message: "Template geometry is stored in millimetres; the legacy unit metadata was normalized to mm.", severity: "warning" });
  }
  findExecutableLegacyFields(source, issues);
  return {
    document: normalizeSource(source),
    issues,
    fromVersion: version,
  };
}

export function validateTemplateDocument(source) {
  const issues = [];
  const rawTemplate = source?.template && typeof source.template === "object" ? source.template : source;
  try {
    if (JSON.stringify(rawTemplate || {}).length > TEMPLATE_LIMITS.maxSerializedCharacters) {
      issues.push({ path: "document", message: `Template exceeds ${TEMPLATE_LIMITS.maxSerializedCharacters} serialized characters.`, severity: "error" });
    }
  } catch {
    issues.push({ path: "document", message: "Template must be serializable JSON data.", severity: "error" });
  }
  addStringSizeIssues(rawTemplate, "document", issues);
  addRawBoundedIssues(rawTemplate, issues);
  addRawGroupIssues(rawTemplate, issues);

  const { document, issues: migrationIssues } = migrateTemplateDocument(source);
  issues.push(...migrationIssues);
  if (!document) {
    return { valid: false, document: null, issues };
  }

  if (!Array.isArray(document.pages) || !document.pages.length) {
    issues.push({ path: "pages", message: "A template requires at least one page.", severity: "error" });
  }

  const pageIds = new Set();
  const elementIds = new Set();
  document.pages.forEach((page, pageIndex) => {
    if (!page.id || pageIds.has(page.id)) {
      issues.push({ path: `pages[${pageIndex}].id`, message: "Page id must be unique.", severity: "error" });
    }
    pageIds.add(page.id);
    (page.elements || []).forEach((element, elementIndex) => {
      const path = `pages[${pageIndex}].elements[${elementIndex}]`;
      if (!element?.id || elementIds.has(element.id)) {
        issues.push({ path: `${path}.id`, message: "Element id must be unique.", severity: "error" });
      }
      elementIds.add(element.id);
      if (!isElementType(element?.type)) {
        issues.push({ path: `${path}.type`, message: `Unsupported element type: ${element?.type || "unknown"}.`, severity: "error" });
      }
      validateElementProperties(element).forEach((issue) => {
        issues.push({ ...issue, path: `${path}.${issue.path}` });
      });
    });
  });

  const paper = document.pageSettings.paper;
  const margin = document.pageSettings.margin;
  if (margin.left + margin.right >= paper.widthMm || margin.top + margin.bottom >= paper.heightMm) {
    issues.push({ path: "pageSettings.margin", message: "Margins must leave a positive printable area.", severity: "error" });
  }

  return { valid: !issues.some((item) => item.severity === "error"), document, issues };
}

export function serializeTemplateDocument(template, metadata = {}) {
  const source = normalizeSource(template);
  const now = new Date().toISOString();
  const document = normalizeSource({
    ...source,
    ...clone(metadata),
    meta: {
      ...source.meta,
      ...object(metadata.meta),
      createdAt: metadata.meta?.createdAt || source.meta.createdAt || now,
      updatedAt: now,
    },
  });

  return validateTemplateDocument(document);
}

export function createPublishReadyTemplatePayload(template) {
  const result = serializeTemplateDocument(template);
  if (!result.valid) {
    return { ...result, payload: null };
  }

  const { schemaVersion, id, meta, pageSettings, pages } = result.document;
  return {
    ...result,
    payload: {
      schemaVersion,
      id,
      meta: { name: meta.name, unit: meta.unit, createdAt: meta.createdAt, updatedAt: meta.updatedAt },
      pageSettings,
      pages,
    },
  };
}
