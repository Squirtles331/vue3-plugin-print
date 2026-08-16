<script setup lang="ts">
import { machineCodeOptions } from '../../runtime/propertySemantics.js'
import { encodedPreviewValue, hashPreviewSeed, previewForeground, previewPanelStyle } from './elementPreview.js'

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
})
const value = computed(() => encodedPreviewValue(props.object))
const options = computed(() => machineCodeOptions(props.object.props))
const frameStyle = computed(() => ({
  ...previewPanelStyle(props.object, '#ffffff'),
  padding: `${options.value.margin}px`,
}))
const valueStyle = computed(() => ({
  color: previewForeground(props.object),
  fontFamily: props.object.style?.fontFamily || 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: `${options.value.textFontSize}px`,
  fontWeight: props.object.style?.fontWeight || 'normal',
  letterSpacing: `${Number.isFinite(Number(props.object.style?.letterSpacing)) ? Number(props.object.style.letterSpacing) : 1}px`,
  textAlign: props.object.style?.textAlign || 'center',
  marginTop: `${options.value.textMargin}px`,
}))
const barsStyle = computed(() => {
  const seed = hashPreviewSeed(`${props.object.props?.format || 'CODE128'}:${value.value}`)
  const foreground = previewForeground(props.object)
  const segments = []
  let cursor = 0
  let dark = true
  for (let index = 0; index < 64 && cursor < 100; index += 1) {
    const width = ((seed >>> ((index * 5) % 24)) & 0x3) + 1
    const next = Math.min(100, cursor + width)
    const color = dark ? foreground : 'transparent'
    segments.push(`${color} ${cursor}%`, `${color} ${next}%`)
    cursor = next
    dark = !dark
  }
  return {
    backgroundImage: `linear-gradient(90deg, ${segments.join(', ')})`,
  }
})
</script>

<template>
  <div class="pd-barcode-element" :style="frameStyle">
    <div class="pd-barcode-element__quiet-zone">
      <div class="pd-barcode-element__bars" :style="barsStyle" />
    </div>
    <div v-if="options.displayValue !== false" class="pd-barcode-element__value" :style="valueStyle">
      {{ value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.pd-barcode-element {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.pd-barcode-element__quiet-zone {
  min-height: 0;
  flex: 1;
  padding: 0 7%;
  background: #ffffff;
}

.pd-barcode-element__bars {
  width: 100%;
  height: 100%;
  min-height: 17px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.pd-barcode-element__value {
  min-width: 0;
  overflow: hidden;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
