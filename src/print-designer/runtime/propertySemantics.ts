import { resolveDataPath } from "./dataResolver.js";
function number(value, fallback, min, max) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}
export function machineCodeOptions(props = {}) {
    return {
        margin: number(props.margin, 0, 0, 40),
        textMargin: number(props.textMargin, 2, 0, 40),
        textFontSize: number(props.textFontSize, 10, 6, 72),
    };
}
export function imageObjectPosition(style = {}) {
    const value = typeof style.objectPosition === "string" ? style.objectPosition.trim() : "";
    return value || "50% 50%";
}
export function resolveRelativeRecordPath(record, path) {
    if (!path) {
        return { found: false, value: undefined, path: "" };
    }
    return resolveDataPath(record, path);
}
export function formatTableValue(value, formatter) {
    if (value == null || value === "") {
        return "";
    }
    if (!formatter || typeof formatter !== "object") {
        return String(value);
    }
    if (formatter.type === "number") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric))
            return String(value);
        const decimals = number(formatter.decimals, 0, 0, 8);
        return numeric.toFixed(decimals);
    }
    if (formatter.type === "currency") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric))
            return String(value);
        const decimals = number(formatter.decimals, 2, 0, 8);
        const symbol = typeof formatter.symbol === "string" ? formatter.symbol.slice(0, 8) : "";
        return `${symbol}${numeric.toFixed(decimals)}`;
    }
    if (formatter.type === "date") {
        const date = new Date(value);
        return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString().slice(0, 10);
    }
    return String(value);
}
