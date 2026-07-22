import { MM_TO_CSS_PX } from "../measurement.js";

export function pickGridSpacingMm(pixelsPerUnit) {
  const steps = [1, 2, 5, 10, 20, 25, 50];
  const targetMinorGapPx = 18;

  return steps.find((step) => step * pixelsPerUnit >= targetMinorGapPx) || steps[steps.length - 1];
}

export function createGridDefinition(pixelsPerUnit) {
  const minorMm = pickGridSpacingMm(pixelsPerUnit);
  const majorMm = minorMm * 5;

  return {
    minorMm,
    majorMm,
    minorPx: +(minorMm * MM_TO_CSS_PX).toFixed(2),
    majorPx: +(majorMm * MM_TO_CSS_PX).toFixed(2),
  };
}
