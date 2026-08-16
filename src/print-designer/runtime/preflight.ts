import { validateTemplateDocument } from "../template/templateDocument.js";
import { resolveRuntimeTemplate } from "./dataResolver.js";
const INCOMPLETE_RUNTIME_ISSUE_CODES = new Set([
    "missing-binding",
    "missing-table-data",
    "missing-table-footer-data",
    "missing-label-data",
    "empty-machine-code",
    "empty-image",
    "outside-printable-area",
]) as any;
function object(value: any): any {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
export function normalizePrintPolicy(policy: any = {}): any {
    return {
        allowIncomplete: policy?.allowIncomplete === true,
    };
}
function printable(element: any): any {
    return element?.visible !== false && element?.printable !== false;
}
function completenessSeverity(policy: any): any {
    return policy.allowIncomplete ? "warning" : "error";
}
function createRuntimeIssue({ code, path, elementId, binding, message, policy }: any): any {
    return {
        code,
        path,
        elementId,
        ...(binding ? { binding } : {}),
        message,
        severity: completenessSeverity(policy),
    };
}
function collectCompletenessIssues(document: any, runtimeDocument: any, policy: any): any {
    const issues = [] as any;
    const pageSettings = document?.pageSettings || {} as any;
    const paper = pageSettings.paper || {} as any;
    const margin = pageSettings.margin || {} as any;
    const width = Number(paper.widthMm) || 210 as any;
    const height = Number(paper.heightMm) || 297 as any;
    const safeArea = {
        left: Number(margin.left) || 0,
        top: Number(margin.top) || 0,
        right: width - (Number(margin.right) || 0),
        bottom: height - (Number(margin.bottom) || 0),
    } as any;
    (runtimeDocument?.pages || []).forEach((page: any, pageIndex: any): any => {
        (page.elements || []).forEach((element: any, elementIndex: any): any => {
            if (!printable(element)) {
                return;
            }
            const path = `pages[${pageIndex}].elements[${elementIndex}]` as any;
            const left = Number(element.x) || 0 as any;
            const top = Number(element.y) || 0 as any;
            const right = left + (Number(element.width) || 0) as any;
            const bottom = top + (Number(element.height) || 0) as any;
            if (left < safeArea.left || top < safeArea.top || right > safeArea.right || bottom > safeArea.bottom) {
                issues.push(createRuntimeIssue({
                    code: "outside-printable-area",
                    path,
                    elementId: element.id,
                    message: `Element extends outside the configured printable area on page ${pageIndex + 1}.`,
                    policy,
                }));
            }
            const value = element.runtime?.value as any;
            if (["barcode", "qrcode"].includes(element.type) && value?.status !== "missing" && !String(value?.value || "").trim()) {
                issues.push(createRuntimeIssue({
                    code: "empty-machine-code",
                    path: `${path}.variable`,
                    elementId: element.id,
                    binding: element.variable,
                    message: `Printable ${element.type === "barcode" ? "barcode" : "QR code"} requires a value.`,
                    policy,
                }));
            }
            if (element.type === "image" && value?.status !== "missing" && !String(value?.value || "").trim()) {
                issues.push(createRuntimeIssue({
                    code: "empty-image",
                    path: `${path}.variable`,
                    elementId: element.id,
                    binding: element.variable,
                    message: "Printable image requires an image URL or data URL.",
                    policy,
                }));
            }
        });
    });
    return issues;
}
function collectPaginationWarnings(runtimeDocument: any): any {
    const issues = [] as any;
    (runtimeDocument?.pages || []).forEach((page: any, pageIndex: any): any => {
        const paginatedTables = (page.elements || []).filter((element: any): any => element.type === "table" && element.props?.autoPaginate !== false) as any;
        if (paginatedTables.length > 1) {
            issues.push({
                code: "multiple-paginated-tables",
                path: `pages[${pageIndex}].elements`,
                message: "Multiple auto-paginated tables share this page; shorter tables are omitted on later fragments.",
                severity: "warning",
            });
        }
    });
    return issues;
}
export function validatePrintRuntime(document: any, runtimeData: any = {}, printPolicy: any = {}): any {
    const templateValidation = validateTemplateDocument(document) as any;
    const data = object(runtimeData) as any;
    const policy = normalizePrintPolicy(printPolicy) as any;
    const runtimeValidation = templateValidation.valid
        ? resolveRuntimeTemplate(templateValidation.document, data)
        : { document: null, issues: [] } as any;
    const runtimeIssues = (runtimeValidation.issues || []).map((issue: any): any => (INCOMPLETE_RUNTIME_ISSUE_CODES.has(issue.code)
        ? { ...issue, severity: completenessSeverity(policy) }
        : issue)) as any;
    const completenessIssues = templateValidation.valid
        ? collectCompletenessIssues(templateValidation.document, runtimeValidation.document, policy)
        : [] as any;
    const paginationWarnings = templateValidation.valid
        ? collectPaginationWarnings(runtimeValidation.document)
        : [] as any;
    const issues = [
        ...(templateValidation.issues || []),
        ...runtimeIssues,
        ...completenessIssues,
        ...paginationWarnings,
    ] as any;
    return {
        valid: templateValidation.valid && !issues.some((issue: any): any => issue.severity === "error"),
        document: templateValidation.document,
        runtimeDocument: runtimeValidation.document,
        issues,
        templateIssues: templateValidation.issues || [],
        runtimeIssues: [...runtimeIssues, ...completenessIssues, ...paginationWarnings],
        policy,
    };
}
