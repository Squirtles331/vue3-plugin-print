import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { createViewStateModel } from "../documentModel.js";
const MIN_ZOOM = 0.2 as any;
const MAX_ZOOM = 4 as any;
const ZOOM_STEP = 0.1 as any;
function clampZoom(value: any): any {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +value.toFixed(2)));
}
function normalizeGuidePosition(position: any): any {
    return +position.toFixed(2);
}
function normalizeCoordinateValue(value: any): any {
    return Number.isFinite(value) ? +value.toFixed(2) : null;
}
function createGuideRef(orientation: any, position: any): any {
    if (!orientation || !Number.isFinite(position)) {
        return null;
    }
    return {
        orientation,
        position: normalizeGuidePosition(position),
    };
}
export const useEditorViewportStore = defineStore("printDesignerViewport", (): any => {
    const zoom = ref(0.9) as any;
    const zoomAnchor = ref({
        mode: "center",
        clientX: 0,
        clientY: 0,
        token: 0,
    }) as any;
    const scrollLeft = ref(0) as any;
    const scrollTop = ref(0) as any;
    const viewportWidth = ref(0) as any;
    const viewportHeight = ref(0) as any;
    const guidesVisible = ref(true) as any;
    const gridVisible = ref(true) as any;
    const safeAreaVisible = ref(false) as any;
    const snapEnabled = ref(true) as any;
    const pageOutlineVisible = ref(true) as any;
    const allowOverflowDrag = ref(false) as any;
    const textQuickToolbarVisible = ref(false) as any;
    const horizontalGuides = ref([]) as any;
    const verticalGuides = ref([]) as any;
    const hoveredGuide = ref(null) as any;
    const activeGuide = ref(null) as any;
    const draggingGuide = ref(null) as any;
    const activeGuideDraft = ref(null) as any;
    const coordinateReadout = ref({
        source: "idle",
        x: null,
        y: null,
        insidePage: false,
        guideOrientation: null,
        guidePosition: null,
    }) as any;
    const viewStateModel = computed((): any => createViewStateModel({
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
    })) as any;
    function updateZoomAnchor(anchor: any = {}): any {
        zoomAnchor.value = {
            mode: anchor.mode || "center",
            clientX: anchor.clientX || 0,
            clientY: anchor.clientY || 0,
            token: zoomAnchor.value.token + 1,
        };
    }
    function setZoom(nextZoom: any, anchor: any): any {
        updateZoomAnchor(anchor);
        zoom.value = clampZoom(nextZoom);
    }
    function zoomIn(anchor: any): any {
        setZoom(zoom.value + ZOOM_STEP, anchor);
    }
    function zoomOut(anchor: any): any {
        setZoom(zoom.value - ZOOM_STEP, anchor);
    }
    function resetZoom(anchor: any): any {
        setZoom(1, anchor);
    }
    function setScroll(left: any, top: any): any {
        scrollLeft.value = left;
        scrollTop.value = top;
    }
    function setViewportSize(width: any, height: any): any {
        viewportWidth.value = Math.max(0, Math.round(width || 0));
        viewportHeight.value = Math.max(0, Math.round(height || 0));
    }
    function toggleGuides(): any {
        guidesVisible.value = !guidesVisible.value;
    }
    function toggleGrid(): any {
        gridVisible.value = !gridVisible.value;
    }
    function toggleSnap(): any {
        snapEnabled.value = !snapEnabled.value;
    }
    function toggleSafeArea(): any {
        safeAreaVisible.value = !safeAreaVisible.value;
    }
    function togglePageOutline(): any {
        pageOutlineVisible.value = !pageOutlineVisible.value;
    }
    function toggleAllowOverflowDrag(): any {
        allowOverflowDrag.value = !allowOverflowDrag.value;
    }
    function toggleTextQuickToolbar(): any {
        textQuickToolbarVisible.value = !textQuickToolbarVisible.value;
    }
    function startGuideDraft(orientation: any): any {
        startGuideInteraction(orientation, null);
    }
    function startGuideInteraction(orientation: any, sourcePosition: any = null): any {
        const guideRef = createGuideRef(orientation, sourcePosition) as any;
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
    function updateGuideDraft(position: any, visible: any, displayPosition: any = position): any {
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
    function finishGuideInteraction(position: any, visible: any = true): any {
        activeGuide.value =
            visible && Number.isFinite(position)
                ? createGuideRef(activeGuideDraft.value?.orientation || draggingGuide.value?.orientation, position)
                : null;
        clearGuideDraft();
    }
    function clearGuideDraft(): any {
        activeGuideDraft.value = null;
        draggingGuide.value = null;
    }
    function setHoveredGuide(orientation: any, position: any): any {
        hoveredGuide.value = createGuideRef(orientation, position);
    }
    function clearHoveredGuide(): any {
        hoveredGuide.value = null;
    }
    function setActiveGuide(orientation: any, position: any): any {
        activeGuide.value = createGuideRef(orientation, position);
    }
    function clearActiveGuide(): any {
        activeGuide.value = null;
    }
    function addGuide(orientation: any, position: any): any {
        const target = orientation === "vertical" ? verticalGuides : horizontalGuides as any;
        const normalized = normalizeGuidePosition(position) as any;
        if (target.value.includes(normalized)) {
            return;
        }
        target.value = [...target.value, normalized].sort((a: any, b: any): any => a - b);
    }
    function removeGuide(orientation: any, position: any): any {
        const target = orientation === "vertical" ? verticalGuides : horizontalGuides as any;
        const normalized = normalizeGuidePosition(position) as any;
        target.value = target.value.filter((item: any): any => item !== normalized);
    }
    function moveGuide(orientation: any, fromPosition: any, toPosition: any): any {
        const normalizedFrom = normalizeGuidePosition(fromPosition) as any;
        const normalizedTo = normalizeGuidePosition(toPosition) as any;
        if (normalizedFrom === normalizedTo) {
            return;
        }
        removeGuide(orientation, normalizedFrom);
        addGuide(orientation, normalizedTo);
    }
    function setPointerCoordinate(x: any, y: any, insidePage: any): any {
        coordinateReadout.value = {
            source: "pointer",
            x: normalizeCoordinateValue(x),
            y: normalizeCoordinateValue(y),
            insidePage: !!insidePage,
            guideOrientation: null,
            guidePosition: null,
        };
    }
    function setGuideCoordinate(orientation: any, position: any, visible: any): any {
        const normalizedPosition = normalizeCoordinateValue(position) as any;
        coordinateReadout.value = {
            source: "guide",
            x: orientation === "vertical" && visible ? normalizedPosition : null,
            y: orientation === "horizontal" && visible ? normalizedPosition : null,
            insidePage: !!visible,
            guideOrientation: orientation,
            guidePosition: visible ? normalizedPosition : null,
        };
    }
    function clearCoordinateReadout(): any {
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
}) as any;
