import { mmToCssPx } from "../../editor/measurement.js";
export function previewForeground(object: any): any {
    return object?.style?.color || object?.style?.borderColor || "#172033";
}
export function previewBackground(object: any, fallback: any = "#ffffff"): any {
    const background = object?.style?.backgroundColor as any;
    return background && background !== "transparent" ? background : fallback;
}
export function previewPanelStyle(object: any, fallbackBackground: any = "transparent"): any {
    const style = object?.style || {} as any;
    const borderWidth = Math.max(0, Number(style.borderWidth) || 0) as any;
    const padding = Math.max(0, Number(style.padding) || 0) as any;
    const radius = Math.max(0, Number(style.borderRadius) || 0) as any;
    const opacity = Number(style.opacity) as any;
    return {
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        padding: `${mmToCssPx(padding)}px`,
        border: borderWidth
            ? `${borderWidth}px ${style.borderStyle || "solid"} ${style.borderColor || previewForeground(object)}`
            : "0 solid transparent",
        borderRadius: `${radius}px`,
        background: previewBackground(object, fallbackBackground),
        opacity: Number.isFinite(opacity) ? opacity : 1,
    };
}
export function textStyle(object: any): any {
    const verticalAlign = object?.style?.verticalAlign || "top" as any;
    const textAlign = object?.style?.textAlign || "left" as any;
    const alignItems = {
        top: "flex-start",
        middle: "center",
        bottom: "flex-end",
    } as any;
    const justifyContent = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
    } as any;
    return {
        ...previewPanelStyle(object, "transparent"),
        display: "flex",
        alignItems: alignItems[verticalAlign] || "flex-start",
        justifyContent: justifyContent[textAlign] || "flex-start",
        color: previewForeground(object),
        fontFamily: object?.style?.fontFamily || "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: `${object?.style?.fontSize || 14}px`,
        fontWeight: object?.style?.fontWeight || "normal",
        fontStyle: object?.style?.fontStyle || "normal",
        textDecoration: object?.style?.textDecoration || "none",
        textAlign,
        lineHeight: object?.style?.lineHeight || 1.4,
        letterSpacing: `${object?.style?.letterSpacing || 0}px`,
        whiteSpace: object?.props?.whiteSpace || "pre-wrap",
        writingMode: object?.props?.writingMode || "horizontal-tb",
        overflow: object?.props?.autoHeight ? "visible" : "hidden",
    };
}
export function textPreviewValue(object: any, emptyValue: any = "输入文本"): any {
    if (object?.variable) {
        const sampleValue = object?.props?.sampleValue as any;
        return sampleValue != null && String(sampleValue).trim() !== "" ? String(sampleValue) : `{{${object.variable}}}`;
    }
    return object?.content != null && String(object.content).trim() !== "" ? String(object.content) : emptyValue;
}
export function encodedPreviewValue(object: any, emptyValue: any = "未配置编码"): any {
    if (object?.variable) {
        return `{{${object.variable}}}`;
    }
    return object?.content != null && String(object.content).trim() !== "" ? String(object.content) : emptyValue;
}
export function bindingLabel(object: any): any {
    return object?.variable ? `{{${object.variable}}}` : "";
}
export function hashPreviewSeed(value: any): any {
    const source = String(value || "") as any;
    let hash = 2166136261 as any;
    for (let index = 0 as any; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
export function pageNumberValue(object: any): any {
    const current = String(object?.content || "1") as any;
    const format = object?.props?.format || "1" as any;
    const totalPages = String(Math.max(1, Number(object?.props?.totalPages) || 1)) as any;
    if (format === "Page 1")
        return `Page ${current}`;
    if (format === "1/N")
        return `${current}/${totalPages}`;
    if (format === "第1页")
        return `第 ${current} 页`;
    if (format === "第1页/共N页")
        return `第 ${current} 页 / 共 ${totalPages} 页`;
    return current;
}
export function hasBlankTableHeaders(object: any): any {
    if (object?.props?.blankHeaders === true) {
        return true;
    }
    const columns = object?.props?.columns as any;
    return Array.isArray(columns) && columns.length > 0 && columns.every((column: any, index: any): any => {
        const key = String(column?.key || `field${index + 1}`) as any;
        const title = typeof column?.title === "string" ? column.title.trim() : "" as any;
        return key === `field${index + 1}` && (!title || title === key || /^列\s*\d+$/.test(title));
    });
}
