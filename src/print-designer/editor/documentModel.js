function cloneElementSnapshot(element) {
  return {
    ...element,
    style: element?.style ? { ...element.style } : {},
  };
}

function buildPageElements(pageId, pageObjectMap, objectsById) {
  const objectIds = pageObjectMap?.[pageId] || [];

  return objectIds
    .map((objectId) => objectsById?.[objectId])
    .filter(Boolean)
    .map(cloneElementSnapshot);
}

export function createTemplateModel({
  documentName,
  unit,
  currentPaperPresetKey,
  pageWidthMm,
  pageHeightMm,
  marginTopMm,
  marginRightMm,
  marginBottomMm,
  marginLeftMm,
  pageBackground,
  pageCornerVisible,
  headerLineVisible,
  footerLineVisible,
  headerOffsetMm,
  footerOffsetMm,
  printMarksVisible,
  pages,
  pageObjectMap,
  objectsById,
}) {
  return {
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
    pages: (pages || []).map((page) => ({
      ...page,
      elements: buildPageElements(page.id, pageObjectMap, objectsById),
    })),
  };
}

export function createViewStateModel({
  zoom,
  scrollLeft,
  scrollTop,
  viewportWidth,
  viewportHeight,
  guidesVisible,
  gridVisible,
  safeAreaVisible,
  pageOutlineVisible,
  snapEnabled,
  allowOverflowDrag,
  textQuickToolbarVisible,
  horizontalGuides,
  verticalGuides,
}) {
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

export function createPreviewStateModel({
  variables,
  sampleData,
  computedState,
  pagination,
  renderCache,
}) {
  return {
    variables: { ...(variables || {}) },
    sampleData: { ...(sampleData || {}) },
    computed: { ...(computedState || {}) },
    pagination: { ...(pagination || {}) },
    renderCache: { ...(renderCache || {}) },
  };
}

export function createPrintDesignerDocument({ template, viewState, previewState }) {
  return {
    template,
    viewState,
    previewState,
  };
}
