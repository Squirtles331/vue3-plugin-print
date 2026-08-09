import { isElementType } from "../core/elementFactory.js";

export const TEMPLATE_SCHEMA_VERSION = 1;

const DEFAULT_PAPER = {
  preset: "A4",
  widthMm: 210,
  heightMm: 297,
  orientation: "portrait",
};

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function newId() {
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function stripEditorState(page, index) {
  const { elements = [], isCurrent, size, orientation, thumbnail, ...pageData } = page || {};

  return {
    ...clone(pageData),
    id: text(pageData.id, `page-${index + 1}`),
    title: text(pageData.title, `Page ${index + 1}`),
    elements: Array.isArray(elements)
      ? elements.map((element) => {
          const { selected, hovered, editing, interactionState, ...printableElement } = element || {};
          return clone(printableElement);
        })
      : [],
  };
}

function normalizePageSettings(value) {
  const source = value && typeof value === "object" ? value : {};
  const paper = source.paper && typeof source.paper === "object" ? source.paper : {};
  const margin = source.margin && typeof source.margin === "object" ? source.margin : {};

  return {
    ...clone(source),
    paper: {
      ...DEFAULT_PAPER,
      ...clone(paper),
      widthMm: Math.max(20, numeric(paper.widthMm, DEFAULT_PAPER.widthMm)),
      heightMm: Math.max(20, numeric(paper.heightMm, DEFAULT_PAPER.heightMm)),
    },
    margin: {
      top: Math.max(0, numeric(margin.top, 8)),
      right: Math.max(0, numeric(margin.right, 8)),
      bottom: Math.max(0, numeric(margin.bottom, 8)),
      left: Math.max(0, numeric(margin.left, 8)),
    },
  };
}

function normalizeSource(source) {
  if (!source || typeof source !== "object") {
    return createBlankTemplateDocument();
  }

  const rawTemplate = source.template && typeof source.template === "object" ? source.template : source;
  const meta = rawTemplate.meta && typeof rawTemplate.meta === "object" ? rawTemplate.meta : {};
  const pages = Array.isArray(rawTemplate.pages) ? rawTemplate.pages : [];

  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    id: text(rawTemplate.id || meta.id, newId()),
    meta: {
      ...clone(meta),
      name: text(meta.name, "Untitled print template"),
      unit: text(meta.unit, "mm"),
      createdAt: text(meta.createdAt, new Date().toISOString()),
      updatedAt: text(meta.updatedAt, new Date().toISOString()),
    },
    pageSettings: normalizePageSettings(rawTemplate.pageSettings),
    pages: pages.length ? pages.map(stripEditorState) : [createBlankPage()],
  };
}

export function createBlankPage() {
  return {
    id: "page-1",
    title: "Page 1",
    elements: [],
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
      issues: [
        {
          path: "schemaVersion",
          message: `Template schema version ${version} is newer than this editor supports.`,
          severity: "error",
        },
      ],
    };
  }

  return {
    document: normalizeSource(source),
    issues:
      version === TEMPLATE_SCHEMA_VERSION
        ? []
        : [
            {
              path: "schemaVersion",
              message: "A legacy template was normalized to schema version 1.",
              severity: "warning",
            },
          ],
  };
}

export function validateTemplateDocument(source) {
  const issues = [];
  const { document, issues: migrationIssues } = migrateTemplateDocument(source);
  issues.push(...migrationIssues);

  if (!document) {
    return { valid: false, document: null, issues };
  }

  if (!Array.isArray(document.pages) || !document.pages.length) {
    issues.push({ path: "pages", message: "A template requires at least one page.", severity: "error" });
  }

  document.pages.forEach((page, pageIndex) => {
    if (!page.id) {
      issues.push({ path: `pages[${pageIndex}].id`, message: "Page id is required.", severity: "error" });
    }

    page.elements.forEach((element, elementIndex) => {
      const path = `pages[${pageIndex}].elements[${elementIndex}]`;
      if (!element?.id) {
        issues.push({ path, message: "Element id is required.", severity: "error" });
      }
      if (!isElementType(element?.type)) {
        issues.push({ path, message: `Unsupported element type: ${element?.type || "unknown"}.`, severity: "error" });
      }
      ["x", "y", "width", "height"].forEach((key) => {
        if (!Number.isFinite(Number(element?.[key]))) {
          issues.push({ path: `${path}.${key}`, message: `${key} must be numeric.`, severity: "error" });
        }
      });
    });
  });

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
      ...(metadata.meta || {}),
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
      meta: {
        name: meta.name,
        unit: meta.unit,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
      },
      pageSettings,
      pages,
    },
  };
}
