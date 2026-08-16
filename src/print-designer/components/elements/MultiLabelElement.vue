<template>
  <div class="pd-multi-label-element">
    <span v-if="binding" class="pd-multi-label-element__binding">{{ binding }}</span>
    <div class="pd-multi-label-element__grid" :style="gridStyle">
      <div v-for="cell in cells" :key="cell.key" class="pd-multi-label-element__cell" :style="cellStyle(cell)">
        <span class="pd-multi-label-element__index">{{ cell.index }}</span>
        <strong>{{ cell.primary }}</strong>
        <small v-if="cell.secondary">{{ cell.secondary }}</small>
        <small v-if="cell.tertiary">{{ cell.tertiary }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { computed } from "vue";
import { mmToCssPx } from "../../editor/measurement.js";
import { resolveRelativeRecordPath } from "../../runtime/propertySemantics.js";
import { previewForeground } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const config = computed((): any => ({
    rows: Math.max(1, Number(props.object.props?.rows) || 1),
    cols: Math.max(1, Number(props.object.props?.cols) || 1),
    gapX: Math.max(0, Number(props.object.props?.gapX) || 0),
    gapY: Math.max(0, Number(props.object.props?.gapY) || 0),
    direction: props.object.props?.direction === "column" ? "column" : "row",
})) as any;
const binding = computed((): any => props.object.props?.dataVariable ? `数据：{{${props.object.props.dataVariable}}}` : "") as any;
const gridStyle = computed((): any => ({
    gridTemplateColumns: `repeat(${config.value.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.value.rows}, minmax(0, 1fr))`,
    columnGap: `${mmToCssPx(config.value.gapX)}px`,
    rowGap: `${mmToCssPx(config.value.gapY)}px`,
})) as any;
const cells = computed((): any => {
    const total = config.value.rows * config.value.cols;
    const sampleData = Array.isArray(props.object.props?.sampleData) ? props.object.props.sampleData : [];
    return Array.from({ length: total }, (_: any, index: any): any => {
        const row = config.value.direction === "column" ? (index % config.value.rows) + 1 : Math.floor(index / config.value.cols) + 1;
        const column = config.value.direction === "column" ? Math.floor(index / config.value.rows) + 1 : (index % config.value.cols) + 1;
        const item = sampleData[index];
        const paths = {
            primary: props.object.props?.primaryPath || "title",
            secondary: props.object.props?.secondaryPath || "",
            tertiary: props.object.props?.tertiaryPath || "",
        };
        const getValue = (path: any): any => {
            if (item && typeof item === "object") {
                const result = resolveRelativeRecordPath(item, path);
                if (result.found && result.value != null)
                    return String(result.value);
            }
            if (item != null && (typeof item === "string" || typeof item === "number") && path === paths.primary)
                return String(item);
            return props.object.props?.dataVariable && path ? `{{${props.object.props.dataVariable}[${index}].${path}}}` : "";
        };
        return {
            key: `${props.object.id}-${index}`,
            row,
            column,
            index: `#${index + 1}`,
            primary: getValue(paths.primary) || "标签内容",
            secondary: getValue(paths.secondary),
            tertiary: getValue(paths.tertiary),
        };
    });
}) as any;
function cellStyle(cell: any): any {
    const style = props.object.style || {};
    const borderWidth = Math.max(0, Number(style.borderWidth) || 0);
    const padding = Math.max(0, Number(props.object.props?.cellPadding ?? style.padding) || 0);
    const color = previewForeground(props.object);
    const fontSize = Math.max(8, Number(style.fontSize) || 10);
    const alignment = style.textAlign || "left";
    const verticalAlignment = style.verticalAlign || "top";
    return {
        gridRow: String(cell.row),
        gridColumn: String(cell.column),
        alignItems: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
        justifyContent: verticalAlignment === "middle" ? "center" : verticalAlignment === "bottom" ? "flex-end" : "flex-start",
        padding: `${mmToCssPx(padding)}px`,
        border: `${borderWidth}px ${style.borderStyle || "solid"} ${borderWidth ? style.borderColor || color : "transparent"}`,
        borderRadius: `${Math.max(0, Number(style.borderRadius) || 0)}px`,
        background: style.backgroundColor && style.backgroundColor !== "transparent" ? style.backgroundColor : "#ffffff",
        color,
        fontFamily: style.fontFamily || undefined,
        fontSize: `${fontSize}px`,
        fontStyle: style.fontStyle || "normal",
        fontWeight: style.fontWeight || "normal",
        lineHeight: style.lineHeight || 1.35,
        letterSpacing: `${Number(style.letterSpacing) || 0}px`,
        textAlign: alignment,
    };
}
</script>

<style scoped lang="scss">
.pd-multi-label-element {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 4px;
}

.pd-multi-label-element__binding {
  align-self: flex-start;
  max-width: 100%;
  padding: 1px 5px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-multi-label-element__grid {
  display: grid;
  min-height: 0;
  flex: 1;
  padding: 3px;
  background: #f1f5f9;
  overflow: hidden;
}

.pd-multi-label-element__cell {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.pd-multi-label-element__cell strong,
.pd-multi-label-element__cell small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-multi-label-element__cell strong {
  padding-right: 16px;
}

.pd-multi-label-element__cell small {
  opacity: 0.75;
  font-size: 0.84em;
}

.pd-multi-label-element__index {
  position: absolute;
  top: 3px;
  right: 4px;
  color: currentColor;
  font-size: 0.72em;
  font-weight: 600;
  opacity: 0.52;
  line-height: 1;
}
</style>
