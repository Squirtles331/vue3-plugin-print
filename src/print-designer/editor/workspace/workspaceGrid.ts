import { MM_TO_CSS_PX } from "../measurement.js";
export function pickGridSpacingMm(pixelsPerUnit: any): any {
    const steps = [1, 2, 5, 10, 20, 25, 50] as any;
    const targetMinorGapPx = 18 as any;
    return steps.find((step: any): any => step * pixelsPerUnit >= targetMinorGapPx) || steps[steps.length - 1];
}
export function createGridDefinition(pixelsPerUnit: any): any {
    const minorMm = pickGridSpacingMm(pixelsPerUnit) as any;
    const majorMm = minorMm * 5 as any;
    return {
        minorMm,
        majorMm,
        minorPx: +(minorMm * MM_TO_CSS_PX).toFixed(2),
        majorPx: +(majorMm * MM_TO_CSS_PX).toFixed(2),
    };
}
