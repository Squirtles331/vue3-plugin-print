import { createViewStateModel } from '../documentModel.js'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4
const ZOOM_STEP = 0.1
type GuideOrientation = 'horizontal' | 'vertical'
interface ZoomAnchor { mode: 'center' | 'pointer', clientX: number, clientY: number, token: number }
type ZoomAnchorInput = Partial<Omit<ZoomAnchor, 'token'>>
interface GuideRef { orientation: GuideOrientation, position: number }
type GuideDraft = GuideRef & { displayPosition: number, visible: boolean, mode: 'create' | 'edit' }
interface GuideDrag { orientation: GuideOrientation, sourcePosition: number | null, mode: 'create' | 'edit' }
interface CoordinateReadout { source: 'idle' | 'pointer' | 'guide', x: number | null, y: number | null, insidePage: boolean, guideOrientation: GuideOrientation | null, guidePosition: number | null }
function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +value.toFixed(2)))
}
function normalizeGuidePosition(position: number): number {
  return +position.toFixed(2)
}
function normalizeCoordinateValue(value: number): number | null {
  return Number.isFinite(value) ? +value.toFixed(2) : null
}
function createGuideRef(orientation: GuideOrientation | undefined, position: number | null): GuideRef | null {
  if (!orientation || position === null || !Number.isFinite(position)) {
    return null
  }
  return {
    orientation,
    position: normalizeGuidePosition(position),
  }
}
export const useEditorViewportStore = defineStore('printDesignerViewport', () => {
  const zoom = ref(0.9)
  const zoomAnchor = ref<ZoomAnchor>({
    mode: 'center',
    clientX: 0,
    clientY: 0,
    token: 0,
  })
  const scrollLeft = ref(0)
  const scrollTop = ref(0)
  const viewportWidth = ref(0)
  const viewportHeight = ref(0)
  const guidesVisible = ref(true)
  const gridVisible = ref(true)
  const safeAreaVisible = ref(false)
  const snapEnabled = ref(true)
  const pageOutlineVisible = ref(true)
  const allowOverflowDrag = ref(false)
  const textQuickToolbarVisible = ref(false)
  const horizontalGuides = ref<number[]>([])
  const verticalGuides = ref<number[]>([])
  const hoveredGuide = ref<GuideRef | null>(null)
  const activeGuide = ref<GuideRef | null>(null)
  const draggingGuide = ref<GuideDrag | null>(null)
  const activeGuideDraft = ref<GuideDraft | null>(null)
  const coordinateReadout = ref<CoordinateReadout>({
    source: 'idle',
    x: null,
    y: null,
    insidePage: false,
    guideOrientation: null,
    guidePosition: null,
  })
  const viewStateModel = computed(() => createViewStateModel({
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
  }))
  function updateZoomAnchor(anchor: ZoomAnchorInput = {}) {
    zoomAnchor.value = {
      mode: anchor.mode === 'pointer' ? 'pointer' : 'center',
      clientX: anchor.clientX ?? 0,
      clientY: anchor.clientY ?? 0,
      token: zoomAnchor.value.token + 1,
    }
  }
  function setZoom(nextZoom: number, anchor?: ZoomAnchorInput) {
    updateZoomAnchor(anchor)
    zoom.value = clampZoom(nextZoom)
  }
  function zoomIn(anchor?: ZoomAnchorInput) {
    setZoom(zoom.value + ZOOM_STEP, anchor)
  }
  function zoomOut(anchor?: ZoomAnchorInput) {
    setZoom(zoom.value - ZOOM_STEP, anchor)
  }
  function resetZoom(anchor?: ZoomAnchorInput) {
    setZoom(1, anchor)
  }
  function setScroll(left: number, top: number) {
    scrollLeft.value = left
    scrollTop.value = top
  }
  function setViewportSize(width: number, height: number) {
    viewportWidth.value = Math.max(0, Math.round(width || 0))
    viewportHeight.value = Math.max(0, Math.round(height || 0))
  }
  function toggleGuides() {
    guidesVisible.value = !guidesVisible.value
  }
  function toggleGrid() {
    gridVisible.value = !gridVisible.value
  }
  function toggleSnap() {
    snapEnabled.value = !snapEnabled.value
  }
  function toggleSafeArea() {
    safeAreaVisible.value = !safeAreaVisible.value
  }
  function togglePageOutline() {
    pageOutlineVisible.value = !pageOutlineVisible.value
  }
  function toggleAllowOverflowDrag() {
    allowOverflowDrag.value = !allowOverflowDrag.value
  }
  function toggleTextQuickToolbar() {
    textQuickToolbarVisible.value = !textQuickToolbarVisible.value
  }
  function startGuideDraft(orientation: GuideOrientation) {
    startGuideInteraction(orientation, null)
  }
  function startGuideInteraction(orientation: GuideOrientation, sourcePosition: number | null = null) {
    const guideRef = createGuideRef(orientation, sourcePosition)
    draggingGuide.value = {
      orientation,
      sourcePosition: guideRef?.position ?? null,
      mode: guideRef ? 'edit' : 'create',
    }
    activeGuide.value = guideRef
    activeGuideDraft.value = {
      orientation,
      position: guideRef?.position ?? 0,
      displayPosition: guideRef?.position ?? 0,
      visible: !!guideRef,
      mode: guideRef ? 'edit' : 'create',
    }
  }
  function updateGuideDraft(position: number, visible: boolean, displayPosition = position) {
    if (!activeGuideDraft.value) {
      return
    }
    activeGuideDraft.value = {
      ...activeGuideDraft.value,
      position: normalizeGuidePosition(position),
      displayPosition: normalizeGuidePosition(displayPosition),
      visible,
    }
    activeGuide.value = visible
      ? createGuideRef(activeGuideDraft.value.orientation, activeGuideDraft.value.position)
      : null
  }
  function finishGuideInteraction(position: number, visible = true) {
    activeGuide.value
      = visible && Number.isFinite(position)
        ? createGuideRef(activeGuideDraft.value?.orientation || draggingGuide.value?.orientation, position)
        : null
    clearGuideDraft()
  }
  function clearGuideDraft() {
    activeGuideDraft.value = null
    draggingGuide.value = null
  }
  function setHoveredGuide(orientation: GuideOrientation, position: number) {
    hoveredGuide.value = createGuideRef(orientation, position)
  }
  function clearHoveredGuide() {
    hoveredGuide.value = null
  }
  function setActiveGuide(orientation: GuideOrientation, position: number) {
    activeGuide.value = createGuideRef(orientation, position)
  }
  function clearActiveGuide() {
    activeGuide.value = null
  }
  function addGuide(orientation: GuideOrientation, position: number) {
    const target = orientation === 'vertical' ? verticalGuides : horizontalGuides
    const normalized = normalizeGuidePosition(position)
    if (target.value.includes(normalized)) {
      return
    }
    target.value = [...target.value, normalized].sort((a, b) => a - b)
  }
  function removeGuide(orientation: GuideOrientation, position: number) {
    const target = orientation === 'vertical' ? verticalGuides : horizontalGuides
    const normalized = normalizeGuidePosition(position)
    target.value = target.value.filter(item => item !== normalized)
  }
  function moveGuide(orientation: GuideOrientation, fromPosition: number, toPosition: number) {
    const normalizedFrom = normalizeGuidePosition(fromPosition)
    const normalizedTo = normalizeGuidePosition(toPosition)
    if (normalizedFrom === normalizedTo) {
      return
    }
    removeGuide(orientation, normalizedFrom)
    addGuide(orientation, normalizedTo)
  }
  function setPointerCoordinate(x: number, y: number, insidePage: boolean) {
    coordinateReadout.value = {
      source: 'pointer',
      x: normalizeCoordinateValue(x),
      y: normalizeCoordinateValue(y),
      insidePage: !!insidePage,
      guideOrientation: null,
      guidePosition: null,
    }
  }
  function setGuideCoordinate(orientation: GuideOrientation, position: number, visible: boolean) {
    const normalizedPosition = normalizeCoordinateValue(position)
    coordinateReadout.value = {
      source: 'guide',
      x: orientation === 'vertical' && visible ? normalizedPosition : null,
      y: orientation === 'horizontal' && visible ? normalizedPosition : null,
      insidePage: !!visible,
      guideOrientation: orientation,
      guidePosition: visible ? normalizedPosition : null,
    }
  }
  function clearCoordinateReadout() {
    coordinateReadout.value = {
      source: 'idle',
      x: null,
      y: null,
      insidePage: false,
      guideOrientation: null,
      guidePosition: null,
    }
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
  }
})
