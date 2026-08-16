function roundMm(value) {
    return +value.toFixed(2);
}
function dedupeReferences(references) {
    const seen = new Set();
    return references.filter((reference) => {
        const key = `${reference.source}:${roundMm(reference.position)}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function buildGridReferences(pageSizeMm, gridSpacingMm) {
    if (!Number.isFinite(gridSpacingMm) || gridSpacingMm <= 0) {
        return [];
    }
    const references = [];
    for (let position = 0; position <= pageSizeMm + 0.001; position += gridSpacingMm) {
        references.push({
            source: "grid",
            position: Math.min(pageSizeMm, roundMm(position)),
        });
    }
    return references;
}
export function buildAxisSnapReferences(pageSizeMm, guides, gridSpacingMm) {
    return dedupeReferences([
        { source: "page", position: 0 },
        { source: "page", position: roundMm(pageSizeMm) },
        ...guides.map((position) => ({
            source: "guide",
            position: roundMm(position),
        })),
        ...buildGridReferences(pageSizeMm, gridSpacingMm),
    ]).sort((left, right) => left.position - right.position);
}
function resolveAxisSnap({ value, size, references, pixelsPerUnit, tolerancePx }) {
    const candidates = [
        { edge: "start", position: value, offset: 0 },
        { edge: "end", position: value + size, offset: size },
    ];
    let best = null;
    candidates.forEach((candidate) => {
        references.forEach((reference) => {
            const distancePx = Math.abs(reference.position - candidate.position) * pixelsPerUnit;
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
export function resolveObjectSnap({ x, y, width, height, pageWidthMm, pageHeightMm, verticalGuides, horizontalGuides, gridSpacingMm, pixelsPerUnit, tolerancePx = 6, }) {
    const xReferences = buildAxisSnapReferences(pageWidthMm, verticalGuides, gridSpacingMm);
    const yReferences = buildAxisSnapReferences(pageHeightMm, horizontalGuides, gridSpacingMm);
    const xSnap = resolveAxisSnap({
        value: x,
        size: width,
        references: xReferences,
        pixelsPerUnit,
        tolerancePx,
    });
    const ySnap = resolveAxisSnap({
        value: y,
        size: height,
        references: yReferences,
        pixelsPerUnit,
        tolerancePx,
    });
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
