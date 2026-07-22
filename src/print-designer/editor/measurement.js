export const CSS_PIXELS_PER_INCH = 96;
export const MILLIMETERS_PER_INCH = 25.4;
export const MM_TO_CSS_PX = CSS_PIXELS_PER_INCH / MILLIMETERS_PER_INCH;

export function mmToCssPx(valueMm) {
  return Number(valueMm) * MM_TO_CSS_PX;
}

export function mmToRoundedCssPx(valueMm) {
  return Math.round(mmToCssPx(valueMm));
}
