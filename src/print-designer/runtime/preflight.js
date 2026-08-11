import { validateTemplateDocument } from "../template/templateDocument.js";
import { resolveRuntimeTemplate } from "./dataResolver.js";

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function validatePrintRuntime(document, runtimeData = {}) {
  const templateValidation = validateTemplateDocument(document);
  const data = object(runtimeData);
  const runtimeValidation = templateValidation.valid
    ? resolveRuntimeTemplate(templateValidation.document, data)
    : { document: null, issues: [] };
  const issues = [
    ...(templateValidation.issues || []),
    ...(runtimeValidation.issues || []),
  ];

  return {
    valid: templateValidation.valid && !issues.some((issue) => issue.severity === "error"),
    document: templateValidation.document,
    runtimeDocument: runtimeValidation.document,
    issues,
    templateIssues: templateValidation.issues || [],
    runtimeIssues: runtimeValidation.issues || [],
  };
}
