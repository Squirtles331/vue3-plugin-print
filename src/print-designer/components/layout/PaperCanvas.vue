<template>
  <article
    ref="paperRef"
    class="paper-canvas"
    :class="{ 'paper-canvas--outline-hidden': !pageOutlineVisible }"
    :style="paperStyle"
  >
    <div v-if="gridVisible" class="paper-canvas__grid" :style="gridStyle"></div>

    <div class="paper-canvas__safe-area" :class="{ 'is-hidden': !safeAreaVisible }" :style="safeAreaStyle">
      <span v-if="safeAreaVisible" class="paper-canvas__safe-label">安全区</span>
    </div>

    <div v-if="pageCornerVisible" class="paper-canvas__corner-marks">
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--top-left"></span>
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--top-right"></span>
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--bottom-left"></span>
      <span class="paper-canvas__corner-mark paper-canvas__corner-mark--bottom-right"></span>
    </div>

    <div
      v-if="headerLineVisible"
      class="paper-canvas__print-line paper-canvas__print-line--header"
      :style="headerLineStyle"
    ></div>
    <div
      v-if="footerLineVisible"
      class="paper-canvas__print-line paper-canvas__print-line--footer"
      :style="footerLineStyle"
    ></div>

    <div
      v-if="activeSnap.x"
      class="paper-canvas__snap-line paper-canvas__snap-line--vertical"
      :style="{ left: `${mmToRoundedCssPx(activeSnap.x.position)}px` }"
    >
      <span class="paper-canvas__snap-label">{{ snapSourceLabel(activeSnap.x.source) }}</span>
    </div>
    <div
      v-if="activeSnap.y"
      class="paper-canvas__snap-line paper-canvas__snap-line--horizontal"
      :style="{ top: `${mmToRoundedCssPx(activeSnap.y.position)}px` }"
    >
      <span class="paper-canvas__snap-label">{{ snapSourceLabel(activeSnap.y.source) }}</span>
    </div>

    <div class="paper-canvas__content-surface" @pointerdown="onCanvasSurfacePointerDown">
      <div class="paper-canvas__object-layer">
        <div
          v-for="object in pageObjects"
          :key="object.id"
          class="paper-canvas__object-node"
          :class="{
            'is-selected': selectedIds.includes(object.id),
            'is-hovered': hoverObjectId === object.id,
            'is-dragging': interactionState?.objectId === object.id,
          }"
          :style="objectFrameStyle(object)"
          @pointerenter="hoverObjectId = object.id"
          @pointerleave="onObjectLeave(object.id)"
        >
          <div class="paper-canvas__object-content" :class="`is-${object.type}`" :style="objectContentStyle(object)">
            <span v-if="showVariableBadge(object)" class="paper-canvas__binding-badge">
              {{ variableBadgeLabel(object) }}
            </span>
            <template v-if="object.type === 'text'">
              <div class="paper-canvas__text-content" :style="textContentStyle(object)">
                {{ textPreviewContent(object) }}
              </div>
            </template>

            <template v-else-if="object.type === 'pageNumber'">
              <div class="paper-canvas__page-number-content" :style="textContentStyle(object)">
                {{ pageNumberContent(object) }}
              </div>
            </template>

            <template v-else-if="object.type === 'image'">
              <div class="paper-canvas__image-shell" :style="imagePreviewStyle(object)">
                <img
                  v-if="object.props?.src"
                  :src="object.props.src"
                  alt=""
                  class="paper-canvas__image-content"
                  :style="{ objectFit: object.style?.objectFit || 'contain' }"
                />
                <div v-else class="paper-canvas__image-placeholder">
                <span>图片</span>
                <small>{{ imagePlaceholderCaption(object) }}</small>
              </div>
              </div>
            </template>

            <template v-else-if="object.type === 'line'">
              <div class="paper-canvas__line-shape" :style="shapeStyle(object)"></div>
            </template>

            <template v-else-if="object.type === 'rect'">
              <div class="paper-canvas__rect-shape" :style="shapeStyle(object)"></div>
            </template>

            <template v-else-if="object.type === 'circle'">
              <div class="paper-canvas__circle-shape" :style="shapeStyle(object)"></div>
            </template>

            <template v-else-if="object.type === 'barcode'">
              <div class="paper-canvas__barcode" :style="barcodePreviewStyle(object)">
                <div class="paper-canvas__barcode-bars" :style="barcodeBarsStyle(object)"></div>
                <div
                  v-if="object.props?.displayValue !== false"
                  class="paper-canvas__barcode-value"
                  :style="barcodeValueStyle(object)"
                >
                  {{ encodedPreviewContent(object, "123456789") }}
                </div>
              </div>
            </template>

            <template v-else-if="object.type === 'qrcode'">
              <div class="paper-canvas__qrcode" :style="qrCodePreviewStyle(object)">
                <div class="paper-canvas__qrcode-grid" :style="qrCodeGridStyle(object)">
                  <span
                    v-for="cell in qrCodeCells(object)"
                    :key="cell.key"
                    :style="qrCodeCellStyle(object, cell)"
                  ></span>
                </div>
                <div class="paper-canvas__qrcode-caption">
                  {{ encodedPreviewContent(object, "https://example.com") }}
                </div>
              </div>
            </template>

            <template v-else-if="object.type === 'table'">
              <div class="paper-canvas__table" :style="tableStyle(object)">
                <div v-if="tableBindingTokens(object).length" class="paper-canvas__binding-strip">
                  <span
                    v-for="token in tableBindingTokens(object)"
                    :key="token.key"
                    class="paper-canvas__binding-pill"
                  >
                    {{ token.label }}
                  </span>
                </div>
                <div v-if="!tableColumns(object).length" class="paper-canvas__table-empty">
                  请先在右侧属性面板中配置表格列
                </div>
                <div
                  v-else-if="object.props?.showHeader !== false"
                  class="paper-canvas__table-head"
                  :style="tableGridStyle(object)"
                >
                  <span
                    v-for="column in tableColumns(object)"
                    :key="column.key"
                    :style="tableCellStyle(column, object, 'header')"
                  >
                    {{ tableHeaderLabel(column) }}
                  </span>
                </div>
                <div class="paper-canvas__table-body">
                  <div
                    v-for="row in tableRows(object)"
                    :key="row.__rowKey"
                    class="paper-canvas__table-row"
                    :style="tableGridStyle(object)"
                  >
                    <span
                      v-for="column in tableColumns(object)"
                      :key="column.key"
                      :style="tableCellStyle(column, object, 'body')"
                    >
                      {{ tableCellDisplayValue(row, column, object, "body") }}
                    </span>
                  </div>
                  <div v-if="tableShowsOmission(object)" class="paper-canvas__table-omission">...</div>
                </div>
                <div
                  v-for="row in tableFooterRows(object)"
                  :key="row.__rowKey"
                  class="paper-canvas__table-footer"
                  :style="tableGridStyle(object)"
                >
                  <span
                    v-for="column in tableColumns(object)"
                    :key="column.key"
                    :style="tableCellStyle(column, object, 'footer')"
                  >
                    {{ tableCellDisplayValue(row, column, object, "footer") }}
                  </span>
                </div>
              </div>
            </template>

            <template v-else-if="object.type === 'multiLabel'">
              <div class="paper-canvas__multi-label-shell">
                <div v-if="multiLabelBindingLabel(object)" class="paper-canvas__binding-strip">
                  <span class="paper-canvas__binding-pill">
                    {{ multiLabelBindingLabel(object) }}
                  </span>
                </div>
                <div class="paper-canvas__multi-label" :style="multiLabelGridStyle(object)">
                <div
                  v-for="cell in multiLabelCells(object)"
                  :key="cell.key"
                  class="paper-canvas__multi-label-cell"
                  :style="multiLabelCellStyle(object, cell)"
                >
                  <span class="paper-canvas__multi-label-index">{{ cell.indexLabel }}</span>
                  <strong>{{ cell.primary }}</strong>
                  <small v-if="cell.secondary">{{ cell.secondary }}</small>
                  <small v-if="cell.tertiary">{{ cell.tertiary }}</small>
                </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="paper-canvas__generic-fallback">
                <strong>{{ object.name }}</strong>
                <span>{{ elementLabel(object.type) }}</span>
              </div>
            </template>
          </div>

          <div class="paper-canvas__interaction-layer" @pointerdown.stop="startObjectDrag(object, $event)">
            <span v-if="selectedIds.includes(object.id)" class="paper-canvas__selection-chrome" aria-hidden="true">
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--top-left"></span>
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--top-right"></span>
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--bottom-left"></span>
              <span class="paper-canvas__selection-corner paper-canvas__selection-corner--bottom-right"></span>
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--top"></span>
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--right"></span>
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--bottom"></span>
              <span class="paper-canvas__selection-edge paper-canvas__selection-edge--left"></span>
            </span>

            <template v-if="selectedIds.includes(object.id)">
              <button
                v-for="handle in visibleResizeHandles(object)"
                :key="handle.key"
                type="button"
                class="paper-canvas__selection-handle"
                :class="[
                  `paper-canvas__selection-handle--${handle.key}`,
                  { 'is-active': activeHandle === handle.key },
                ]"
                :aria-label="handle.label"
                @pointerdown.stop.prevent="startObjectResize(object, handle.key, $event)"
              ></button>
            </template>

            <span class="paper-canvas__type-badge">{{ elementLabel(object.type) }}</span>
          </div>
        </div>
      </div>

      <div v-if="!pageObjects.length" class="paper-canvas__empty-state">
        <div class="paper-canvas__empty-badge">页面内容区</div>
        <h2>从模板面板拖入元素，开始搭建打印页面。</h2>
        <p>先把文字、图片、表格、条码和二维码放到纸面上，再继续做排版和属性调整。</p>
        <div class="paper-canvas__empty-actions">
          <span>推荐起点</span>
          <span class="paper-canvas__empty-chip">文本</span>
          <span class="paper-canvas__empty-chip">表格</span>
          <span class="paper-canvas__empty-chip">二维码</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import { getElementDefinition } from "../../core/elementFactory";
import { MM_TO_CSS_PX, mmToCssPx, mmToRoundedCssPx } from "../../editor/measurement.js";
import { createMoveObjectCommand, createTransformObjectCommand } from "../../editor/commands/documentCommands.js";
import { executeEditorCommand } from "../../editor/commands/executeCommand.js";
import { useEditorDocumentStore } from "../../editor/stores/documentStore";
import { useEditorHistoryStore } from "../../editor/stores/historyStore";
import { useEditorSelectionStore } from "../../editor/stores/selectionStore";
import { useEditorViewportStore } from "../../editor/stores/viewportStore";
import { createGridDefinition } from "../../editor/workspace/workspaceGrid.js";
import { buildAxisSnapReferences, resolveObjectSnap } from "../../editor/workspace/workspaceSnapping.js";

const props = defineProps({
  pixelsPerUnit: {
    type: Number,
    default: MM_TO_CSS_PX,
  },
  zoom: {
    type: Number,
    default: 1,
  },
});

const documentStore = useEditorDocumentStore();
const historyStore = useEditorHistoryStore();
const selectionStore = useEditorSelectionStore();
const viewportStore = useEditorViewportStore();
const resizeHandles = [
  { key: "nw", label: "左上缩放" },
  { key: "n", label: "上边缩放" },
  { key: "ne", label: "右上缩放" },
  { key: "e", label: "右边缩放" },
  { key: "se", label: "右下缩放" },
  { key: "s", label: "下边缩放" },
  { key: "sw", label: "左下缩放" },
  { key: "w", label: "左边缩放" },
];

const {
  currentPage,
  pageObjectMap,
  objectsById,
  pageWidthMm,
  pageHeightMm,
  pageWidthPx,
  pageHeightPx,
  marginXMm,
  marginYMm,
  pageBackground,
  pageCornerVisible,
  headerLineVisible,
  footerLineVisible,
  headerOffsetMm,
  footerOffsetMm,
} = storeToRefs(documentStore);
const {
  gridVisible,
  safeAreaVisible,
  guidesVisible,
  horizontalGuides,
  verticalGuides,
  snapEnabled,
  pageOutlineVisible,
  allowOverflowDrag,
} = storeToRefs(viewportStore);
const { selectedIds, hoverObjectId, activeHandle } = storeToRefs(selectionStore);

const paperRef = ref(null);
const interactionState = ref(null);
const activeSnap = ref({
  x: null,
  y: null,
});

function roundMm(value) {
  return +value.toFixed(2);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampObjectPosition(position, size, pageSize) {
  if (allowOverflowDrag.value) {
    return roundMm(position);
  }

  return clamp(roundMm(position), 0, Math.max(0, roundMm(pageSize - size)));
}

function isCornerHandle(handle = "") {
  return handle.length === 2;
}

function isAspectRatioLocked(object, handle) {
  if (!object || !isCornerHandle(handle)) {
    return false;
  }

  if (object.type === "qrcode" || object.type === "circle") {
    return true;
  }

  return !!object.props?.keepAspectRatio;
}

function isAutoHeightTextObject(object) {
  return object?.type === "text" && !!object?.props?.autoHeight;
}

function visibleResizeHandles(object) {
  if (!isAutoHeightTextObject(object)) {
    return resizeHandles;
  }

  return resizeHandles.filter((handle) => handle.key === "e" || handle.key === "w");
}

function resolveEdgeSnap(position, references, pixelsPerUnit, tolerancePx = 6) {
  if (!Number.isFinite(position)) {
    return null;
  }

  let best = null;

  references.forEach((reference) => {
    const distancePx = Math.abs(reference.position - position) * pixelsPerUnit;

    if (distancePx > tolerancePx) {
      return;
    }

    if (!best || distancePx < best.distancePx) {
      best = {
        position: reference.position,
        source: reference.source,
        distancePx,
      };
    }
  });

  return best;
}

function resolveResizeSnap(rect, startRect, handle) {
  const pixelsPerUnit = props.pixelsPerUnit * props.zoom;
  const gridSpacingMm = gridVisible.value ? gridDefinition.value.minorMm : null;
  const xReferences = buildAxisSnapReferences(pageWidthMm.value, guidesVisible.value ? verticalGuides.value : [], gridSpacingMm);
  const yReferences = buildAxisSnapReferences(pageHeightMm.value, guidesVisible.value ? horizontalGuides.value : [], gridSpacingMm);
  const xEdge = handle.includes("w") ? rect.x : handle.includes("e") ? rect.x + rect.width : null;
  const yEdge = handle.includes("n") ? rect.y : handle.includes("s") ? rect.y + rect.height : null;
  const xSnap = resolveEdgeSnap(xEdge, xReferences, pixelsPerUnit);
  const ySnap = resolveEdgeSnap(yEdge, yReferences, pixelsPerUnit);
  const lockAspectRatio = isAspectRatioLocked(startRect, handle);

  if (lockAspectRatio && isCornerHandle(handle)) {
    const useXAxis = xSnap && (!ySnap || xSnap.distancePx <= ySnap.distancePx);
    const useYAxis = ySnap && (!xSnap || ySnap.distancePx < xSnap.distancePx);

    if (useXAxis) {
      const aspectRatio = startRect.width / startRect.height || 1;
      const nextWidth = handle.includes("w") ? rect.x + rect.width - xSnap.position : xSnap.position - rect.x;
      const nextHeight = nextWidth / aspectRatio;
      const nextRect = {
        x: handle.includes("w") ? xSnap.position : rect.x,
        y: handle.includes("n") ? rect.y + rect.height - nextHeight : rect.y,
        width: nextWidth,
        height: nextHeight,
      };

      return {
        rect: {
          x: roundMm(nextRect.x),
          y: roundMm(nextRect.y),
          width: roundMm(nextRect.width),
          height: roundMm(nextRect.height),
        },
        activeSnap: {
          x: {
            position: xSnap.position,
            edge: handle.includes("w") ? "start" : "end",
            source: xSnap.source,
          },
          y: null,
        },
      };
    }

    if (useYAxis) {
      const aspectRatio = startRect.width / startRect.height || 1;
      const nextHeight = handle.includes("n") ? rect.y + rect.height - ySnap.position : ySnap.position - rect.y;
      const nextWidth = nextHeight * aspectRatio;
      const nextRect = {
        x: handle.includes("w") ? rect.x + rect.width - nextWidth : rect.x,
        y: handle.includes("n") ? ySnap.position : rect.y,
        width: nextWidth,
        height: nextHeight,
      };

      return {
        rect: {
          x: roundMm(nextRect.x),
          y: roundMm(nextRect.y),
          width: roundMm(nextRect.width),
          height: roundMm(nextRect.height),
        },
        activeSnap: {
          x: null,
          y: {
            position: ySnap.position,
            edge: handle.includes("n") ? "start" : "end",
            source: ySnap.source,
          },
        },
      };
    }
  }

  const nextRect = { ...rect };

  if (xSnap) {
    if (handle.includes("w")) {
      nextRect.width = roundMm(nextRect.width + (nextRect.x - xSnap.position));
      nextRect.x = roundMm(xSnap.position);
    } else if (handle.includes("e")) {
      nextRect.width = roundMm(xSnap.position - nextRect.x);
    }
  }

  if (ySnap) {
    if (handle.includes("n")) {
      nextRect.height = roundMm(nextRect.height + (nextRect.y - ySnap.position));
      nextRect.y = roundMm(ySnap.position);
    } else if (handle.includes("s")) {
      nextRect.height = roundMm(ySnap.position - nextRect.y);
    }
  }

  return {
    rect: nextRect,
    activeSnap: {
      x: xSnap
        ? {
            position: xSnap.position,
            edge: handle.includes("w") ? "start" : "end",
            source: xSnap.source,
          }
        : null,
      y: ySnap
        ? {
            position: ySnap.position,
            edge: handle.includes("n") ? "start" : "end",
            source: ySnap.source,
          }
        : null,
    },
  };
}

const pageObjects = computed(() => {
  const pageId = currentPage.value?.id || "page-1";
  const objectIds = pageObjectMap.value[pageId] || [];
  return objectIds.map((objectId) => objectsById.value[objectId]).filter(Boolean);
});

const gridDefinition = computed(() => createGridDefinition(props.pixelsPerUnit));

const paperStyle = computed(() => ({
  width: `${pageWidthPx.value}px`,
  height: `${pageHeightPx.value}px`,
  background: pageBackground.value,
}));

const safeAreaStyle = computed(() => ({
  inset: `${mmToCssPx(marginYMm.value)}px ${mmToCssPx(marginXMm.value)}px`,
}));

const headerLineStyle = computed(() => ({
  top: `${mmToCssPx(clamp(headerOffsetMm.value, 0, pageHeightMm.value))}px`,
}));

const footerLineStyle = computed(() => ({
  bottom: `${mmToCssPx(clamp(footerOffsetMm.value, 0, pageHeightMm.value))}px`,
}));

const gridStyle = computed(() => ({
  backgroundImage: [
    "linear-gradient(rgba(191, 201, 214, 0.26) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(191, 201, 214, 0.26) 1px, transparent 1px)",
    "linear-gradient(rgba(120, 138, 160, 0.2) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(120, 138, 160, 0.2) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: [
    `${gridDefinition.value.minorPx}px ${gridDefinition.value.minorPx}px`,
    `${gridDefinition.value.minorPx}px ${gridDefinition.value.minorPx}px`,
    `${gridDefinition.value.majorPx}px ${gridDefinition.value.majorPx}px`,
    `${gridDefinition.value.majorPx}px ${gridDefinition.value.majorPx}px`,
  ].join(", "),
  backgroundPosition: "0 0, 0 0, 0 0, 0 0",
}));

function elementLabel(type) {
  return getElementDefinition(type)?.label || type;
}

function objectFrameStyle(object) {
  return {
    left: `${mmToCssPx(object.x)}px`,
    top: `${mmToCssPx(object.y)}px`,
    width: `${mmToCssPx(object.width)}px`,
    height: `${mmToCssPx(object.height)}px`,
    opacity: object.opacity ?? 1,
  };
}

function objectContentStyle(object) {
  return {
    color: object.style?.color || "#111827",
    background: object.style?.backgroundColor || "transparent",
  };
}

function textContentStyle(object) {
  const verticalAlign = object.style?.verticalAlign || "top";
  const textAlign = object.style?.textAlign || "left";
  const alignItemsMap = {
    top: "flex-start",
    middle: "center",
    bottom: "flex-end",
  };
  const justifyContentMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return {
    ...previewPanelStyle(object, "transparent"),
    color: object.style?.color || "#111827",
    fontFamily: object.style?.fontFamily || "sans-serif",
    fontSize: `${object.style?.fontSize || 14}px`,
    fontWeight: object.style?.fontWeight || "normal",
    fontStyle: object.style?.fontStyle || "normal",
    textDecoration: object.style?.textDecoration || "none",
    textAlign,
    lineHeight: object.style?.lineHeight || 1.4,
    letterSpacing: `${object.style?.letterSpacing || 0}px`,
    whiteSpace: object.props?.whiteSpace || "pre-wrap",
    writingMode: object.props?.writingMode || "horizontal-tb",
    alignItems: alignItemsMap[verticalAlign] || "flex-start",
    justifyContent: justifyContentMap[textAlign] || "flex-start",
    overflow: "hidden",
  };
}

function textPreviewContent(object) {
  const sampleValue = object.props?.sampleValue;
  const variable = object.variable;
  const content = object.content;

  if (variable) {
    if (sampleValue != null && String(sampleValue).trim() !== "") {
      return String(sampleValue);
    }

    return `{{${variable}}}`;
  }

  if (content != null && String(content).trim() !== "") {
    return String(content);
  }

  return "文本内容";
}

function imagePlaceholderCaption(object) {
  const variable = object.variable;

  if (variable) {
    return `{{${variable}}}`;
  }

  if (object.props?.placeholder) {
    return String(object.props.placeholder);
  }

  return "未设置图片";
}

function encodedPreviewContent(object, fallback) {
  const variable = object.variable;
  const content = object.content;

  if (variable) {
    return `{{${variable}}}`;
  }

  if (content != null && String(content).trim() !== "") {
    return String(content);
  }

  return fallback;
}

function showVariableBadge(object) {
  if (!object?.variable) {
    return false;
  }

  return ["text", "image", "barcode", "qrcode"].includes(object.type);
}

function variableBadgeLabel(object) {
  return `{{${object.variable}}}`;
}

function shapeStyle(object) {
  return {
    borderWidth: `${object.style?.borderWidth ?? 1}px`,
    borderStyle: object.style?.borderStyle || "solid",
    borderColor: object.style?.borderColor || "#111827",
    background: object.style?.backgroundColor || "transparent",
    borderRadius: `${Math.max(0, Number(object.style?.borderRadius) || 0)}px`,
    opacity: Number.isFinite(Number(object.style?.opacity)) ? Number(object.style?.opacity) : 1,
  };
}

function tableColumns(object) {
  if (Array.isArray(object.props?.columns)) {
    return object.props.columns.map((column, index) => ({
      key:
        typeof column?.key === "string" && column.key.trim()
          ? column.key
          : typeof column?.field === "string" && column.field.trim()
            ? column.field
            : `field${index + 1}`,
      title:
        typeof column?.title === "string" && column.title.trim()
          ? column.title
          : typeof column?.header === "string" && column.header.trim()
            ? column.header
            : `列 ${index + 1}`,
      width: Number.isFinite(Number(column?.width)) ? Number(column.width) : 100,
      align:
        column?.align === "center" || column?.align === "right"
          ? column.align
          : column?.align === "justify"
            ? "left"
            : "left",
    }));
  }

  return [
    { key: "id", title: "ID", width: 60, align: "center" },
    { key: "name", title: "名称", width: 140, align: "left" },
    { key: "qty", title: "数量", width: 100, align: "right" },
    { key: "price", title: "单价", width: 120, align: "right" },
    { key: "total", title: "合计", width: 120, align: "right" },
  ];
}

function tableHeaderLabel(column) {
  return column?.title || column?.header || "";
}

function tableColumnWidth(column) {
  const width = Number(column?.width);
  return Number.isFinite(width) && width > 0 ? width : 100;
}

function tableGridStyle(object) {
  const trackList = tableColumns(object)
    .map((column) => `minmax(0, ${tableColumnWidth(column)}fr)`)
    .join(" ");

  return {
    gridTemplateColumns: trackList || "minmax(0, 1fr)",
  };
}

function tableCellStyle(column, object, section = "body") {
  const sectionFontSize =
    section === "header"
      ? object?.style?.headerFontSize || object?.style?.fontSize || 10
      : section === "footer"
        ? object?.style?.footerFontSize || object?.style?.fontSize || 10
        : object?.style?.fontSize || 10;
  const textAlignFallback =
    section === "header"
      ? object?.style?.headerTextAlign || object?.style?.textAlign || "left"
      : section === "footer"
        ? object?.style?.footerTextAlign || object?.style?.textAlign || "left"
        : object?.style?.textAlign || "left";
  const textAlign = column?.align || textAlignFallback;
  const verticalAlign = object?.style?.verticalAlign || "top";
  const justifyContentMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };
  const alignItemsMap = {
    top: "flex-start",
    middle: "center",
    bottom: "flex-end",
  };

  return {
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    justifyContent: justifyContentMap[textAlign] || "flex-start",
    alignItems: alignItemsMap[verticalAlign] || "flex-start",
    textAlign,
    fontSize: `${Math.max(9, Number(sectionFontSize) || 10)}px`,
    color:
      section === "header"
        ? object?.style?.headerColor || object?.style?.color || "#111827"
        : section === "footer"
          ? object?.style?.footerColor || object?.style?.color || "#111827"
          : object?.style?.color || "#111827",
  };
}

function tableStyle(object) {
  const style = object.style || {};
  const padding = Math.max(0, Number(style.padding) || 0);
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
  const borderColor = style.borderColor || "#111827";
  const headerHeight = Math.max(0, Number(object?.props?.headerHeight) || 0);
  const rowHeight = Math.max(0, Number(object?.props?.rowHeight) || 0);
  const footerHeight = Math.max(0, Number(object?.props?.footerHeight) || 0);

  return {
    ...previewPanelStyle(object, "#ffffff"),
    color: style.color || "#111827",
    fontFamily: style.fontFamily || undefined,
    fontSize: `${Math.max(9, Number(style.fontSize) || 10)}px`,
    fontWeight: style.fontWeight || "normal",
    fontStyle: style.fontStyle || "normal",
    lineHeight: style.lineHeight || 1.4,
    letterSpacing: `${Number.isFinite(Number(style.letterSpacing)) ? Number(style.letterSpacing) : 0}px`,
    "--table-cell-padding-y": `${Math.max(0, Math.round(mmToCssPx(padding) * 0.55))}px`,
    "--table-cell-padding-x": `${Math.max(0, Math.round(mmToCssPx(padding)))}px`,
    "--table-grid-border-width": `${borderWidth}px`,
    "--table-grid-border-style": style.borderStyle || "solid",
    "--table-grid-border-color": borderColor,
    "--table-head-background": style.headerBackgroundColor || "rgba(243, 244, 246, 0.98)",
    "--table-footer-background": style.footerBackgroundColor || "rgba(249, 250, 251, 0.98)",
    "--table-head-color": style.headerColor || style.color || "#111827",
    "--table-footer-color": style.footerColor || style.color || "#111827",
    "--table-head-min-height": headerHeight > 0 ? `${Math.round(mmToCssPx(headerHeight))}px` : "auto",
    "--table-row-min-height": rowHeight > 0 ? `${Math.round(mmToCssPx(rowHeight))}px` : "auto",
    "--table-footer-min-height": footerHeight > 0 ? `${Math.round(mmToCssPx(footerHeight))}px` : "auto",
  };
}

function tableBindingPlaceholder(variable, key, rowIndex = 0) {
  return `{{${variable}[${rowIndex}].${key}}}`;
}

function tableDataSource(object) {
  if (Array.isArray(object.props?.sampleData)) {
    return object.props.sampleData;
  }

  if (Array.isArray(object.props?.data)) {
    return object.props.data;
  }

  return [];
}

function tableSummaryMetrics(object) {
  const rows = tableDataSource(object);

  return rows.reduce(
    (result, row) => {
      result.totalQty += Number(row?.qty) || 0;
      result.totalAmount += Number(row?.total) || 0;
      return result;
    },
    {
      totalQty: 0,
      totalAmount: 0,
    }
  );
}

function tableReplaceSummaryToken(value, object) {
  if (typeof value !== "string" || !value.includes("{#")) {
    return value;
  }

  const { totalQty, totalAmount } = tableSummaryMetrics(object);

  return value
    .replaceAll("{#pageQty}", String(totalQty))
    .replaceAll("{#totalQty}", String(totalQty))
    .replaceAll("{#pageSum}", totalAmount.toFixed(2))
    .replaceAll("{#totalSum}", totalAmount.toFixed(2))
    .replaceAll("{#totalCap}", digitUppercase(totalAmount));
}

function digitUppercase(value) {
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [
    ["元", "万", "亿"],
    ["", "拾", "佰", "仟"],
  ];

  let amount = Math.abs(Number(value) || 0);
  let result = "";

  for (let i = 0; i < fraction.length; i += 1) {
    result += (digit[Math.floor(amount * 10 * 10 ** i) % 10] + fraction[i]).replace(/零./, "");
  }

  result = result || "整";
  amount = Math.floor(amount);

  for (let i = 0; i < unit[0].length && amount > 0; i += 1) {
    let part = "";

    for (let j = 0; j < unit[1].length && amount > 0; j += 1) {
      part = digit[amount % 10] + unit[1][j] + part;
      amount = Math.floor(amount / 10);
    }

    result = part.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + result;
  }

  return result.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整");
}

function tableResolveCellValue(value, object) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.result != null && value.result !== "") {
      return String(value.result);
    }

    if (typeof value.field === "string" && value.field) {
      return String(tableReplaceSummaryToken(value.field, object));
    }

    if (typeof value.value === "string" && value.value) {
      return String(tableReplaceSummaryToken(value.value, object));
    }
  }

  if (value == null) {
    return "";
  }

  return typeof value === "string" ? tableReplaceSummaryToken(value, object) : String(value);
}

function tableCellDisplayValue(row, column, object, section = "body") {
  const value = row?.[column.key];
  const resolved = tableResolveCellValue(value, object);

  if (resolved === "" && section === "body") {
    return "";
  }

  return resolved;
}

function tableRows(object) {
  const rows = tableDataSource(object);
  const previewLimit = object?.props?.designOmitRows === false ? 8 : 5;
  const bindingPreviewRows =
    !rows.length && object.props?.dataVariable
      ? Array.from({ length: previewLimit }, (_, rowIndex) =>
          tableColumns(object).reduce((result, column) => {
            result[column.key] = tableBindingPlaceholder(object.props.dataVariable, column.key, rowIndex);
            return result;
          }, {})
        )
      : null;
  const previewRows = rows.length
    ? rows
    : [
        { id: 1, name: "商品 1", qty: 1, price: 100, total: 100 },
        { id: 2, name: "商品 2", qty: 2, price: 110, total: 220 },
        { id: 3, name: "商品 3", qty: 3, price: 120, total: 360 },
      ];

  return (bindingPreviewRows || previewRows).slice(0, previewLimit).map((row, index) => ({
    ...row,
    __rowKey: `${object.id}-${index}`,
  }));
}

function tableShowsOmission(object) {
  if (object?.props?.designOmitRows === false) {
    return false;
  }

  return tableDataSource(object).length > tableRows(object).length;
}

function tableFooterRows(object) {
  if (object.props?.showFooter === false) {
    return [];
  }

  const columns = tableColumns(object);
  const footerData = object.props?.footerData;

  if (Array.isArray(footerData)) {
    return footerData.map((row, index) => ({
      ...row,
      __rowKey: `${object.id}-footer-${index}`,
    }));
  }

  if (footerData && typeof footerData === "object" && Object.keys(footerData).length) {
    return [
      {
        ...footerData,
        __rowKey: `${object.id}-footer-0`,
      },
    ];
  }

  if (object.props?.footerDataVariable) {
    return [
      {
        ...columns.reduce((result, column) => {
          result[column.key] = `{{${object.props.footerDataVariable}.${column.key}}}`;
          return result;
        }, {}),
        __rowKey: `${object.id}-footer-0`,
      },
    ];
  }

  const fallback = {};

  columns.forEach((column, index) => {
    if (index === 0) {
      fallback[column.key] = "总计";
      return;
    }

    const values = tableDataSource(object)
      .map((row) => Number(row[column.key]))
      .filter((value) => Number.isFinite(value));

    fallback[column.key] = values.length
      ? column.key === "price" || column.key === "total"
        ? values.reduce((sum, value) => sum + value, 0).toFixed(2)
        : values.reduce((sum, value) => sum + value, 0)
      : "";
  });

  return [
    {
      ...fallback,
      __rowKey: `${object.id}-footer-0`,
    },
  ];
}

function tableBindingTokens(object) {
  const tokens = [];

  if (object.props?.dataVariable) {
    tokens.push({
      key: "data",
      label: `数据: {{${object.props.dataVariable}}}`,
    });
  }

  if (object.props?.columnsVariable) {
    tokens.push({
      key: "columns",
      label: `列: {{${object.props.columnsVariable}}}`,
    });
  }

  if (object.props?.footerDataVariable) {
    tokens.push({
      key: "footer",
      label: `页脚: {{${object.props.footerDataVariable}}}`,
    });
  }

  return tokens;
}

function multiLabelConfig(object) {
  return {
    rows: Math.max(1, Number(object?.props?.rows) || 1),
    cols: Math.max(1, Number(object?.props?.cols) || 1),
    gapX: Math.max(0, Number(object?.props?.gapX) || 0),
    gapY: Math.max(0, Number(object?.props?.gapY) || 0),
    direction: object?.props?.direction === "column" ? "column" : "row",
  };
}

function multiLabelBindingLabel(object) {
  if (object.props?.dataVariable) {
    return `数据: {{${object.props.dataVariable}}}`;
  }

  return "";
}

function multiLabelGridStyle(object) {
  const config = multiLabelConfig(object);

  return {
    gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
    columnGap: `${mmToCssPx(config.gapX)}px`,
    rowGap: `${mmToCssPx(config.gapY)}px`,
  };
}

function multiLabelCellPosition(index, rows, cols, direction) {
  if (direction === "column") {
    return {
      row: (index % rows) + 1,
      col: Math.floor(index / rows) + 1,
    };
  }

  return {
    row: Math.floor(index / cols) + 1,
    col: (index % cols) + 1,
  };
}

function multiLabelAlignItems(textAlign) {
  switch (textAlign) {
    case "center":
      return "center";
    case "right":
      return "flex-end";
    default:
      return "flex-start";
  }
}

function multiLabelJustifyContent(verticalAlign) {
  switch (verticalAlign) {
    case "middle":
      return "center";
    case "bottom":
      return "flex-end";
    default:
      return "flex-start";
  }
}

function multiLabelCellStyle(object, cell) {
  const style = object?.style || {};
  const fontSize = Math.max(8, Number(style.fontSize) || 10);
  const paddingMm = Math.max(0, Number(style.padding) || 0);
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
  const hasVisibleBorder = borderWidth > 0;
  const color = previewForegroundColor(object);
  const backgroundColor =
    style.backgroundColor && style.backgroundColor !== "transparent"
      ? style.backgroundColor
      : "rgba(255, 255, 255, 0.96)";

  return {
    gridRow: String(cell.row),
    gridColumn: String(cell.col),
    justifyContent: multiLabelJustifyContent(style.verticalAlign),
    alignItems: multiLabelAlignItems(style.textAlign),
    padding: `${Math.max(0, mmToCssPx(paddingMm))}px`,
    borderWidth: `${borderWidth}px`,
    borderStyle: hasVisibleBorder ? style.borderStyle || "solid" : "solid",
    borderColor: hasVisibleBorder ? style.borderColor || color : "transparent",
    borderRadius: `${Math.max(0, Number(style.borderRadius) || 0)}px`,
    background: backgroundColor,
    color,
    opacity: Number.isFinite(Number(style.opacity)) ? Number(style.opacity) : 1,
    textAlign: style.textAlign || "left",
    fontFamily: style.fontFamily || undefined,
    fontStyle: style.fontStyle || "normal",
    lineHeight: style.lineHeight || 1.4,
    letterSpacing: `${Number(style.letterSpacing) || 0}px`,
    "--multi-label-primary-size": `${fontSize}px`,
    "--multi-label-secondary-size": `${Math.max(8, Math.round(fontSize * 0.84))}px`,
    "--multi-label-index-size": `${Math.max(7, Math.round(fontSize * 0.72))}px`,
    "--multi-label-primary-weight": style.fontWeight || "700",
    "--multi-label-secondary-color": color,
    "--multi-label-index-color": style.borderColor || color,
  };
}

function multiLabelPreviewLines(item, fallbackIndex, object) {
  if (item == null || item === "") {
    if (object?.props?.dataVariable) {
      const base = `${object.props.dataVariable}[${fallbackIndex}]`;
      return {
        primary: `{{${base}.title}}`,
        secondary: `{{${base}.code}}`,
        tertiary: `{{${base}.detail}}`,
      };
    }
    return {
      primary: `标签 ${fallbackIndex + 1}`,
      secondary: "示例数据",
      tertiary: "",
    };
  }

  if (typeof item === "string" || typeof item === "number") {
    return {
      primary: String(item),
      secondary: "",
      tertiary: "",
    };
  }

  if (typeof item === "object") {
    const preferred = [
      item.title,
      item.name,
      item.label,
      item.code,
      item.value,
      item.text,
      item.detail,
      item.desc,
    ]
      .filter((value) => value != null && value !== "")
      .map((value) => String(value));

    if (preferred.length) {
      return {
        primary: preferred[0],
        secondary: preferred[1] || "",
        tertiary: preferred[2] || "",
      };
    }

    const entries = Object.entries(item)
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${value}`);

    return {
      primary: entries[0] || `标签 ${fallbackIndex + 1}`,
      secondary: entries[1] || "",
      tertiary: entries[2] || "",
    };
  }

  return {
    primary: `标签 ${fallbackIndex + 1}`,
    secondary: String(item),
    tertiary: "",
  };
}

function multiLabelCells(object) {
  const config = multiLabelConfig(object);
  const total = config.rows * config.cols;
  const sampleData = Array.isArray(object?.props?.sampleData) ? object.props.sampleData : [];

  return Array.from({ length: total }, (_, index) => {
    const item = sampleData[index];
    const { row, col } = multiLabelCellPosition(index, config.rows, config.cols, config.direction);
    const preview = multiLabelPreviewLines(item, index, object);

    return {
      key: `${object.id}-${index}`,
      row,
      col,
      indexLabel: `#${index + 1}`,
      ...preview,
    };
  });
}

function previewForegroundColor(object) {
  return object.style?.color || object.style?.borderColor || "#111827";
}

function previewBackgroundColor(object) {
  return object.style?.backgroundColor || "#ffffff";
}

function previewPanelStyle(object, fallbackBackground = "transparent") {
  const style = object?.style || {};
  const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
  const padding = Math.max(0, Number(style.padding) || 0);
  const radius = Math.max(0, Number(style.borderRadius) || 0);
  const opacity = Number(style.opacity);

  return {
    boxSizing: "border-box",
    padding: `${mmToCssPx(padding)}px`,
    border: borderWidth
      ? `${borderWidth}px ${style.borderStyle || "solid"} ${style.borderColor || previewForegroundColor(object)}`
      : "0 solid transparent",
    borderRadius: `${radius}px`,
    background:
      style.backgroundColor && style.backgroundColor !== "transparent" ? style.backgroundColor : fallbackBackground,
    opacity: Number.isFinite(opacity) ? opacity : 1,
  };
}

function imagePreviewStyle(object) {
  return previewPanelStyle(object, "#f8fafc");
}

function hashPreviewSeed(value) {
  const source = String(value || "");
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function barcodePreviewStyle(object) {
  return {
    ...previewPanelStyle(object, "#ffffff"),
  };
}

function barcodeValueStyle(object) {
  return {
    color: previewForegroundColor(object),
    fontFamily: object.style?.fontFamily || "sans-serif",
    fontSize: `${Math.max(8, Number(object.style?.fontSize) || 11)}px`,
    fontWeight: object.style?.fontWeight || "normal",
    letterSpacing: `${Number.isFinite(Number(object.style?.letterSpacing)) ? Number(object.style?.letterSpacing) : 1}px`,
    textAlign: object.style?.textAlign || "center",
  };
}

function barcodeBarsStyle(object) {
  const source = `${object.props?.format || "CODE128"}:${encodedPreviewContent(object, "123456789")}`;
  const seed = hashPreviewSeed(source);
  const foreground = previewForegroundColor(object);
  const segments = [];
  let cursor = 0;
  let state = 1;

  for (let index = 0; index < 48; index += 1) {
    const width = ((seed >> (index % 24)) & 0x3) + 1;
    const nextCursor = Math.min(100, cursor + width);
    const color = state ? foreground : "transparent";
    segments.push(`${color} ${cursor}%`, `${color} ${nextCursor}%`);
    cursor = nextCursor;
    state = state ? 0 : 1;

    if (cursor >= 100) {
      break;
    }
  }

  if (cursor < 100) {
    segments.push(`transparent ${cursor}%`, `transparent 100%`);
  }

  return {
    backgroundImage: `linear-gradient(90deg, ${segments.join(", ")})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  };
}

function qrCodeSize(object) {
  const eccLevel = object.props?.eccLevel || "M";

  switch (eccLevel) {
    case "L":
      return 21;
    case "Q":
      return 25;
    case "H":
      return 29;
    default:
      return 23;
  }
}

function isQrFinderCell(size, row, column) {
  const anchors = [
    { row: 0, column: 0 },
    { row: 0, column: size - 7 },
    { row: size - 7, column: 0 },
  ];

  return anchors.some((anchor) => row >= anchor.row && row < anchor.row + 7 && column >= anchor.column && column < anchor.column + 7);
}

function isQrFinderDark(size, row, column) {
  const anchors = [
    { row: 0, column: 0 },
    { row: 0, column: size - 7 },
    { row: size - 7, column: 0 },
  ];
  const anchor = anchors.find((item) => row >= item.row && row < item.row + 7 && column >= item.column && column < item.column + 7);

  if (!anchor) {
    return false;
  }

  const innerRow = row - anchor.row;
  const innerColumn = column - anchor.column;
  const onOuter = innerRow === 0 || innerRow === 6 || innerColumn === 0 || innerColumn === 6;
  const onCenter = innerRow >= 2 && innerRow <= 4 && innerColumn >= 2 && innerColumn <= 4;
  return onOuter || onCenter;
}

function qrCodeCells(object) {
  const size = qrCodeSize(object);
  const seed = hashPreviewSeed(`${encodedPreviewContent(object, "https://example.com")}:${object.props?.eccLevel || "M"}`);
  const cells = [];

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let dark;

      if (isQrFinderCell(size, row, column)) {
        dark = isQrFinderDark(size, row, column);
      } else {
        const mask = ((seed >> ((row + column) % 24)) & 1) ^ (((row * 3 + column * 5 + seed) % 7) < 3 ? 1 : 0);
        dark = mask === 1;
      }

      cells.push({
        key: `${row}-${column}`,
        dark,
      });
    }
  }

  return cells;
}

function qrCodePreviewStyle(object) {
  return {
    ...previewPanelStyle(object, "#ffffff"),
  };
}

function qrCodeGridStyle(object) {
  const size = qrCodeSize(object);
  return {
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
    borderColor: previewForegroundColor(object),
  };
}

function qrCodeCellStyle(object, cell) {
  return {
    background: cell.dark ? previewForegroundColor(object) : previewBackgroundColor(object),
  };
}

function pageNumberContent(object) {
  const current = String(object.content || "1");
  const format = object.props?.format || "1";
  const totalPages = String(Math.max(1, Number(object.props?.totalPages) || 1));

  if (format === "Page 1") {
    return `Page ${current}`;
  }

  if (format === "1/N") {
    return `${current}/${totalPages}`;
  }

  if (format === "第1页") {
    return `第 ${current} 页`;
  }

  if (format === "第1页/共N页") {
    return `第 ${current} 页 / 共 N 页`;
  }

  return current;
}

function snapSourceLabel(source) {
  switch (source) {
    case "page":
      return "页面";
    case "guide":
      return "参考线";
    case "grid":
      return "网格";
    default:
      return "吸附";
  }
}

function getPointerPointMm(event) {
  const paper = paperRef.value;

  if (!paper) {
    return null;
  }

  const paperRect = paper.getBoundingClientRect();
  const safeZoom = Number.isFinite(props.zoom) && props.zoom > 0 ? props.zoom : 1;
  const localX = (event.clientX - paperRect.left) / safeZoom;
  const localY = (event.clientY - paperRect.top) / safeZoom;

  return {
    x: roundMm(localX / props.pixelsPerUnit),
    y: roundMm(localY / props.pixelsPerUnit),
  };
}

function clearCanvasSelection() {
  selectionStore.clearSelection();
  selectionStore.hoverObjectId = null;
  selectionStore.activeHandle = null;
  activeSnap.value = {
    x: null,
    y: null,
  };
}

function onCanvasSurfacePointerDown(event) {
  const target = event.target;

  if (target instanceof Element && target.closest(".paper-canvas__interaction-layer")) {
    return;
  }

  clearCanvasSelection();
}

function stopObjectDrag() {
  window.removeEventListener("pointermove", onObjectPointerMove);
  window.removeEventListener("pointerup", onObjectPointerUp);
}

function onObjectLeave(objectId) {
  if (interactionState.value?.objectId === objectId) {
    return;
  }

  if (hoverObjectId.value === objectId) {
    selectionStore.hoverObjectId = null;
  }
}

function startObjectDrag(object, event) {
  if (event.button !== 0) {
    return;
  }

  const point = getPointerPointMm(event);

  if (!point) {
    return;
  }

  selectionStore.select(object.id);
  selectionStore.hoverObjectId = object.id;
  selectionStore.activeHandle = null;

  if (object.locked) {
    return;
  }

  interactionState.value = {
    mode: "move",
    objectId: object.id,
    startPointerX: point.x,
    startPointerY: point.y,
    startObjectX: object.x,
    startObjectY: object.y,
    width: object.width,
    height: object.height,
  };
  stopObjectDrag();
  window.addEventListener("pointermove", onObjectPointerMove);
  window.addEventListener("pointerup", onObjectPointerUp);
}

function startObjectResize(object, handle, event) {
  if (event.button !== 0) {
    return;
  }

  const point = getPointerPointMm(event);

  if (!point) {
    return;
  }

  selectionStore.select(object.id);
  selectionStore.hoverObjectId = object.id;

  if (object.locked) {
    selectionStore.activeHandle = null;
    return;
  }

  selectionStore.activeHandle = handle;
  interactionState.value = {
    mode: "resize",
    handle,
    objectId: object.id,
    startPointerX: point.x,
    startPointerY: point.y,
    startObjectX: object.x,
    startObjectY: object.y,
    startWidth: object.width,
    startHeight: object.height,
  };
  activeSnap.value = {
    x: null,
    y: null,
  };
  stopObjectDrag();
  window.addEventListener("pointermove", onObjectPointerMove);
  window.addEventListener("pointerup", onObjectPointerUp);
}

function clampResizeEdges(startRect, handle, deltaX, deltaY) {
  const minWidth = 0.1;
  const minHeight = 0.1;

  let left = startRect.x;
  let right = startRect.x + startRect.width;
  let top = startRect.y;
  let bottom = startRect.y + startRect.height;

  if (isAspectRatioLocked(startRect, handle)) {
    const aspectRatio = startRect.width / startRect.height || 1;
    const maxWidthByPage = allowOverflowDrag.value
      ? Number.POSITIVE_INFINITY
      : handle.includes("w")
        ? right
        : pageWidthMm.value - left;
    const maxHeightByPage = allowOverflowDrag.value
      ? Number.POSITIVE_INFINITY
      : handle.includes("n")
        ? bottom
        : pageHeightMm.value - top;
    const widthLowerBound = Math.max(minWidth, minHeight * aspectRatio);
    const widthUpperBound = Math.min(maxWidthByPage, maxHeightByPage * aspectRatio);
    const heightLowerBound = Math.max(minHeight, minWidth / aspectRatio);
    const heightUpperBound = Math.min(maxHeightByPage, maxWidthByPage / aspectRatio);
    const rawWidth = handle.includes("w") ? startRect.width - deltaX : startRect.width + deltaX;
    const rawHeight = handle.includes("n") ? startRect.height - deltaY : startRect.height + deltaY;
    const widthDeltaRatio = Math.abs(rawWidth - startRect.width) / Math.max(startRect.width, 0.001);
    const heightDeltaRatio = Math.abs(rawHeight - startRect.height) / Math.max(startRect.height, 0.001);

    let nextWidth;
    let nextHeight;

    if (widthDeltaRatio >= heightDeltaRatio) {
      nextWidth = clamp(rawWidth, widthLowerBound, widthUpperBound);
      nextHeight = nextWidth / aspectRatio;
    } else {
      nextHeight = clamp(rawHeight, heightLowerBound, heightUpperBound);
      nextWidth = nextHeight * aspectRatio;
    }

    if (handle.includes("w")) {
      left = right - nextWidth;
    } else if (handle.includes("e")) {
      right = left + nextWidth;
    }

    if (handle.includes("n")) {
      top = bottom - nextHeight;
    } else if (handle.includes("s")) {
      bottom = top + nextHeight;
    }

    return {
      x: roundMm(left),
      y: roundMm(top),
      width: roundMm(nextWidth),
      height: roundMm(nextHeight),
    };
  }

  if (handle.includes("w")) {
    const minLeft = allowOverflowDrag.value ? Number.NEGATIVE_INFINITY : 0;
    const maxLeft = right - minWidth;
    left = clamp(startRect.x + deltaX, minLeft, maxLeft);
  }

  if (handle.includes("e")) {
    const minRight = left + minWidth;
    const maxRight = allowOverflowDrag.value ? Number.POSITIVE_INFINITY : pageWidthMm.value;
    right = clamp(startRect.x + startRect.width + deltaX, minRight, maxRight);
  }

  if (handle.includes("n")) {
    const minTop = allowOverflowDrag.value ? Number.NEGATIVE_INFINITY : 0;
    const maxTop = bottom - minHeight;
    top = clamp(startRect.y + deltaY, minTop, maxTop);
  }

  if (handle.includes("s")) {
    const minBottom = top + minHeight;
    const maxBottom = allowOverflowDrag.value ? Number.POSITIVE_INFINITY : pageHeightMm.value;
    bottom = clamp(startRect.y + startRect.height + deltaY, minBottom, maxBottom);
  }

  const width = roundMm(Math.max(minWidth, right - left));
  const height = roundMm(Math.max(minHeight, bottom - top));

  return {
    x: roundMm(left),
    y: roundMm(top),
    width,
    height,
  };
}

function onObjectPointerMove(event) {
  const drag = interactionState.value;
  const point = getPointerPointMm(event);

  if (!drag || !point) {
    viewportStore.clearCoordinateReadout();
    return;
  }

  const insidePage =
    point.x >= 0 && point.x <= pageWidthMm.value && point.y >= 0 && point.y <= pageHeightMm.value;

  if (drag.mode === "resize") {
    const rawRect = clampResizeEdges(
      {
        type: objectsById.value[drag.objectId]?.type,
        props: objectsById.value[drag.objectId]?.props,
        x: drag.startObjectX,
        y: drag.startObjectY,
        width: drag.startWidth,
        height: drag.startHeight,
      },
      drag.handle,
      point.x - drag.startPointerX,
      point.y - drag.startPointerY
    );
    const resizeSnapResult = snapEnabled.value
      ? resolveResizeSnap(
          rawRect,
          {
            type: objectsById.value[drag.objectId]?.type,
            props: objectsById.value[drag.objectId]?.props,
            x: drag.startObjectX,
            y: drag.startObjectY,
            width: drag.startWidth,
            height: drag.startHeight,
          },
          drag.handle
        )
      : null;
    const nextRect = resizeSnapResult?.rect || rawRect;

    activeSnap.value = resizeSnapResult?.activeSnap || { x: null, y: null };
    selectionStore.activeHandle = drag.handle;
    if (insidePage) {
      viewportStore.setPointerCoordinate(point.x, point.y, true);
    } else {
      viewportStore.clearCoordinateReadout();
    }
    documentStore.updateObjectProps(drag.objectId, nextRect);
    return;
  }

  const rawX = roundMm(drag.startObjectX + (point.x - drag.startPointerX));
  const rawY = roundMm(drag.startObjectY + (point.y - drag.startPointerY));
  const snapResult = snapEnabled.value
    ? resolveObjectSnap({
        x: rawX,
        y: rawY,
        width: drag.width,
        height: drag.height,
        pageWidthMm: pageWidthMm.value,
        pageHeightMm: pageHeightMm.value,
        verticalGuides: guidesVisible.value ? verticalGuides.value : [],
        horizontalGuides: guidesVisible.value ? horizontalGuides.value : [],
        gridSpacingMm: gridVisible.value ? gridDefinition.value.minorMm : null,
        pixelsPerUnit: props.pixelsPerUnit * props.zoom,
      })
    : null;
  const targetX = snapResult ? snapResult.x : rawX;
  const targetY = snapResult ? snapResult.y : rawY;
  const nextX = clampObjectPosition(targetX, drag.width, pageWidthMm.value);
  const nextY = clampObjectPosition(targetY, drag.height, pageHeightMm.value);

  activeSnap.value = snapResult?.activeSnap || { x: null, y: null };
  if (insidePage) {
    viewportStore.setPointerCoordinate(point.x, point.y, true);
  } else {
    viewportStore.clearCoordinateReadout();
  }
  documentStore.updateObjectProps(drag.objectId, {
    x: nextX,
    y: nextY,
  });
}

function onObjectPointerUp() {
  const drag = interactionState.value;

  if (!drag) {
    stopObjectDrag();
    return;
  }

  const currentObject = objectsById.value[drag.objectId];

  if (currentObject) {
    if (drag.mode === "resize") {
      const previousPatch = {
        x: drag.startObjectX,
        y: drag.startObjectY,
        width: drag.startWidth,
        height: drag.startHeight,
      };
      const nextPatch = {
        x: currentObject.x,
        y: currentObject.y,
        width: currentObject.width,
        height: currentObject.height,
      };

      if (
        previousPatch.x !== nextPatch.x ||
        previousPatch.y !== nextPatch.y ||
        previousPatch.width !== nextPatch.width ||
        previousPatch.height !== nextPatch.height
      ) {
        executeEditorCommand(
          historyStore,
          createTransformObjectCommand(documentStore, drag.objectId, previousPatch, nextPatch, "Resize")
        );
      }
    } else {
      const previousPatch = {
        x: drag.startObjectX,
        y: drag.startObjectY,
      };
      const nextPatch = {
        x: currentObject.x,
        y: currentObject.y,
      };

      if (previousPatch.x !== nextPatch.x || previousPatch.y !== nextPatch.y) {
        executeEditorCommand(historyStore, createMoveObjectCommand(documentStore, drag.objectId, previousPatch, nextPatch));
      }
    }
  }

  interactionState.value = null;
  selectionStore.activeHandle = null;
  activeSnap.value = {
    x: null,
    y: null,
  };
  stopObjectDrag();
}

onBeforeUnmount(() => {
  stopObjectDrag();
});
</script>

<style scoped lang="scss">
.paper-canvas {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #d8dee8;
  box-shadow: none;
}

.paper-canvas--outline-hidden {
  border-color: transparent;
}

.paper-canvas__grid,
.paper-canvas__corner-marks,
.paper-canvas__object-layer {
  position: absolute;
  inset: 0;
}

.paper-canvas__grid,
.paper-canvas__corner-marks {
  pointer-events: none;
}

.paper-canvas__safe-area {
  position: absolute;
  border: 1px dashed rgba(100, 116, 139, 0.55);
  background: rgba(248, 250, 252, 0.22);
  pointer-events: none;
}

.paper-canvas__safe-area.is-hidden {
  border-color: transparent;
  background: transparent;
}

.paper-canvas__safe-label {
  position: absolute;
  top: -1px;
  left: 14px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #64748b;
  font-size: 11px;
  line-height: 1.4;
}

.paper-canvas__corner-mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.75);
}

.paper-canvas__corner-mark--top-left {
  top: -1px;
  left: -1px;
  border-width: 1px 0 0 1px;
}

.paper-canvas__corner-mark--top-right {
  top: -1px;
  right: -1px;
  border-width: 1px 1px 0 0;
}

.paper-canvas__corner-mark--bottom-left {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 1px 1px;
}

.paper-canvas__corner-mark--bottom-right {
  right: -1px;
  bottom: -1px;
  border-width: 0 1px 1px 0;
}

.paper-canvas__print-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(15, 23, 42, 0.55);
  pointer-events: none;
}

.paper-canvas__snap-line {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.paper-canvas__snap-line--vertical {
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(244, 114, 182, 0.95);
}

.paper-canvas__snap-line--horizontal {
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(244, 114, 182, 0.95);
}

.paper-canvas__snap-label {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border: 1px solid rgba(244, 114, 182, 0.28);
  background: rgba(255, 255, 255, 0.96);
  color: #9d174d;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.paper-canvas__content-surface {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.paper-canvas__object-node {
  position: absolute;
  box-sizing: border-box;
}

.paper-canvas__object-content {
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden;
  border: 1px solid transparent;
  background: transparent;
}

.paper-canvas__binding-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1;
  max-width: calc(100% - 8px);
  padding: 1px 6px;
  border: 1px solid rgba(29, 78, 216, 0.18);
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.86);
  color: #1d4ed8;
  font-size: 9px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.paper-canvas__interaction-layer {
  position: absolute;
  inset: 0;
  padding: 0;
  margin: 0;
  border: 1px solid transparent;
  background: transparent;
  cursor: move;
}

.paper-canvas__object-node.is-hovered .paper-canvas__interaction-layer {
  border-style: dashed;
  border-color: rgba(148, 163, 184, 0.45);
}

.paper-canvas__object-node.is-selected .paper-canvas__interaction-layer {
  border-style: solid;
  border-color: rgba(59, 130, 246, 0.28);
}

.paper-canvas__object-node.is-dragging .paper-canvas__interaction-layer {
  border-style: dashed;
  border-color: rgba(37, 99, 235, 0.72);
}

.paper-canvas__selection-chrome {
  position: absolute;
  inset: -1px;
  pointer-events: none;
  border: 1px solid rgba(59, 130, 246, 0.98);
}

.paper-canvas__selection-handle {
  position: absolute;
  z-index: 2;
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1px solid #ffffff;
  background: #3b82f6;
}

.paper-canvas__selection-handle.is-active {
  background: #1d4ed8;
}

.paper-canvas__selection-corner,
.paper-canvas__selection-edge {
  position: absolute;
  background: #3b82f6;
}

.paper-canvas__selection-corner {
  width: 10px;
  height: 10px;
}

.paper-canvas__selection-corner--top-left {
  top: -1px;
  left: -1px;
}

.paper-canvas__selection-corner--top-right {
  top: -1px;
  right: -1px;
}

.paper-canvas__selection-corner--bottom-left {
  left: -1px;
  bottom: -1px;
}

.paper-canvas__selection-corner--bottom-right {
  right: -1px;
  bottom: -1px;
}

.paper-canvas__selection-edge--top,
.paper-canvas__selection-edge--bottom {
  left: 50%;
  width: 14px;
  height: 4px;
  transform: translateX(-50%);
}

.paper-canvas__selection-edge--top {
  top: -2px;
}

.paper-canvas__selection-edge--bottom {
  bottom: -2px;
}

.paper-canvas__selection-edge--left,
.paper-canvas__selection-edge--right {
  top: 50%;
  width: 4px;
  height: 14px;
  transform: translateY(-50%);
}

.paper-canvas__selection-edge--left {
  left: -2px;
}

.paper-canvas__selection-edge--right {
  right: -2px;
}

.paper-canvas__selection-handle--nw,
.paper-canvas__selection-handle--se {
  cursor: nwse-resize;
}

.paper-canvas__selection-handle--ne,
.paper-canvas__selection-handle--sw {
  cursor: nesw-resize;
}

.paper-canvas__selection-handle--n,
.paper-canvas__selection-handle--s {
  cursor: ns-resize;
}

.paper-canvas__selection-handle--e,
.paper-canvas__selection-handle--w {
  cursor: ew-resize;
}

.paper-canvas__selection-handle--nw {
  top: -5px;
  left: -5px;
}

.paper-canvas__selection-handle--n {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.paper-canvas__selection-handle--ne {
  top: -5px;
  right: -5px;
}

.paper-canvas__selection-handle--e {
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
}

.paper-canvas__selection-handle--se {
  right: -5px;
  bottom: -5px;
}

.paper-canvas__selection-handle--s {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.paper-canvas__selection-handle--sw {
  left: -5px;
  bottom: -5px;
}

.paper-canvas__selection-handle--w {
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
}

.paper-canvas__type-badge {
  position: absolute;
  top: -22px;
  left: -1px;
  padding: 1px 6px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  line-height: 1.6;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.paper-canvas__object-node.is-selected .paper-canvas__type-badge,
.paper-canvas__object-node.is-hovered .paper-canvas__type-badge {
  opacity: 1;
}

.paper-canvas__text-content,
.paper-canvas__page-number-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
}

.paper-canvas__page-number-content {
  min-width: 0;
}

.paper-canvas__image-shell {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.paper-canvas__image-content {
  width: 100%;
  height: 100%;
  display: block;
}

.paper-canvas__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  color: #6b7280;
}

.paper-canvas__image-placeholder span {
  font-size: 13px;
  font-weight: 600;
}

.paper-canvas__image-placeholder small {
  font-size: 11px;
}

.paper-canvas__line-shape {
  width: 100%;
  margin-top: auto;
  margin-bottom: auto;
  border-top-width: inherit;
  border-top-style: inherit;
  border-top-color: inherit;
}

.paper-canvas__rect-shape,
.paper-canvas__circle-shape {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.paper-canvas__circle-shape {
  border-radius: 999px;
}

.paper-canvas__barcode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: #ffffff;
}

.paper-canvas__barcode-bars {
  height: calc(100% - 20px);
  min-height: 24px;
  background-image:
    linear-gradient(
      90deg,
      #111827 0,
      #111827 2px,
      transparent 2px,
      transparent 4px,
      #111827 4px,
      #111827 7px,
      transparent 7px,
      transparent 9px,
      #111827 9px,
      #111827 10px,
      transparent 10px,
      transparent 12px
    );
  background-size: 12px 100%;
}

.paper-canvas__barcode-value {
  text-align: center;
  font-size: 11px;
  letter-spacing: 1px;
  color: #111827;
}

.paper-canvas__qrcode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  padding: 10px;
  background: #ffffff;
}

.paper-canvas__qrcode-grid {
  display: grid;
  width: 100%;
  flex: 1;
  min-height: 0;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border: 1px solid #111827;
}

.paper-canvas__qrcode-grid span {
  background: #ffffff;
}

.paper-canvas__qrcode-grid span.is-dark {
  background: #111827;
}

.paper-canvas__qrcode-caption {
  min-width: 0;
  color: #6b7280;
  font-size: 10px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-canvas__table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid currentColor;
  background: #ffffff;
  font-size: 10px;
  color: #111827;
  overflow: hidden;
}

.paper-canvas__binding-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.45);
  background: rgba(248, 250, 252, 0.9);
}

.paper-canvas__binding-pill {
  max-width: 100%;
  padding: 1px 6px;
  border: 1px solid rgba(59, 130, 246, 0.24);
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.68);
  font-size: 9px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paper-canvas__table-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
  background: rgba(248, 250, 252, 0.92);
}

.paper-canvas__table-head,
.paper-canvas__table-row,
.paper-canvas__table-footer {
  display: grid;
}

.paper-canvas__table-head {
  background: var(--table-head-background, rgba(148, 163, 184, 0.16));
  font-weight: 700;
  color: var(--table-head-color, #111827);
  min-height: var(--table-head-min-height, auto);
}

.paper-canvas__table-head span,
.paper-canvas__table-row span,
.paper-canvas__table-footer span {
  padding: var(--table-cell-padding-y, 4px) var(--table-cell-padding-x, 6px);
  border-right: var(--table-grid-border-width, 1px) var(--table-grid-border-style, solid)
    var(--table-grid-border-color, currentColor);
  border-bottom: var(--table-grid-border-width, 1px) var(--table-grid-border-style, solid)
    var(--table-grid-border-color, currentColor);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.paper-canvas__table-head span:last-child,
.paper-canvas__table-row span:last-child,
.paper-canvas__table-footer span:last-child {
  border-right: 0;
}

.paper-canvas__table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.paper-canvas__table-row {
  min-height: var(--table-row-min-height, 0);
}

.paper-canvas__table-omission {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.paper-canvas__table-footer {
  background: var(--table-footer-background, rgba(59, 130, 246, 0.08));
  font-weight: 600;
  color: var(--table-footer-color, #111827);
  min-height: var(--table-footer-min-height, auto);
}

.paper-canvas__table-footer:last-of-type span {
  border-bottom: 0;
}

.paper-canvas__multi-label-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.paper-canvas__multi-label-shell .paper-canvas__binding-strip {
  padding: 0;
  border-bottom: 0;
  background: transparent;
}

.paper-canvas__multi-label {
  display: grid;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 6px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.96));
}

.paper-canvas__multi-label-cell {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 6px;
  border: 1px dashed rgba(100, 116, 139, 0.7);
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  overflow: hidden;
}

.paper-canvas__multi-label-cell strong,
.paper-canvas__multi-label-cell small {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.paper-canvas__multi-label-cell strong {
  font-size: var(--multi-label-primary-size, 10px);
  font-weight: var(--multi-label-primary-weight, 700);
}

.paper-canvas__multi-label-cell small {
  color: var(--multi-label-secondary-color, #475569);
  font-size: var(--multi-label-secondary-size, 9px);
}

.paper-canvas__multi-label-index {
  position: absolute;
  top: 4px;
  right: 6px;
  color: var(--multi-label-index-color, #94a3b8);
  font-size: var(--multi-label-index-size, 8px);
  line-height: 1;
}

.paper-canvas__generic-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
}

.paper-canvas__empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px;
  text-align: center;
}

.paper-canvas__empty-badge {
  padding: 7px 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.paper-canvas__empty-state h2 {
  margin: 0;
  max-width: 460px;
  font-size: 24px;
  line-height: 1.35;
  color: #111827;
}

.paper-canvas__empty-state p {
  margin: 0;
  max-width: 460px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}

.paper-canvas__empty-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.paper-canvas__empty-chip {
  padding: 4px 8px;
  border: 1px solid #dbe4ef;
  background: #f8fbff;
  color: #49688f;
}
</style>
