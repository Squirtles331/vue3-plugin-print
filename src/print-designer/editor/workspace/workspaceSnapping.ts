function roundMm(value: any): any {
    return +value.toFixed(2);
}
function dedupeReferences(references: any): any {
    const seen = new Set() as any;
    return references.filter((reference: any): any => {
        const key = `${reference.source}:${roundMm(reference.position)}` as any;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function buildGridReferences(pageSizeMm: any, gridSpacingMm: any): any {
    if (!Number.isFinite(gridSpacingMm) || gridSpacingMm <= 0) {
        return [];
    }
    const references = [] as any;
    for (let position = 0 as any; position <= pageSizeMm + 0.001; position += gridSpacingMm) {
        references.push({
            source: "grid",
            position: Math.min(pageSizeMm, roundMm(position)),
        });
    }
    return references;
}
export function buildAxisSnapReferences(pageSizeMm: any, guides: any, gridSpacingMm: any): any {
    return dedupeReferences([
        { source: "page", position: 0 },
        { source: "page", position: roundMm(pageSizeMm) },
        ...guides.map((position: any): any => ({
            source: "guide",
            position: roundMm(position),
        })),
        ...buildGridReferences(pageSizeMm, gridSpacingMm),
    ]).sort((left: any, right: any): any => left.position - right.position);
}
function resolveAxisSnap({ value, size, references, pixelsPerUnit, tolerancePx }: any): any {
    const candidates = [
        { edge: "start", position: value, offset: 0 },
        { edge: "end", position: value + size, offset: size },
    ] as any;
    let best = null as any;
    candidates.forEach((candidate: any): any => {
        references.forEach((reference: any): any => {
            const distancePx = Math.abs(reference.position - candidate.position) * pixelsPerUnit as any;
            if (distancePx > tolerancePx) {
                return;
            }
            if (!best || distancePx < best.distancePx) {
                best = {
                    edge: candidate.edge,
                    position: reference.position,
                    source: reference.source,
                    distancePx,
                    snappedValue: roundMm(reference.position - candidate.offset),
                };
            }
        });
    });
    return best;
}
export function resolveObjectSnap({ x, y, width, height, pageWidthMm, pageHeightMm, verticalGuides, horizontalGuides, gridSpacingMm, pixelsPerUnit, tolerancePx = 6, }: any): any {
    const xReferences = buildAxisSnapReferences(pageWidthMm, verticalGuides, gridSpacingMm) as any;
    const yReferences = buildAxisSnapReferences(pageHeightMm, horizontalGuides, gridSpacingMm) as any;
    const xSnap = resolveAxisSnap({
        value: x,
        size: width,
        references: xReferences,
        pixelsPerUnit,
        tolerancePx,
    }) as any;
    const ySnap = resolveAxisSnap({
        value: y,
        size: height,
        references: yReferences,
        pixelsPerUnit,
        tolerancePx,
    }) as any;
    return {
        x: xSnap?.snappedValue ?? roundMm(x),
        y: ySnap?.snappedValue ?? roundMm(y),
        activeSnap: {
            x: xSnap
                ? {
                    position: xSnap.position,
                    edge: xSnap.edge,
                    source: xSnap.source,
                }
                : null,
            y: ySnap
                ? {
                    position: ySnap.position,
                    edge: ySnap.edge,
                    source: ySnap.source,
                }
                : null,
        },
        references: {
            x: xReferences,
            y: yReferences,
        },
    };
}
