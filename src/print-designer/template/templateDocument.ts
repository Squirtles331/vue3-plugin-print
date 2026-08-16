import { toRaw } from "vue";
import { createElement, getElementSizeRule, isElementType } from "../core/elementFactory.js";
import { validateElementProperties } from "../core/propertyCapabilities.js";
import { normalizeTableRowHeights, normalizeTableRows } from "../core/tableModel.js";
export const TEMPLATE_SCHEMA_VERSION = 2 as any;
export const TEMPLATE_LIMITS = Object.freeze({
    maxPages: 100,
    maxElementsPerPage: 500,
    maxElements: 2000,
    maxSerializedCharacters: 5 * 1024 * 1024,
    maxStringCharacters: 2 * 1024 * 1024,
}) as any;
const DEFAULT_PAPER = {
    preset: "A4",
    widthMm: 210,
    heightMm: 297,
    orientation: "portrait",
} as any;
const DEFAULT_MARGIN = { top: 8, right: 8, bottom: 8, left: 8 } as any;
function clone(value: any): any {
    const rawValue = toRaw(value) as any;
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(rawValue);
        }
        catch {
            // JSON template data should still serialize even if a reactive proxy leaks in.
        }
    }
    return JSON.parse(JSON.stringify(rawValue));
}
function text(value: any, fallback: any = ""): any {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function optionalText(value: any): any {
    return typeof value === "string" ? value.trim() : "";
}
function numeric(value: any, fallback: any): any {
    const parsed = Number(value) as any;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function boundedNumber(value: any, fallback: any, min: any, max: any, precision: any = 2): any {
    const parsed = numeric(value, fallback) as any;
    return +Math.min(max, Math.max(min, parsed)).toFixed(precision);
}
function boolean(value: any, fallback: any): any {
    return typeof value === "boolean" ? value : fallback;
}
function object(value: any): any {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function newId(prefix: any = "tpl"): any {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function normalizePageGroups(sourceGroups: any, elements: any): any {
    if (!Array.isArray(sourceGroups)) {
        return [];
    }
    const knownElementIds = new Set(elements.map((element: any): any => element.id)) as any;
    const claimedElementIds = new Set() as any;
    const groupIds = new Set() as any;
    return sourceGroups.reduce((groups: any, value: any, index: any): any => {
        const source = object(value) as any;
        const id = text(source.id, `group-${index + 1}`) as any;
        if (groupIds.has(id)) {
            return groups;
        }
        const elementIds = [...new Set(Array.isArray(source.elementIds) ? source.elementIds.map((item: any): any => String(item || "").trim()) : [])]
            .filter((elementId: any): any => elementId && knownElementIds.has(elementId) && !claimedElementIds.has(elementId)) as any;
        if (elementIds.length < 2) {
            return groups;
        }
        groupIds.add(id);
        elementIds.forEach((elementId: any): any => claimedElementIds.add(elementId));
        groups.push({
            id,
            name: text(source.name, `Group ${groups.length + 1}`),
            elementIds,
        });
        return groups;
    }, []);
}
function stripEditorState(page: any, index: any): any {
    const source = object(page) as any;
    const { elements = [], groups = [], isCurrent, size, orientation, thumbnail, selected, hovered, editing, interactionState, ...pageData } = source as any;
    const id = text(pageData.id, `page-${index + 1}`) as any;
    const normalizedElements = Array.isArray(elements) ? elements.map((element: any, elementIndex: any): any => normalizeElement(element, elementIndex, id)) : [] as any;
    return {
        ...clone(pageData),
        id,
        title: text(pageData.title, `Page ${index + 1}`),
        elements: normalizedElements,
        groups: normalizePageGroups(groups, normalizedElements),
    };
}
function normalizeTableProps(sourceProps: any): any {
    const source = object(sourceProps) as any;
    const { customScript, customScriptVariable, ...props } = source as any;
    const normalizeColumn = (column: any): any => {
        const value = object(column) as any;
        return {
            ...value,
            key: optionalText(value.key),
            valuePath: optionalText(value.valuePath || value.key),
            title: optionalText(value.title || value.key),
            width: boundedNumber(value.width, 20, 1, 240, 2),
            align: ["left", "center", "right"].includes(value.align) ? value.align : "left",
            ...(Object.keys(object(value.formatter)).length ? { formatter: object(value.formatter) } : {}),
        };
    };
    const columns = Array.isArray(props.columns) ? props.columns : null as any;
    const sampleData = Array.isArray(props.sampleData) ? props.sampleData : null as any;
    const footerData = Array.isArray(props.footerData) ? props.footerData : null as any;
    const normalizedColumns = columns ? columns.map(normalizeColumn) : [] as any;
    return {
        ...props,
        ...(columns ? { columns: normalizedColumns } : {}),
        ...(sampleData ? { sampleData: normalizedColumns.length ? normalizeTableRows(sampleData, normalizedColumns) : sampleData } : {}),
        ...(footerData ? { footerData: normalizedColumns.length ? normalizeTableRows(footerData, normalizedColumns) : footerData } : {}),
        ...(props.rowHeights != null ? { rowHeights: normalizeTableRowHeights(props.rowHeights) } : {}),
        dataVariable: optionalText(props.dataVariable),
        footerDataVariable: optionalText(props.footerDataVariable),
        transform: object(props.transform),
    };
}
function normalizeTableEditorHints(source: any): any {
    const hints = object(source.editorHints) as any;
    return {
        omitRows: boolean(hints.omitRows, true),
        rowCount: boundedNumber(hints.rowCount, 10, 1, 500, 0),
    };
}
function normalizeElement(element: any, index: any, pageId: any): any {
    const source = object(element) as any;
    const { selected, hovered, editing, interactionState, ...elementData } = source as any;
    const type = text(source.type) as any;
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
    const sourceProps = object(source.props) as any;
    const normalizedProps = {
        ...(type === "table" ? normalizeTableProps(sourceProps) : sourceProps),
    } as any;
    const normalizedStyle = object(source.style) as any;
    const normalized = createElement(type, {
        ...elementData,
        id: text(source.id, `${pageId}-element-${index + 1}`),
        pageId,
        x: source.x,
        y: source.y,
        rotation: source.rotation,
        variable: source.variable,
        visible: source.visible,
        locked: source.locked,
        printable: source.printable,
        style: normalizedStyle,
        props: normalizedProps,
        ...(type === "table" ? { editorHints: normalizeTableEditorHints(source) } : {}),
    }) as any;
    return {
        ...normalized,
        id: text(source.id, `${pageId}-element-${index + 1}`),
        pageId,
        name: text(source.name, normalized.name),
        content: source.content == null ? "" : String(source.content),
        variable: optionalText(source.variable),
        visible: boolean(source.visible, true),
        locked: boolean(source.locked, false),
        printable: boolean(source.printable, true),
        repeatPerPage: boolean(source.repeatPerPage, false),
        rotation: boundedNumber(source.rotation, 0, -360, 360, 2),
        zIndex: Math.max(0, Math.round(numeric(source.zIndex, index))),
        style: {
            ...normalized.style,
            opacity: boundedNumber(normalizedStyle.opacity, normalized.style.opacity ?? 1, 0, 1, 3),
        },
        ...(type === "table" ? { editorHints: normalizeTableEditorHints(source) } : {}),
    };
}
function normalizePageSettings(value: any = {}): any {
    const source = object(value) as any;
    const paper = object(source.paper) as any;
    const margin = object(source.margin) as any;
    const widthMm = boundedNumber(paper.widthMm, DEFAULT_PAPER.widthMm, 20, 1000, 1) as any;
    const heightMm = boundedNumber(paper.heightMm, DEFAULT_PAPER.heightMm, 20, 1500, 1) as any;
    const cornerMarks = object(source.cornerMarks) as any;
    const headerLine = object(source.headerLine) as any;
    const footerLine = object(source.footerLine) as any;
    const printMarks = object(source.printMarks) as any;
    return {
        paper: {
            preset: text(paper.preset ?? source.paperPreset, DEFAULT_PAPER.preset),
            widthMm,
            heightMm,
            orientation: widthMm > heightMm ? "landscape" : "portrait",
        },
        margin: {
            top: boundedNumber(margin.top, DEFAULT_MARGIN.top, 0, 200, 1),
            right: boundedNumber(margin.right, DEFAULT_MARGIN.right, 0, 200, 1),
            bottom: boundedNumber(margin.bottom, DEFAULT_MARGIN.bottom, 0, 200, 1),
            left: boundedNumber(margin.left, DEFAULT_MARGIN.left, 0, 200, 1),
        },
        background: text(source.background, "#ffffff"),
        cornerMarks: {
            visible: boolean(cornerMarks.visible, true),
        },
        headerLine: {
            visible: boolean(headerLine.visible, false),
            offsetMm: boundedNumber(headerLine.offsetMm, 26.5, 0, 200, 1),
        },
        footerLine: {
            visible: boolean(footerLine.visible, false),
            offsetMm: boundedNumber(footerLine.offsetMm, 26.5, 0, 200, 1),
        },
        printMarks: {
            visible: boolean(printMarks.visible, false),
        },
    };
}
function normalizeSource(source: any): any {
    if (!source || typeof source !== "object") {
        return createBlankTemplateDocument();
    }
    const rawTemplate = source as any;
    const meta = object(rawTemplate.meta) as any;
    const pages = Array.isArray(rawTemplate.pages) ? rawTemplate.pages : [] as any;
    const now = new Date().toISOString() as any;
    return {
        schemaVersion: TEMPLATE_SCHEMA_VERSION,
        id: text(rawTemplate.id, newId()),
        meta: {
            name: text(meta.name, "Untitled print template"),
            unit: "mm",
            createdAt: text(meta.createdAt, now),
            updatedAt: text(meta.updatedAt, now),
        },
        pageSettings: normalizePageSettings(rawTemplate.pageSettings),
        pages: pages.length ? pages.map(stripEditorState) : [createBlankPage()],
    };
}
function addRawBoundedIssues(rawTemplate: any, issues: any): any {
    const pages = Array.isArray(rawTemplate?.pages) ? rawTemplate.pages : [] as any;
    const totalElements = pages.reduce((total: any, page: any): any => total + (Array.isArray(page?.elements) ? page.elements.length : 0), 0) as any;
    if (pages.length > TEMPLATE_LIMITS.maxPages) {
        issues.push({ path: "pages", message: `A template supports at most ${TEMPLATE_LIMITS.maxPages} pages.`, severity: "error" });
    }
    if (totalElements > TEMPLATE_LIMITS.maxElements) {
        issues.push({ path: "pages", message: `A template supports at most ${TEMPLATE_LIMITS.maxElements} elements.`, severity: "error" });
    }
    pages.forEach((page: any, pageIndex: any): any => {
        const elements = Array.isArray(page?.elements) ? page.elements : [] as any;
        if (elements.length > TEMPLATE_LIMITS.maxElementsPerPage) {
            issues.push({ path: `pages[${pageIndex}].elements`, message: `A page supports at most ${TEMPLATE_LIMITS.maxElementsPerPage} elements.`, severity: "error" });
        }
        elements.forEach((element: any, elementIndex: any): any => {
            const rule = getElementSizeRule(element?.type) as any;
            if (!rule) {
                return;
            }
            ["x", "y", "width", "height", "rotation", "zIndex"].forEach((key: any): any => {
                const value = element?.[key] as any;
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
const REMOVED_PAGE_SETTINGS_FIELDS = [
    "paperSize", "pageWidthMm", "pageHeightMm", "widthMm", "heightMm", "marginXMm", "marginYMm", "marginX", "marginY",
    "pageBackground", "pageCornerVisible", "headerLineVisible", "footerLineVisible", "headerOffsetMm", "footerOffsetMm", "printMarksVisible",
] as any;
const REMOVED_ELEMENT_FIELDS = [
    "display", "isLocked", "isPrint", "angle", "left", "top", "dataKey", "imageUrl", "codeFormat", "errorCorrectionLevel", "pageNumberFormat", "opacity",
] as any;
const REMOVED_TABLE_PROP_FIELDS = [
    "headers", "rows", "footerRows", "data", "dataKey", "footerKey", "columnKey", "columnsVariable", "transformConfig",
    "customScript", "customScriptVariable", "designOmitRows", "designRowCount", "embeddedCellTextPosition", "embeddedCellTextLayer",
] as any;
const REMOVED_TABLE_COLUMN_FIELDS = ["field", "header", "format"] as any;
function addRemovedFieldIssues(rawTemplate: any, issues: any): any {
    const pageSettings = object(rawTemplate?.pageSettings) as any;
    REMOVED_PAGE_SETTINGS_FIELDS.forEach((field: any): any => {
        if (Object.hasOwn(pageSettings, field)) {
            issues.push({ path: `pageSettings.${field}`, message: `${field} was removed; use the v2 canonical field.`, severity: "error" });
        }
    });
    (Array.isArray(rawTemplate?.pages) ? rawTemplate.pages : []).forEach((page: any, pageIndex: any): any => {
        (Array.isArray(page?.elements) ? page.elements : []).forEach((element: any, elementIndex: any): any => {
            REMOVED_ELEMENT_FIELDS.forEach((field: any): any => {
                if (Object.hasOwn(object(element), field)) {
                    issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].${field}`, message: `${field} was removed; use the v2 canonical field.`, severity: "error" });
                }
            });
            if (element?.type !== "table") {
                return;
            }
            const props = object(element.props) as any;
            REMOVED_TABLE_PROP_FIELDS.forEach((field: any): any => {
                if (Object.hasOwn(props, field)) {
                    issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].props.${field}`, message: `${field} was removed; use the v2 table field.`, severity: "error" });
                }
            });
            (Array.isArray(props.columns) ? props.columns : []).forEach((column: any, columnIndex: any): any => {
                REMOVED_TABLE_COLUMN_FIELDS.forEach((field: any): any => {
                    if (Object.hasOwn(object(column), field)) {
                        issues.push({ path: `pages[${pageIndex}].elements[${elementIndex}].props.columns[${columnIndex}].${field}`, message: `${field} was removed; use the v2 column field.`, severity: "error" });
                    }
                });
            });
        });
    });
}
function addRawGroupIssues(rawTemplate: any, issues: any): any {
    const claimedElementIds = new Set() as any;
    const groupIds = new Set() as any;
    (Array.isArray(rawTemplate?.pages) ? rawTemplate.pages : []).forEach((page: any, pageIndex: any): any => {
        const elementIds = new Set((Array.isArray(page?.elements) ? page.elements : []).map((element: any): any => String(element?.id || "").trim()).filter(Boolean)) as any;
        const groups = Array.isArray(page?.groups) ? page.groups : [] as any;
        groups.forEach((group: any, groupIndex: any): any => {
            const path = `pages[${pageIndex}].groups[${groupIndex}]` as any;
            const id = String(group?.id || "").trim() as any;
            if (!id || groupIds.has(id)) {
                issues.push({ path: `${path}.id`, message: "Group id must be unique.", severity: "error" });
            }
            groupIds.add(id);
            const ids = Array.isArray(group?.elementIds) ? group.elementIds.map((item: any): any => String(item || "").trim()) : [] as any;
            if (ids.length < 2 || new Set(ids).size !== ids.length) {
                issues.push({ path: `${path}.elementIds`, message: "A group must contain at least two unique elements.", severity: "error" });
            }
            ids.forEach((elementId: any): any => {
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
function addStringSizeIssues(value: any, path: any, issues: any, visited: any = new WeakSet()): any {
    if (typeof value === "string" && value.length > TEMPLATE_LIMITS.maxStringCharacters) {
        issues.push({ path, message: `Value exceeds ${TEMPLATE_LIMITS.maxStringCharacters} characters.`, severity: "error" });
        return;
    }
    if (!value || typeof value !== "object" || visited.has(value)) {
        return;
    }
    visited.add(value);
    Object.entries(value).forEach(([key, child]: any): any => addStringSizeIssues(child, `${path}.${key}`, issues, visited));
}
export function createBlankPage(): any {
    return {
        id: "page-1",
        title: "Page 1",
        elements: [],
        groups: [],
    };
}
export function createBlankTemplateDocument(overrides: any = {}): any {
    const now = new Date().toISOString() as any;
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
    } as any;
    return normalizeSource({ ...document, ...clone(overrides) });
}
export function validateTemplateDocument(source: any): any {
    const issues = [] as any;
    const rawTemplate = source as any;
    const version = Number(rawTemplate?.schemaVersion) as any;
    if (version !== TEMPLATE_SCHEMA_VERSION) {
        return {
            valid: false,
            document: null,
            issues: [{
                    path: "schemaVersion",
                    message: `Only template schema version ${TEMPLATE_SCHEMA_VERSION} is supported.`,
                    severity: "error",
                }],
        };
    }
    try {
        if (JSON.stringify(rawTemplate || {}).length > TEMPLATE_LIMITS.maxSerializedCharacters) {
            issues.push({ path: "document", message: `Template exceeds ${TEMPLATE_LIMITS.maxSerializedCharacters} serialized characters.`, severity: "error" });
        }
    }
    catch {
        issues.push({ path: "document", message: "Template must be serializable JSON data.", severity: "error" });
    }
    addStringSizeIssues(rawTemplate, "document", issues);
    if (rawTemplate?.meta?.unit && rawTemplate.meta.unit !== "mm") {
        issues.push({ path: "meta.unit", message: "Template unit must be mm.", severity: "error" });
    }
    addRemovedFieldIssues(rawTemplate, issues);
    addRawBoundedIssues(rawTemplate, issues);
    addRawGroupIssues(rawTemplate, issues);
    const document = normalizeSource(source) as any;
    if (!Array.isArray(document.pages) || !document.pages.length) {
        issues.push({ path: "pages", message: "A template requires at least one page.", severity: "error" });
    }
    const pageIds = new Set() as any;
    const elementIds = new Set() as any;
    document.pages.forEach((page: any, pageIndex: any): any => {
        if (!page.id || pageIds.has(page.id)) {
            issues.push({ path: `pages[${pageIndex}].id`, message: "Page id must be unique.", severity: "error" });
        }
        pageIds.add(page.id);
        (page.elements || []).forEach((element: any, elementIndex: any): any => {
            const path = `pages[${pageIndex}].elements[${elementIndex}]` as any;
            if (!element?.id || elementIds.has(element.id)) {
                issues.push({ path: `${path}.id`, message: "Element id must be unique.", severity: "error" });
            }
            elementIds.add(element.id);
            if (!isElementType(element?.type)) {
                issues.push({ path: `${path}.type`, message: `Unsupported element type: ${element?.type || "unknown"}.`, severity: "error" });
            }
            validateElementProperties(element).forEach((issue: any): any => {
                issues.push({ ...issue, path: `${path}.${issue.path}` });
            });
        });
    });
    const paper = document.pageSettings.paper as any;
    const margin = document.pageSettings.margin as any;
    if (margin.left + margin.right >= paper.widthMm || margin.top + margin.bottom >= paper.heightMm) {
        issues.push({ path: "pageSettings.margin", message: "Margins must leave a positive printable area.", severity: "error" });
    }
    return { valid: !issues.some((item: any): any => item.severity === "error"), document, issues };
}
export function serializeTemplateDocument(template: any, metadata: any = {}): any {
    const sourceResult = validateTemplateDocument(template) as any;
    if (!sourceResult.valid) {
        return sourceResult;
    }
    const source = sourceResult.document as any;
    const now = new Date().toISOString() as any;
    const document = normalizeSource({
        ...source,
        ...clone(metadata),
        meta: {
            ...source.meta,
            ...object(metadata.meta),
            createdAt: metadata.meta?.createdAt || source.meta.createdAt || now,
            updatedAt: now,
        },
    }) as any;
    return validateTemplateDocument(document);
}
export function createPublishReadyTemplatePayload(template: any): any {
    const result = serializeTemplateDocument(template) as any;
    if (!result.valid) {
        return { ...result, payload: null };
    }
    const { schemaVersion, id, meta, pageSettings, pages } = result.document as any;
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
