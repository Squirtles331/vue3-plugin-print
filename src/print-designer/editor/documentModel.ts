function cloneElementSnapshot(element: any): any {
    return {
        ...element,
        style: element?.style ? { ...element.style } : {},
    };
}
function buildPageElements(pageId: any, pageObjectMap: any, objectsById: any): any {
    const objectIds = pageObjectMap?.[pageId] || [] as any;
    return objectIds
        .map((objectId: any): any => objectsById?.[objectId])
        .filter(Boolean)
        .map(cloneElementSnapshot);
}
export function createTemplateModel({ documentName, unit, currentPaperPresetKey, pageWidthMm, pageHeightMm, marginTopMm, marginRightMm, marginBottomMm, marginLeftMm, pageBackground, pageCornerVisible, headerLineVisible, footerLineVisible, headerOffsetMm, footerOffsetMm, printMarksVisible, pages, pageObjectMap, objectsById, }: any): any {
    return {
        schemaVersion: 2,
        meta: {
            name: documentName,
            unit,
        },
        pageSettings: {
            paper: {
                preset: currentPaperPresetKey,
                widthMm: pageWidthMm,
                heightMm: pageHeightMm,
                orientation: pageWidthMm > pageHeightMm ? "landscape" : "portrait",
            },
            margin: {
                top: marginTopMm,
                right: marginRightMm,
                bottom: marginBottomMm,
                left: marginLeftMm,
            },
            background: pageBackground,
            cornerMarks: {
                visible: pageCornerVisible,
            },
            headerLine: {
                visible: headerLineVisible,
                offsetMm: headerOffsetMm,
            },
            footerLine: {
                visible: footerLineVisible,
                offsetMm: footerOffsetMm,
            },
            printMarks: {
                visible: printMarksVisible,
            },
        },
        pages: (pages || []).map((page: any): any => {
            const { isCurrent, ...pageData } = page || {} as any;
            return {
                ...pageData,
                elements: buildPageElements(page.id, pageObjectMap, objectsById),
            };
        }),
    };
}
export function createViewStateModel({ zoom, scrollLeft, scrollTop, viewportWidth, viewportHeight, guidesVisible, gridVisible, safeAreaVisible, pageOutlineVisible, snapEnabled, allowOverflowDrag, textQuickToolbarVisible, horizontalGuides, verticalGuides, }: any): any {
    return {
        zoom,
        scroll: {
            left: scrollLeft,
            top: scrollTop,
        },
        viewport: {
            width: viewportWidth,
            height: viewportHeight,
        },
        guides: {
            visible: guidesVisible,
            horizontal: [...(horizontalGuides || [])],
            vertical: [...(verticalGuides || [])],
        },
        grid: {
            visible: gridVisible,
        },
        safeArea: {
            visible: safeAreaVisible,
        },
        pageBorder: {
            visible: pageOutlineVisible,
        },
        snapEnabled,
        allowOverflowDrag,
        textQuickToolbarVisible,
    };
}
export function createPreviewStateModel({ variables, sampleData, computedState, pagination, renderCache, }: any): any {
    return {
        variables: { ...(variables || {}) },
        sampleData: { ...(sampleData || {}) },
        computed: { ...(computedState || {}) },
        pagination: { ...(pagination || {}) },
        renderCache: { ...(renderCache || {}) },
    };
}
export function createPrintDesignerDocument({ template, viewState, previewState }: any): any {
    return {
        template,
        viewState,
        previewState,
    };
}
