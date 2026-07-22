<template>
  <main class="workspace-root">
    <div class="workspace-root__chrome">
      <div class="workspace-root__corner">
        <span class="workspace-root__origin-dot"></span>
      </div>

      <DesignerRuler
        class="workspace-root__ruler workspace-root__ruler--x"
        orientation="horizontal"
        :axis-length-px="projection.x.axisLengthPx"
        :origin-px="projection.x.originPx"
        :pixels-per-unit="projection.pixelsPerUnit"
        :visible-start-unit="projection.x.visibleStartUnit"
        :visible-end-unit="projection.x.visibleEndUnit"
        :page-start-unit="projection.x.pageStartUnit"
        :page-end-unit="projection.x.pageEndUnit"
        @guide-start="startGuideDrag('vertical', $event)"
      />

      <DesignerRuler
        class="workspace-root__ruler workspace-root__ruler--y"
        orientation="vertical"
        :axis-length-px="projection.y.axisLengthPx"
        :origin-px="projection.y.originPx"
        :pixels-per-unit="projection.pixelsPerUnit"
        :visible-start-unit="projection.y.visibleStartUnit"
        :visible-end-unit="projection.y.visibleEndUnit"
        :page-start-unit="projection.y.pageStartUnit"
        :page-end-unit="projection.y.pageEndUnit"
        @guide-start="startGuideDrag('horizontal', $event)"
      />

      <div class="workspace-root__viewport-frame" @pointermove="onViewportPointerMove" @pointerleave="onViewportPointerLeave">
        <div
          ref="viewportRef"
          class="workspace-root__viewport"
          @pointerdown="onViewportPointerDown"
          @scroll="onViewportScroll"
          @dragover="onViewportDragOver"
          @drop="onViewportDrop"
        >
          <DesignerCanvasViewport
            ref="canvasViewportRef"
            :zoom="zoom"
            :scaled-paper-width="scaledPaperWidth"
            :scaled-paper-height="scaledPaperHeight"
            :page-width-px="pageWidthPx"
            :page-height-px="pageHeightPx"
            :page-pixels-per-unit="pagePixelsPerUnit"
          />
        </div>

        <div class="workspace-root__guide-overlay">
          <div
            v-for="guide in renderedVerticalGuides"
            :key="`v-${guide}`"
            class="workspace-root__guide workspace-root__guide--vertical"
            :class="guideClasses('vertical', guide)"
            :style="{ left: `${guideToViewportX(guide)}px` }"
            @pointerenter="onGuideHover({ orientation: 'vertical', position: guide })"
            @pointerleave="onGuideHover()"
            @pointerdown="onGuideEditStart({ orientation: 'vertical', position: guide, event: $event })"
          ></div>
          <div
            v-for="guide in renderedHorizontalGuides"
            :key="`h-${guide}`"
            class="workspace-root__guide workspace-root__guide--horizontal"
            :class="guideClasses('horizontal', guide)"
            :style="{ top: `${guideToViewportY(guide)}px` }"
            @pointerenter="onGuideHover({ orientation: 'horizontal', position: guide })"
            @pointerleave="onGuideHover()"
            @pointerdown="onGuideEditStart({ orientation: 'horizontal', position: guide, event: $event })"
          ></div>

          <div
            v-if="visibleGuideDraft?.orientation === 'vertical'"
            class="workspace-root__guide workspace-root__guide--vertical is-draft"
            :class="{ 'is-invalid': !visibleGuideDraft.visible }"
            :style="{ left: `${guideToViewportX(visibleGuideDraft.displayPosition ?? visibleGuideDraft.position)}px` }"
          ></div>
          <div
            v-if="visibleGuideDraft?.orientation === 'horizontal'"
            class="workspace-root__guide workspace-root__guide--horizontal is-draft"
            :class="{ 'is-invalid': !visibleGuideDraft.visible }"
            :style="{ top: `${guideToViewportY(visibleGuideDraft.displayPosition ?? visibleGuideDraft.position)}px` }"
          ></div>

          <div
            v-if="visibleGuideFeedback"
            class="workspace-root__guide-chip"
            :class="{
              'workspace-root__guide-chip--vertical': visibleGuideFeedback.orientation === 'vertical',
              'workspace-root__guide-chip--horizontal': visibleGuideFeedback.orientation === 'horizontal',
              'is-invalid': !visibleGuideFeedback.visible,
            }"
            :style="guideFeedbackStyle"
          >
            {{ guideFeedbackLabel }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { createElement } from "../../core/elementFactory.js";
import { createAddObjectCommand } from "../commands/documentCommands.js";
import { executeEditorCommand } from "../commands/executeCommand";
import { createAddGuideCommand, createMoveGuideCommand, createRemoveGuideCommand } from "../commands/guideCommands";
import { useEditorDragStore } from "../stores/dragStore";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
import { useEditorViewportStore } from "../stores/viewportStore";
import { createWorkspaceProjection, getPixelsPerUnit } from "./workspaceProjection.js";
import DesignerCanvasViewport from "../../components/layout/DesignerCanvasViewport.vue";
import DesignerRuler from "../../components/layout/DesignerRuler.vue";

const viewportStore = useEditorViewportStore();
const historyStore = useEditorHistoryStore();
const documentStore = useEditorDocumentStore();
const selectionStore = useEditorSelectionStore();
const dragStore = useEditorDragStore();

const {
  zoom,
  zoomAnchor,
  scrollLeft,
  scrollTop,
  viewportWidth,
  viewportHeight,
  guidesVisible,
  horizontalGuides,
  verticalGuides,
  hoveredGuide,
  activeGuide,
  draggingGuide,
  activeGuideDraft,
} = storeToRefs(viewportStore);
const { currentPage, unit, pageWidthMm, pageHeightMm, pageWidthPx, pageHeightPx } =
  storeToRefs(documentStore);

const viewportRef = ref(null);
const canvasViewportRef = ref(null);
const paperOffsetLeft = ref(0);
const paperOffsetTop = ref(0);
let viewportResizeObserver = null;

const scaledPaperWidth = computed(() => Math.round(pageWidthPx.value * zoom.value));
const scaledPaperHeight = computed(() => Math.round(pageHeightPx.value * zoom.value));
const pagePixelsPerUnit = computed(() => getPixelsPerUnit(unit.value, 1));
const visibleVerticalGuides = computed(() => (guidesVisible.value ? verticalGuides.value : []));
const visibleHorizontalGuides = computed(() => (guidesVisible.value ? horizontalGuides.value : []));
const visibleGuideDraft = computed(() => (guidesVisible.value ? activeGuideDraft.value : null));
const visibleHoveredGuide = computed(() => (guidesVisible.value ? hoveredGuide.value : null));
const visibleActiveGuide = computed(() => (guidesVisible.value ? activeGuide.value : null));
const projection = computed(() =>
  createWorkspaceProjection({
    unit: unit.value,
    zoom: zoom.value,
    viewportWidth: viewportWidth.value,
    viewportHeight: viewportHeight.value,
    scrollLeft: scrollLeft.value,
    scrollTop: scrollTop.value,
    pageOffsetLeft: paperOffsetLeft.value,
    pageOffsetTop: paperOffsetTop.value,
    pageWidthMm: pageWidthMm.value,
    pageHeightMm: pageHeightMm.value,
  })
);
const renderedVerticalGuides = computed(() => {
  if (!guidesVisible.value) {
    return [];
  }

  if (draggingGuide.value?.orientation !== "vertical" || draggingGuide.value.sourcePosition === null) {
    return visibleVerticalGuides.value;
  }

  return visibleVerticalGuides.value.filter((guide) => guide !== draggingGuide.value.sourcePosition);
});
const renderedHorizontalGuides = computed(() => {
  if (!guidesVisible.value) {
    return [];
  }

  if (draggingGuide.value?.orientation !== "horizontal" || draggingGuide.value.sourcePosition === null) {
    return visibleHorizontalGuides.value;
  }

  return visibleHorizontalGuides.value.filter((guide) => guide !== draggingGuide.value.sourcePosition);
});
const visibleGuideFeedback = computed(() => {
  if (!guidesVisible.value || !visibleGuideDraft.value) {
    return null;
  }

  return {
    orientation: visibleGuideDraft.value.orientation,
    position: visibleGuideDraft.value.position,
    displayPosition: visibleGuideDraft.value.displayPosition ?? visibleGuideDraft.value.position,
    visible: visibleGuideDraft.value.visible,
  };
});
const guideFeedbackLabel = computed(() => {
  if (!visibleGuideFeedback.value) {
    return "";
  }

  const axis = visibleGuideFeedback.value.orientation === "vertical" ? "X" : "Y";
  return `${axis}: ${visibleGuideFeedback.value.position.toFixed(2)} mm`;
});
const guideFeedbackStyle = computed(() => {
  if (!visibleGuideFeedback.value) {
    return {};
  }

  const guide = visibleGuideFeedback.value;

  if (guide.orientation === "vertical") {
    return {
      left: `${guideToViewportX(guide.position)}px`,
      top: "6px",
    };
  }

  return {
    left: "6px",
    top: `${guideToViewportY(guide.position)}px`,
  };
});

function getPageStackShellElement() {
  return canvasViewportRef.value?.getPageStackShellElement?.() || null;
}

function getViewportLocalPoint(event) {
  const viewport = viewportRef.value;

  if (!viewport) {
    return null;
  }

  const viewportRect = viewport.getBoundingClientRect();

  return {
    x: event.clientX - viewportRect.left,
    y: event.clientY - viewportRect.top,
  };
}

function getDocumentPoint(event) {
  const localPoint = getViewportLocalPoint(event);

  if (!localPoint) {
    return null;
  }

  const documentX = projection.value.screenToDocumentX(localPoint.x);
  const documentY = projection.value.screenToDocumentY(localPoint.y);
  const insidePage =
    documentX >= 0 && documentX <= pageWidthMm.value && documentY >= 0 && documentY <= pageHeightMm.value;

  return {
    localX: localPoint.x,
    localY: localPoint.y,
    documentX,
    documentY,
    insidePage,
  };
}

function roundMm(value) {
  return Number.isFinite(value) ? +value.toFixed(2) : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampInsertPosition(position, size, pageSize) {
  if (viewportStore.allowOverflowDrag) {
    return roundMm(position);
  }

  return clamp(roundMm(position), 0, Math.max(0, roundMm(pageSize - size)));
}

function guideToViewportX(position) {
  return Math.round(projection.value.documentToScreenX(position || 0));
}

function guideToViewportY(position) {
  return Math.round(projection.value.documentToScreenY(position || 0));
}

function isSameGuide(guideRef, orientation, position) {
  return guideRef?.orientation === orientation && guideRef?.position === position;
}

function guideClasses(orientation, position) {
  return {
    "is-hovered": isSameGuide(visibleHoveredGuide.value, orientation, position),
    "is-active": isSameGuide(visibleActiveGuide.value, orientation, position),
  };
}

function updateViewportMetrics() {
  const viewport = viewportRef.value;
  const paper = getPageStackShellElement();

  if (!viewport || !paper) {
    return;
  }

  const viewportRect = viewport.getBoundingClientRect();
  const paperRect = paper.getBoundingClientRect();

  viewportStore.setViewportSize(viewport.clientWidth, viewport.clientHeight);
  paperOffsetLeft.value = Math.round(paperRect.left - viewportRect.left + viewport.scrollLeft);
  paperOffsetTop.value = Math.round(paperRect.top - viewportRect.top + viewport.scrollTop);
}

function clampViewportScrollLeft(viewport, value) {
  const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  return Math.min(maxScrollLeft, Math.max(0, Math.round(value)));
}

function clampViewportScrollTop(viewport, value) {
  const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  return Math.min(maxScrollTop, Math.max(0, Math.round(value)));
}

function applyViewportScroll(left, top) {
  const viewport = viewportRef.value;

  if (!viewport) {
    return;
  }

  viewport.scrollLeft = clampViewportScrollLeft(viewport, left);
  viewport.scrollTop = clampViewportScrollTop(viewport, top);
  viewportStore.setScroll(viewport.scrollLeft, viewport.scrollTop);
}

function resolveZoomAnchorPoint() {
  const viewport = viewportRef.value;

  if (!viewport) {
    return null;
  }

  const viewportRect = viewport.getBoundingClientRect();
  const anchor = zoomAnchor.value || {};
  const usePointerAnchor =
    anchor.mode === "pointer" &&
    anchor.clientX >= viewportRect.left &&
    anchor.clientX <= viewportRect.right &&
    anchor.clientY >= viewportRect.top &&
    anchor.clientY <= viewportRect.bottom;

  if (!usePointerAnchor) {
    return {
      localX: viewport.clientWidth / 2,
      localY: viewport.clientHeight / 2,
    };
  }

  return {
    localX: Math.min(viewport.clientWidth, Math.max(0, anchor.clientX - viewportRect.left)),
    localY: Math.min(viewport.clientHeight, Math.max(0, anchor.clientY - viewportRect.top)),
  };
}

function onViewportScroll(event) {
  viewportStore.setScroll(event.target.scrollLeft, event.target.scrollTop);
  updateViewportMetrics();
}

function onViewportPointerDown(event) {
  const target = event.target;

  if (!(target instanceof Element)) {
    selectionStore.clearSelection();
    selectionStore.hoverObjectId = null;
    return;
  }

  if (
    target.closest(".paper-canvas__object") ||
    target.closest(".workspace-root__guide") ||
    target.closest(".designer-ruler")
  ) {
    return;
  }

  selectionStore.clearSelection();
  selectionStore.hoverObjectId = null;
}

function onViewportDragOver(event) {
  if (!dragStore.isPaletteDragging) {
    return;
  }

  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }

  syncPointerCoordinate(event);
}

function onViewportDrop(event) {
  const payload = dragStore.activePaletteItem;

  if (!payload) {
    return;
  }

  event.preventDefault();

  const point = getDocumentPoint(event);

  if (!point?.insidePage) {
    dragStore.clearPaletteDrag();
    viewportStore.clearCoordinateReadout();
    return;
  }

  const pageId = currentPage.value?.id || "page-1";
  const nextObject = createElement(payload.type, {
    pageId,
  });

  nextObject.x = clampInsertPosition(point.documentX, nextObject.width, pageWidthMm.value);
  nextObject.y = clampInsertPosition(point.documentY, nextObject.height, pageHeightMm.value);

  executeEditorCommand(historyStore, createAddObjectCommand(documentStore, nextObject));
  selectionStore.select(nextObject.id);
  selectionStore.focusedPageId = pageId;
  selectionStore.hoverObjectId = null;
  dragStore.clearPaletteDrag();
  viewportStore.setPointerCoordinate(nextObject.x, nextObject.y, true);
}

function syncPointerCoordinate(event) {
  const point = getDocumentPoint(event);

  if (!point || !point.insidePage) {
    viewportStore.clearCoordinateReadout();
    return;
  }

  viewportStore.setPointerCoordinate(point.documentX, point.documentY, true);
}

function onViewportPointerMove(event) {
  if (activeGuideDraft.value) {
    return;
  }

  syncPointerCoordinate(event);
}

function onViewportPointerLeave() {
  if (!activeGuideDraft.value) {
    viewportStore.clearCoordinateReadout();
  }

  if (!draggingGuide.value) {
    viewportStore.clearHoveredGuide();
  }
}

watch(
  zoom,
  async (nextZoom, previousZoom) => {
    const viewport = viewportRef.value;

    if (!viewport || nextZoom === previousZoom) {
      return;
    }

    const anchorPoint = resolveZoomAnchorPoint();

    if (!anchorPoint) {
      return;
    }

    const anchorDocumentX = projection.value.screenToDocumentX(anchorPoint.localX);
    const anchorDocumentY = projection.value.screenToDocumentY(anchorPoint.localY);

    await nextTick();
    updateViewportMetrics();

    const nextAnchorLocalX = projection.value.documentToScreenX(anchorDocumentX);
    const nextAnchorLocalY = projection.value.documentToScreenY(anchorDocumentY);

    applyViewportScroll(
      viewport.scrollLeft + (nextAnchorLocalX - anchorPoint.localX),
      viewport.scrollTop + (nextAnchorLocalY - anchorPoint.localY)
    );
    updateViewportMetrics();
  }
);

watch([pageWidthPx, pageHeightPx], async () => {
  await nextTick();
  updateViewportMetrics();
});

function getGuideDraft(event, orientation) {
  const point = getDocumentPoint(event);

  if (!point) {
    return null;
  }

  const pageEnd = orientation === "vertical" ? pageWidthMm.value : pageHeightMm.value;
  const documentPosition =
    orientation === "vertical" ? point.documentX : point.documentY;
  const clampedPosition = Math.min(pageEnd, Math.max(0, documentPosition));

  return {
    position: +clampedPosition.toFixed(2),
    displayPosition: +documentPosition.toFixed(2),
    visible: documentPosition >= 0 && documentPosition <= pageEnd,
  };
}

function syncDraftPosition(event) {
  if (!activeGuideDraft.value) {
    return;
  }

  const draft = getGuideDraft(event, activeGuideDraft.value.orientation);

  if (!draft) {
    viewportStore.updateGuideDraft(0, false, 0);
    viewportStore.setGuideCoordinate(activeGuideDraft.value.orientation, 0, false);
    return;
  }

  viewportStore.updateGuideDraft(draft.position, draft.visible, draft.displayPosition);
  viewportStore.setGuideCoordinate(activeGuideDraft.value.orientation, draft.position, draft.visible);
}

function onGuidePointerMove(event) {
  syncDraftPosition(event);
}

function stopGuideDrag() {
  window.removeEventListener("pointermove", onGuidePointerMove);
  window.removeEventListener("pointerup", onGuidePointerUp);
}

function onGuidePointerUp(event) {
  syncDraftPosition(event);

  const draft = activeGuideDraft.value;
  const drag = draggingGuide.value;

  if (!draft || !drag) {
    viewportStore.clearGuideDraft();
    viewportStore.clearCoordinateReadout();
    stopGuideDrag();
    return;
  }

  if (drag.mode === "create") {
    if (draft.visible) {
      executeEditorCommand(historyStore, createAddGuideCommand(viewportStore, draft.orientation, draft.position));
      viewportStore.finishGuideInteraction(draft.position, true);
    } else {
      viewportStore.finishGuideInteraction(null, false);
    }
  } else if (!draft.visible) {
    executeEditorCommand(historyStore, createRemoveGuideCommand(viewportStore, drag.orientation, drag.sourcePosition));
    viewportStore.finishGuideInteraction(null, false);
  } else {
    const moveCommand = createMoveGuideCommand(
      viewportStore,
      drag.orientation,
      drag.sourcePosition,
      draft.position
    );

    if (moveCommand) {
      executeEditorCommand(historyStore, moveCommand);
    }

    viewportStore.finishGuideInteraction(draft.position, true);
  }

  syncPointerCoordinate(event);
  stopGuideDrag();
}

function startGuideDrag(orientation, event, sourcePosition = null) {
  if (event.button !== 0) {
    return;
  }

  event.preventDefault();
  viewportStore.startGuideInteraction(orientation, sourcePosition);
  syncDraftPosition(event);
  stopGuideDrag();
  window.addEventListener("pointermove", onGuidePointerMove);
  window.addEventListener("pointerup", onGuidePointerUp);
}

function onGuideEditStart(payload) {
  if (!payload?.event) {
    return;
  }

  startGuideDrag(payload.orientation, payload.event, payload.position);
}

function onGuideHover(guide) {
  if (draggingGuide.value) {
    return;
  }

  if (!guide) {
    viewportStore.clearHoveredGuide();
    return;
  }

  viewportStore.setHoveredGuide(guide.orientation, guide.position);
}

onMounted(async () => {
  await nextTick();

  const viewport = viewportRef.value;

  if (viewport) {
    applyViewportScroll(viewportStore.scrollLeft, viewportStore.scrollTop);
  }

  updateViewportMetrics();
  if (viewport) {
    viewportResizeObserver = new ResizeObserver(() => {
      updateViewportMetrics();
    });
    viewportResizeObserver.observe(viewport);
  }
  window.addEventListener("resize", updateViewportMetrics);
});

onBeforeUnmount(() => {
  dragStore.clearPaletteDrag();
  stopGuideDrag();
  viewportResizeObserver?.disconnect();
  window.removeEventListener("resize", updateViewportMetrics);
});
</script>

<style scoped lang="scss">
.workspace-root {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #eef1f5;
}

.workspace-root__chrome {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  grid-template-rows: 26px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.workspace-root__corner {
  position: relative;
  border-right: 1px solid #d9dee8;
  border-bottom: 1px solid #d9dee8;
  background: #fafbfd;
}

.workspace-root__corner::before,
.workspace-root__corner::after {
  content: "";
  position: absolute;
  background: #cbd5e1;
}

.workspace-root__corner::before {
  top: 50%;
  left: 6px;
  right: 6px;
  height: 1px;
}

.workspace-root__corner::after {
  left: 50%;
  top: 6px;
  bottom: 6px;
  width: 1px;
}

.workspace-root__origin-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #94a3b8;
  transform: translate(-50%, -50%);
}

.workspace-root__ruler--x {
  grid-column: 2;
}

.workspace-root__ruler--y {
  grid-row: 2;
}

.workspace-root__viewport-frame {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.workspace-root__viewport {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  background: #eef1f5;
}

.workspace-root__guide-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.workspace-root__guide {
  position: absolute;
  pointer-events: auto;
  cursor: default;
}

.workspace-root__guide::before {
  content: "";
  position: absolute;
  background: rgba(59, 130, 246, 0.72);
  transition:
    background-color 0.16s ease,
    opacity 0.16s ease;
}

.workspace-root__guide.is-hovered::before {
  background: rgba(37, 99, 235, 0.9);
}

.workspace-root__guide.is-active::before {
  background: rgba(29, 78, 216, 0.94);
}

.workspace-root__guide.is-draft::before {
  background: transparent;
  opacity: 1;
}

.workspace-root__guide.is-draft.is-invalid::before {
  opacity: 0.42;
}

.workspace-root__guide--vertical {
  top: 0;
  bottom: 0;
  width: 8px;
  transform: translateX(-4px);
  cursor: col-resize;
}

.workspace-root__guide--vertical::before {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-0.5px);
}

.workspace-root__guide--vertical.is-draft::before {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(29, 78, 216, 0.96) 0 7px,
    transparent 7px 12px
  );
}

.workspace-root__guide--horizontal {
  left: 0;
  right: 0;
  height: 8px;
  transform: translateY(-4px);
  cursor: row-resize;
}

.workspace-root__guide--horizontal::before {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  transform: translateY(-0.5px);
}

.workspace-root__guide--horizontal.is-draft::before {
  background-image: repeating-linear-gradient(
    to right,
    rgba(29, 78, 216, 0.96) 0 7px,
    transparent 7px 12px
  );
}

.workspace-root__guide-chip {
  position: absolute;
  z-index: 5;
  padding: 2px 6px;
  border: 1px solid var(--pd-accent-border);
  border-radius: var(--pd-radius-chip);
  background: var(--pd-surface-bg);
  color: var(--pd-accent-text);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
}

.workspace-root__guide-chip.is-invalid {
  color: var(--pd-muted);
  border-color: var(--pd-border);
}

.workspace-root__guide-chip--vertical {
  transform: translateX(-50%);
}

.workspace-root__guide-chip--horizontal {
  transform: translateY(-50%);
}
</style>
