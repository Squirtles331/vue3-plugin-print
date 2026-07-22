import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { createViewStateModel } from "../documentModel.js";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +value.toFixed(2)));
}

function normalizeGuidePosition(position) {
  return +position.toFixed(2);
}

function normalizeCoordinateValue(value) {
  return Number.isFinite(value) ? +value.toFixed(2) : null;
}

function createGuideRef(orientation, position) {
  if (!orientation || !Number.isFinite(position)) {
    return null;
  }

  return {
    orientation,
    position: normalizeGuidePosition(position),
  };
}

export const useEditorViewportStore = defineStore("printDesignerViewport", () => {
  const zoom = ref(0.9);
  const zoomAnchor = ref({
    mode: "center",
    clientX: 0,
    clientY: 0,
    token: 0,
  });
  const scrollLeft = ref(0);
  const scrollTop = ref(0);
  const viewportWidth = ref(0);
  const viewportHeight = ref(0);
  const guidesVisible = ref(true);
  const gridVisible = ref(true);
  const safeAreaVisible = ref(false);
  const snapEnabled = ref(true);
  const pageOutlineVisible = ref(true);
  const allowOverflowDrag = ref(false);
  const textQuickToolbarVisible = ref(false);
  const horizontalGuides = ref([]);
  const verticalGuides = ref([]);
  const hoveredGuide = ref(null);
  const activeGuide = ref(null);
  const draggingGuide = ref(null);
  const activeGuideDraft = ref(null);
  const coordinateReadout = ref({
    source: "idle",
    x: null,
    y: null,
    insidePage: false,
    guideOrientation: null,
    guidePosition: null,
  });
  const viewStateModel = computed(() =>
    createViewStateModel({
      zoom: zoom.value,
      scrollLeft: scrollLeft.value,
      scrollTop: scrollTop.value,
      viewportWidth: viewportWidth.value,
      viewportHeight: viewportHeight.value,
      guidesVisible: guidesVisible.value,
      gridVisible: gridVisible.value,
      safeAreaVisible: safeAreaVisible.value,
      pageOutlineVisible: pageOutlineVisible.value,
      snapEnabled: snapEnabled.value,
      allowOverflowDrag: allowOverflowDrag.value,
      textQuickToolbarVisible: textQuickToolbarVisible.value,
      horizontalGuides: horizontalGuides.value,
      verticalGuides: verticalGuides.value,
    })
  );

  function updateZoomAnchor(anchor = {}) {
    zoomAnchor.value = {
      mode: anchor.mode || "center",
      clientX: anchor.clientX || 0,
      clientY: anchor.clientY || 0,
      token: zoomAnchor.value.token + 1,
    };
  }

  function setZoom(nextZoom, anchor) {
    updateZoomAnchor(anchor);
    zoom.value = clampZoom(nextZoom);
  }

  function zoomIn(anchor) {
    setZoom(zoom.value + ZOOM_STEP, anchor);
  }

  function zoomOut(anchor) {
    setZoom(zoom.value - ZOOM_STEP, anchor);
  }

  function resetZoom(anchor) {
    setZoom(1, anchor);
  }

  function setScroll(left, top) {
    scrollLeft.value = left;
    scrollTop.value = top;
  }

  function setViewportSize(width, height) {
    viewportWidth.value = Math.max(0, Math.round(width || 0));
    viewportHeight.value = Math.max(0, Math.round(height || 0));
  }

  function toggleGuides() {
    guidesVisible.value = !guidesVisible.value;
  }

  function toggleGrid() {
    gridVisible.value = !gridVisible.value;
  }

  function toggleSnap() {
    snapEnabled.value = !snapEnabled.value;
  }

  function toggleSafeArea() {
    safeAreaVisible.value = !safeAreaVisible.value;
  }

  function togglePageOutline() {
    pageOutlineVisible.value = !pageOutlineVisible.value;
  }

  function toggleAllowOverflowDrag() {
    allowOverflowDrag.value = !allowOverflowDrag.value;
  }

  function toggleTextQuickToolbar() {
    textQuickToolbarVisible.value = !textQuickToolbarVisible.value;
  }

  function startGuideDraft(orientation) {
    startGuideInteraction(orientation, null);
  }

  function startGuideInteraction(orientation, sourcePosition = null) {
    const guideRef = createGuideRef(orientation, sourcePosition);

    draggingGuide.value = {
      orientation,
      sourcePosition: guideRef?.position ?? null,
      mode: guideRef ? "edit" : "create",
    };
    activeGuide.value = guideRef;
    activeGuideDraft.value = {
      orientation,
      position: guideRef?.position ?? 0,
      displayPosition: guideRef?.position ?? 0,
      visible: !!guideRef,
      mode: guideRef ? "edit" : "create",
    };
  }

  function updateGuideDraft(position, visible, displayPosition = position) {
    if (!activeGuideDraft.value) {
      return;
    }

    activeGuideDraft.value = {
      ...activeGuideDraft.value,
      position: normalizeGuidePosition(position),
      displayPosition: normalizeGuidePosition(displayPosition),
      visible,
    };

    activeGuide.value = visible
      ? createGuideRef(activeGuideDraft.value.orientation, activeGuideDraft.value.position)
      : null;
  }

  function finishGuideInteraction(position, visible = true) {
    activeGuide.value =
      visible && Number.isFinite(position)
        ? createGuideRef(activeGuideDraft.value?.orientation || draggingGuide.value?.orientation, position)
        : null;
    clearGuideDraft();
  }

  function clearGuideDraft() {
    activeGuideDraft.value = null;
    draggingGuide.value = null;
  }

  function setHoveredGuide(orientation, position) {
    hoveredGuide.value = createGuideRef(orientation, position);
  }

  function clearHoveredGuide() {
    hoveredGuide.value = null;
  }

  function setActiveGuide(orientation, position) {
    activeGuide.value = createGuideRef(orientation, position);
  }

  function clearActiveGuide() {
    activeGuide.value = null;
  }

  function addGuide(orientation, position) {
    const target = orientation === "vertical" ? verticalGuides : horizontalGuides;
    const normalized = normalizeGuidePosition(position);

    if (target.value.includes(normalized)) {
      return;
    }

    target.value = [...target.value, normalized].sort((a, b) => a - b);
  }

  function removeGuide(orientation, position) {
    const target = orientation === "vertical" ? verticalGuides : horizontalGuides;
    const normalized = normalizeGuidePosition(position);
    target.value = target.value.filter((item) => item !== normalized);
  }

  function moveGuide(orientation, fromPosition, toPosition) {
    const normalizedFrom = normalizeGuidePosition(fromPosition);
    const normalizedTo = normalizeGuidePosition(toPosition);

    if (normalizedFrom === normalizedTo) {
      return;
    }

    removeGuide(orientation, normalizedFrom);
    addGuide(orientation, normalizedTo);
  }

  function setPointerCoordinate(x, y, insidePage) {
    coordinateReadout.value = {
      source: "pointer",
      x: normalizeCoordinateValue(x),
      y: normalizeCoordinateValue(y),
      insidePage: !!insidePage,
      guideOrientation: null,
      guidePosition: null,
    };
  }

  function setGuideCoordinate(orientation, position, visible) {
    const normalizedPosition = normalizeCoordinateValue(position);

    coordinateReadout.value = {
      source: "guide",
      x: orientation === "vertical" && visible ? normalizedPosition : null,
      y: orientation === "horizontal" && visible ? normalizedPosition : null,
      insidePage: !!visible,
      guideOrientation: orientation,
      guidePosition: visible ? normalizedPosition : null,
    };
  }

  function clearCoordinateReadout() {
    coordinateReadout.value = {
      source: "idle",
      x: null,
      y: null,
      insidePage: false,
      guideOrientation: null,
      guidePosition: null,
    };
  }

  return {
    zoom,
    zoomAnchor,
    scrollLeft,
    scrollTop,
    viewportWidth,
    viewportHeight,
    guidesVisible,
    gridVisible,
    safeAreaVisible,
    snapEnabled,
    pageOutlineVisible,
    allowOverflowDrag,
    textQuickToolbarVisible,
    horizontalGuides,
    verticalGuides,
    hoveredGuide,
    activeGuide,
    draggingGuide,
    activeGuideDraft,
    coordinateReadout,
    viewStateModel,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    zoomStep: ZOOM_STEP,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setScroll,
    setViewportSize,
    toggleGuides,
    toggleGrid,
    toggleSafeArea,
    toggleSnap,
    togglePageOutline,
    toggleAllowOverflowDrag,
    toggleTextQuickToolbar,
    startGuideDraft,
    startGuideInteraction,
    updateGuideDraft,
    finishGuideInteraction,
    clearGuideDraft,
    setHoveredGuide,
    clearHoveredGuide,
    setActiveGuide,
    clearActiveGuide,
    addGuide,
    removeGuide,
    moveGuide,
    setPointerCoordinate,
    setGuideCoordinate,
    clearCoordinateReadout,
  };
});
