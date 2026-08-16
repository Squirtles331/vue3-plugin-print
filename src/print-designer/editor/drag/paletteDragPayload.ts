const PALETTE_DRAG_MIME = "application/x-print-designer-palette-item";
function normalizePayload(payload, fallbackType = "", fallbackLabel = "") {
    const type = payload?.type || fallbackType;
    if (!type) {
        return null;
    }
    return {
        source: "palette",
        type,
        label: payload?.label || fallbackLabel || type,
    };
}
export function writePaletteDragPayload(event, item) {
    const dataTransfer = event?.dataTransfer;
    const payload = normalizePayload(item);
    if (!dataTransfer || !payload) {
        return null;
    }
    dataTransfer.effectAllowed = "copy";
    dataTransfer.setData(PALETTE_DRAG_MIME, JSON.stringify(payload));
    dataTransfer.setData("text/plain", payload.type);
    return payload;
}
