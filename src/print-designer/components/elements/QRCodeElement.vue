<template>
  <div class="pd-qrcode-element" :style="frameStyle">
    <div class="pd-qrcode-element__code" :style="gridStyle">
      <span v-for="cell in cells" :key="cell.key" :style="cell.dark ? darkCellStyle : lightCellStyle"></span>
    </div>
    <span class="pd-qrcode-element__caption">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">import { computed } from "vue";
import { machineCodeOptions } from "../../runtime/propertySemantics.js";
import { encodedPreviewValue, hashPreviewSeed, previewBackground, previewForeground, previewPanelStyle } from "./elementPreview.js";
const props = defineProps({
    object: {
        type: Object,
        required: true,
    },
}) as any;
const value = computed((): any => encodedPreviewValue(props.object)) as any;
const size = computed((): any => {
    switch (props.object.props?.eccLevel || "M") {
        case "L": return 21;
        case "Q": return 25;
        case "H": return 29;
        default: return 23;
    }
}) as any;
const frameStyle = computed((): any => ({
    ...previewPanelStyle(props.object, "#ffffff"),
    padding: `${machineCodeOptions(props.object.props).margin}px`,
})) as any;
const gridStyle = computed((): any => ({
    gridTemplateColumns: `repeat(${size.value}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${size.value}, minmax(0, 1fr))`,
    borderColor: previewForeground(props.object),
})) as any;
const darkCellStyle = computed((): any => ({ background: previewForeground(props.object) })) as any;
const lightCellStyle = computed((): any => ({ background: previewBackground(props.object) })) as any;
const cells = computed((): any => {
    const matrixSize = size.value;
    const seed = hashPreviewSeed(`${value.value}:${props.object.props?.eccLevel || "M"}`);
    const anchors = [
        { row: 0, column: 0 },
        { row: 0, column: matrixSize - 7 },
        { row: matrixSize - 7, column: 0 },
    ];
    return Array.from({ length: matrixSize * matrixSize }, (_: any, index: any): any => {
        const row = Math.floor(index / matrixSize);
        const column = index % matrixSize;
        const finder = anchors.find((anchor: any): any => row >= anchor.row && row < anchor.row + 7 && column >= anchor.column && column < anchor.column + 7);
        let dark;
        if (finder) {
            const finderRow = row - finder.row;
            const finderColumn = column - finder.column;
            dark = finderRow === 0 || finderRow === 6 || finderColumn === 0 || finderColumn === 6 || (finderRow >= 2 && finderRow <= 4 && finderColumn >= 2 && finderColumn <= 4);
        }
        else {
            dark = (((seed >>> ((row * 7 + column * 3) % 24)) & 1) ^ ((row * 5 + column * 3 + seed) % 7 < 3 ? 1 : 0)) === 1;
        }
        return { key: `${row}-${column}`, dark };
    });
}) as any;
</script>

<style scoped lang="scss">
.pd-qrcode-element {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
}

.pd-qrcode-element__code {
  display: grid;
  min-height: 0;
  flex: 1;
  border: 1px solid;
  background: #ffffff;
}

.pd-qrcode-element__caption {
  min-width: 0;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  line-height: 1.15;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
