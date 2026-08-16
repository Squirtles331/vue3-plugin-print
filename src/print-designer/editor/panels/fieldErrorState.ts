export function fieldErrorKey(field: any): any {
    if (!field?.source || !field?.key) {
        return "";
    }
    return `${field.source}:${field.key}`;
}
export function getFieldError(errors: any, field: any): any {
    const key = fieldErrorKey(field) as any;
    return key ? errors?.[key] || "" : "";
}
