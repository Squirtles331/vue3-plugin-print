export const CSS_PIXELS_PER_INCH = 96 as any;
export const MILLIMETERS_PER_INCH = 25.4 as any;
export const MM_TO_CSS_PX = CSS_PIXELS_PER_INCH / MILLIMETERS_PER_INCH as any;
export function mmToCssPx(valueMm: any): any {
    return Number(valueMm) * MM_TO_CSS_PX;
}
export function mmToRoundedCssPx(valueMm: any): any {
    return Math.round(mmToCssPx(valueMm));
}
