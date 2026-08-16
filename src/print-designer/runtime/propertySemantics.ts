import { resolveDataPath } from "./dataResolver.js";
function number(value: any, fallback: any, min: any, max: any): any {
    const parsed = Number(value) as any;
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}
export function machineCodeOptions(props: any = {}): any {
    return {
        margin: number(props.margin, 0, 0, 40),
        textMargin: number(props.textMargin, 2, 0, 40),
        textFontSize: number(props.textFontSize, 10, 6, 72),
    };
}
export function imageObjectPosition(style: any = {}): any {
    const value = typeof style.objectPosition === "string" ? style.objectPosition.trim() : "" as any;
    return value || "50% 50%";
}
export function resolveRelativeRecordPath(record: any, path: any): any {
    if (!path) {
        return { found: false, value: undefined, path: "" };
    }
    return resolveDataPath(record, path);
}
export function formatTableValue(value: any, formatter: any): any {
    if (value == null || value === "") {
        return "";
    }
    if (!formatter || typeof formatter !== "object") {
        return String(value);
    }
    if (formatter.type === "number") {
        const numeric = Number(value) as any;
        if (!Number.isFinite(numeric))
            return String(value);
        const decimals = number(formatter.decimals, 0, 0, 8) as any;
        return numeric.toFixed(decimals);
    }
    if (formatter.type === "currency") {
        const numeric = Number(value) as any;
        if (!Number.isFinite(numeric))
            return String(value);
        const decimals = number(formatter.decimals, 2, 0, 8) as any;
        const symbol = typeof formatter.symbol === "string" ? formatter.symbol.slice(0, 8) : "" as any;
        return `${symbol}${numeric.toFixed(decimals)}`;
    }
    if (formatter.type === "date") {
        const date = new Date(value) as any;
        return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString().slice(0, 10);
    }
    return String(value);
}
