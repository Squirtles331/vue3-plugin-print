import type { EditorPageState, TemplateElement, UnknownRecord } from "../types.js";

interface TemplateModelInput {
    documentName: string;
    unit: string;
    currentPaperPresetKey: string;
    pageWidthMm: number;
    pageHeightMm: number;
    marginTopMm: number;
    marginRightMm: number;
    marginBottomMm: number;
    marginLeftMm: number;
    pageBackground: string;
    pageCornerVisible: boolean;
    headerLineVisible: boolean;
    footerLineVisible: boolean;
    headerOffsetMm: number;
    footerOffsetMm: number;
    printMarksVisible: boolean;
    pages: readonly EditorPageState[];
    pageObjectMap: Record<string, string[]>;
    objectsById: Record<string, TemplateElement>;
}
interface ViewStateInput {
    zoom: number;
    scrollLeft: number;
    scrollTop: number;
    viewportWidth: number;
    viewportHeight: number;
    guidesVisible: boolean;
    gridVisible: boolean;
    safeAreaVisible: boolean;
    pageOutlineVisible: boolean;
    snapEnabled: boolean;
    allowOverflowDrag: boolean;
    textQuickToolbarVisible: boolean;
    horizontalGuides: readonly number[];
    verticalGuides: readonly number[];
}
interface PreviewStateInput {
    variables: UnknownRecord;
    sampleData: UnknownRecord;
    computedState: UnknownRecord;
    pagination: UnknownRecord;
    renderCache: UnknownRecord;
}

function cloneElementSnapshot(element: TemplateElement): TemplateElement {
    return {
        ...element,
        style: element?.style ? { ...element.style } : {},
    };
}
function buildPageElements(pageId: string, pageObjectMap: Record<string, string[]>, objectsById: Record<string, TemplateElement>): TemplateElement[] {
    const objectIds = pageObjectMap[pageId] || [];
    return objectIds
        .map((objectId) => objectsById?.[objectId])
        .filter((element): element is TemplateElement => Boolean(element))
        .map(cloneElementSnapshot);
}
export function createTemplateModel({ documentName, unit, currentPaperPresetKey, pageWidthMm, pageHeightMm, marginTopMm, marginRightMm, marginBottomMm, marginLeftMm, pageBackground, pageCornerVisible, headerLineVisible, footerLineVisible, headerOffsetMm, footerOffsetMm, printMarksVisible, pages, pageObjectMap, objectsById, }: TemplateModelInput) {
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
        pages: pages.map((page) => {
            const { isCurrent, ...pageData } = page;
            return {
                ...pageData,
                elements: buildPageElements(page.id, pageObjectMap, objectsById),
            };
        }),
    };
}
export function createViewStateModel({ zoom, scrollLeft, scrollTop, viewportWidth, viewportHeight, guidesVisible, gridVisible, safeAreaVisible, pageOutlineVisible, snapEnabled, allowOverflowDrag, textQuickToolbarVisible, horizontalGuides, verticalGuides, }: ViewStateInput) {
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
export function createPreviewStateModel({ variables, sampleData, computedState, pagination, renderCache, }: PreviewStateInput) {
    return {
        variables: { ...(variables || {}) },
        sampleData: { ...(sampleData || {}) },
        computed: { ...(computedState || {}) },
        pagination: { ...(pagination || {}) },
        renderCache: { ...(renderCache || {}) },
    };
}
export function createPrintDesignerDocument({ template, viewState, previewState }: { template: UnknownRecord; viewState: UnknownRecord; previewState: UnknownRecord }) {
    return {
        template,
        viewState,
        previewState,
    };
}
