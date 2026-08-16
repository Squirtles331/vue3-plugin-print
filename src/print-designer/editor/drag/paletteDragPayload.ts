const PALETTE_DRAG_MIME = "application/x-print-designer-palette-item" as any;
function normalizePayload(payload: any, fallbackType: any = "", fallbackLabel: any = ""): any {
    const type = payload?.type || fallbackType as any;
    if (!type) {
        return null;
    }
    return {
        source: "palette",
        type,
        label: payload?.label || fallbackLabel || type,
    };
}
export function writePaletteDragPayload(event: any, item: any): any {
    const dataTransfer = event?.dataTransfer as any;
    const payload = normalizePayload(item) as any;
    if (!dataTransfer || !payload) {
        return null;
    }
    dataTransfer.effectAllowed = "copy";
    dataTransfer.setData(PALETTE_DRAG_MIME, JSON.stringify(payload));
    dataTransfer.setData("text/plain", payload.type);
    return payload;
}
