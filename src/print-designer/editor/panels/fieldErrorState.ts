export function fieldErrorKey(field) {
    if (!field?.source || !field?.key) {
        return "";
    }
    return `${field.source}:${field.key}`;
}
export function getFieldError(errors, field) {
    const key = fieldErrorKey(field);
    return key ? errors?.[key] || "" : "";
}
