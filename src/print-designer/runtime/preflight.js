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
]);

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function normalizePrintPolicy(policy = {}) {
  return {
    allowIncomplete: policy?.allowIncomplete === true,
  };
}

function printable(element) {
  return element?.visible !== false && element?.printable !== false;
}

function completenessSeverity(policy) {
  return policy.allowIncomplete ? "warning" : "error";
}

function createRuntimeIssue({ code, path, elementId, binding, message, policy }) {
  return {
    code,
    path,
    elementId,
    ...(binding ? { binding } : {}),
    message,
    severity: completenessSeverity(policy),
  };
}

function collectCompletenessIssues(document, runtimeDocument, policy) {
  const issues = [];
  const pageSettings = document?.pageSettings || {};
  const paper = pageSettings.paper || {};
  const margin = pageSettings.margin || {};
  const width = Number(paper.widthMm) || 210;
  const height = Number(paper.heightMm) || 297;
  const safeArea = {
    left: Number(margin.left) || 0,
    top: Number(margin.top) || 0,
    right: width - (Number(margin.right) || 0),
    bottom: height - (Number(margin.bottom) || 0),
  };

  (runtimeDocument?.pages || []).forEach((page, pageIndex) => {
    (page.elements || []).forEach((element, elementIndex) => {
      if (!printable(element)) {
        return;
      }

      const path = `pages[${pageIndex}].elements[${elementIndex}]`;
      const left = Number(element.x) || 0;
      const top = Number(element.y) || 0;
      const right = left + (Number(element.width) || 0);
      const bottom = top + (Number(element.height) || 0);
      if (left < safeArea.left || top < safeArea.top || right > safeArea.right || bottom > safeArea.bottom) {
        issues.push(createRuntimeIssue({
          code: "outside-printable-area",
          path,
          elementId: element.id,
          message: `Element extends outside the configured printable area on page ${pageIndex + 1}.`,
          policy,
        }));
      }

      const value = element.runtime?.value;
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

function collectPaginationWarnings(runtimeDocument) {
  const issues = [];
  (runtimeDocument?.pages || []).forEach((page, pageIndex) => {
    const paginatedTables = (page.elements || []).filter((element) => element.type === "table" && element.props?.autoPaginate !== false);
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

export function validatePrintRuntime(document, runtimeData = {}, printPolicy = {}) {
  const templateValidation = validateTemplateDocument(document);
  const data = object(runtimeData);
  const policy = normalizePrintPolicy(printPolicy);
  const runtimeValidation = templateValidation.valid
    ? resolveRuntimeTemplate(templateValidation.document, data)
    : { document: null, issues: [] };
  const runtimeIssues = (runtimeValidation.issues || []).map((issue) => (
    INCOMPLETE_RUNTIME_ISSUE_CODES.has(issue.code)
      ? { ...issue, severity: completenessSeverity(policy) }
      : issue
  ));
  const completenessIssues = templateValidation.valid
    ? collectCompletenessIssues(templateValidation.document, runtimeValidation.document, policy)
    : [];
  const paginationWarnings = templateValidation.valid
    ? collectPaginationWarnings(runtimeValidation.document)
    : [];
  const issues = [
    ...(templateValidation.issues || []),
    ...runtimeIssues,
    ...completenessIssues,
    ...paginationWarnings,
  ];

  return {
    valid: templateValidation.valid && !issues.some((issue) => issue.severity === "error"),
    document: templateValidation.document,
    runtimeDocument: runtimeValidation.document,
    issues,
    templateIssues: templateValidation.issues || [],
    runtimeIssues: [...runtimeIssues, ...completenessIssues, ...paginationWarnings],
    policy,
  };
}
