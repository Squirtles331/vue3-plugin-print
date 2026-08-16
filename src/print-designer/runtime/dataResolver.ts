import { toRaw } from "vue";
function clone(value: any): any {
    const rawValue = toRaw(value) as any;
    if (typeof structuredClone === "function") {
        return structuredClone(rawValue);
    }
    return JSON.parse(JSON.stringify(rawValue));
}
function normalizePath(path: any): any {
    return String(path || "")
        .trim()
        .replace(/^@/, "")
        .replace(/\[(?:"([^"]+)"|'([^']+)'|(\d+))\]/g, (_: any, quoted: any, singleQuoted: any, numericIndex: any): any => `.${quoted || singleQuoted || numericIndex}`)
        .replace(/^\.+|\.+$/g, "");
}
export function resolveDataPath(data: any, path: any): any {
    const normalized = normalizePath(path) as any;
    if (!normalized) {
        return { found: false, value: undefined, path: normalized };
    }
    let current = data as any;
    for (const segment of normalized.split(".")) {
        if (!segment || current == null || !Object.prototype.hasOwnProperty.call(Object(current), segment)) {
            return { found: false, value: undefined, path: normalized };
        }
        current = current[segment];
    }
    return { found: true, value: current, path: normalized };
}
export function bindingToken(path: any): any {
    return `{{${String(path || "").replace(/^@/, "")}}}`;
}
function resolveElementValue(element: any, runtimeData: any): any {
    if (element.variable) {
        const result = resolveDataPath(runtimeData, element.variable) as any;
        return result.found
            ? { value: result.value == null ? "" : String(result.value), status: "resolved", path: result.path }
            : { value: bindingToken(element.variable), status: "missing", path: result.path };
    }
    const authoredValue = element.type === "image" ? element.props?.src || element.content : element.content as any;
    return {
        value: authoredValue == null ? "" : String(authoredValue),
        status: authoredValue == null || authoredValue === "" ? "empty" : "authored",
        path: "",
    };
}
function resolveTableColumns(props: any): any {
    return Array.isArray(props.columns) ? props.columns : [];
}
function resolveCollection(props: any, variableKey: any, dataKey: any, runtimeData: any): any {
    const variable = props[variableKey] as any;
    if (variable) {
        const result = resolveDataPath(runtimeData, variable) as any;
        return {
            value: result.found && Array.isArray(result.value) ? result.value : [],
            status: result.found && Array.isArray(result.value) ? "resolved" : "missing",
            path: result.path,
        };
    }
    return {
        value: Array.isArray(props[dataKey]) ? props[dataKey] : [],
        status: Array.isArray(props[dataKey]) && props[dataKey].length ? "authored" : "empty",
        path: "",
    };
}
export function applyConstrainedTableTransform(rows: any, transform: any): any {
    const source = Array.isArray(rows) ? [...rows] : [] as any;
    if (!transform || (typeof transform === "object" && !Array.isArray(transform) && Object.keys(transform).length === 0)) {
        return { rows: source, issues: [] };
    }
    if (!transform || typeof transform !== "object") {
        return { rows: source, issues: [{ message: "Table transform must be a declarative object.", severity: "error" }] };
    }
    if (transform.type === "sort" && typeof transform.by === "string") {
        const direction = transform.direction === "desc" ? -1 : 1 as any;
        return {
            rows: source.sort((left: any, right: any): any => String(left?.[transform.by] ?? "").localeCompare(String(right?.[transform.by] ?? "")) * direction),
            issues: [],
        };
    }
    if (transform.type === "filterEquals" && typeof transform.by === "string") {
        return {
            rows: source.filter((row: any): any => row?.[transform.by] === transform.value),
            issues: [],
        };
    }
    return {
        rows: source,
        issues: [{ code: "invalid-table-transform", message: `Unsupported table transform: ${transform.type || "unknown"}.`, severity: "error" }],
    };
}
function resolveTable(element: any, runtimeData: any): any {
    const props = element.props || {} as any;
    const data = resolveCollection(props, "dataVariable", "sampleData", runtimeData) as any;
    const footer = resolveCollection(props, "footerDataVariable", "footerData", runtimeData) as any;
    const transformed = applyConstrainedTableTransform(data.value, props.transform) as any;
    const issues = [...transformed.issues] as any;
    if (props.customScript) {
        issues.push({
            code: "disabled-table-script",
            message: "Custom table scripts are disabled at runtime. Use the declarative transform configuration instead.",
            severity: "error",
        });
    }
    return {
        columns: resolveTableColumns(props),
        rows: transformed.rows,
        footerRows: footer.value,
        dataStatus: data.status,
        dataPath: data.path,
        footerStatus: footer.status,
        footerPath: footer.path,
        issues,
    };
}
function resolveMultiLabel(element: any, runtimeData: any): any {
    const props = element.props || {} as any;
    const result = resolveCollection(props, "dataVariable", "sampleData", runtimeData) as any;
    return {
        rows: result.value,
        status: result.status,
        path: result.path,
    };
}
export function resolveRuntimeTemplate(document: any, runtimeData: any = {}): any {
    const input = document && typeof document === "object" ? clone(document) : null as any;
    if (!input) {
        return { document: null, issues: [{ path: "document", message: "A template document is required.", severity: "error" }] };
    }
    const issues = [] as any;
    const pages = (input.pages || []).map((page: any, pageIndex: any): any => ({
        ...page,
        elements: (page.elements || []).map((element: any, elementIndex: any): any => {
            const next = { ...element, runtime: {} } as any;
            if (["text", "image", "barcode", "qrcode"].includes(element.type)) {
                next.runtime.value = resolveElementValue(element, runtimeData);
                if (next.runtime.value.status === "missing") {
                    issues.push({
                        code: "missing-binding",
                        path: `pages[${pageIndex}].elements[${elementIndex}].variable`,
                        elementId: element.id,
                        binding: next.runtime.value.path,
                        message: `Missing binding value: ${bindingToken(next.runtime.value.path)}`,
                        severity: "warning",
                    });
                }
            }
            if (element.type === "table") {
                next.runtime.table = resolveTable(element, runtimeData);
                next.runtime.table.issues.forEach((issue: any): any => issues.push({ ...issue, path: `element:${element.id}` }));
                if (next.runtime.table.dataStatus === "missing") {
                    issues.push({
                        code: "missing-table-data",
                        path: `pages[${pageIndex}].elements[${elementIndex}].props.dataVariable`,
                        elementId: element.id,
                        binding: next.runtime.table.dataPath,
                        message: `Missing table data: ${bindingToken(next.runtime.table.dataPath)}`,
                        severity: "warning",
                    });
                }
                if (next.runtime.table.footerStatus === "missing") {
                    issues.push({
                        code: "missing-table-footer-data",
                        path: `pages[${pageIndex}].elements[${elementIndex}].props.footerDataVariable`,
                        elementId: element.id,
                        binding: next.runtime.table.footerPath,
                        message: `Missing table footer data: ${bindingToken(next.runtime.table.footerPath)}`,
                        severity: "warning",
                    });
                }
            }
            if (element.type === "multiLabel") {
                next.runtime.multiLabel = resolveMultiLabel(element, runtimeData);
                if (next.runtime.multiLabel.status === "missing") {
                    issues.push({
                        code: "missing-label-data",
                        path: `pages[${pageIndex}].elements[${elementIndex}].props.dataVariable`,
                        elementId: element.id,
                        binding: next.runtime.multiLabel.path,
                        message: `Missing label data: ${bindingToken(next.runtime.multiLabel.path)}`,
                        severity: "warning",
                    });
                }
            }
            return next;
        }),
    })) as any;
    return { document: { ...input, pages }, issues };
}
