<script setup lang="ts">
const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
  },
  axisLengthPx: {
    type: Number,
    default: 0,
  },
  thicknessPx: {
    type: Number,
    default: 26,
  },
  originPx: {
    type: Number,
    default: 0,
  },
  pixelsPerUnit: {
    type: Number,
    default: 1,
  },
  visibleStartUnit: {
    type: Number,
    default: 0,
  },
  visibleEndUnit: {
    type: Number,
    default: 0,
  },
  pageStartUnit: {
    type: Number,
    default: 0,
  },
  pageEndUnit: {
    type: Number,
    default: 0,
  },
})
defineEmits(['guide-start'])
const canvasRef = ref(null)
let resizeObserver = null
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
function pickMajorStep(pixelsPerUnit) {
  const targetVisualGap = 56
  const unitGap = targetVisualGap / Math.max(pixelsPerUnit, 0.0001)
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]
  return steps.find(step => step >= unitGap) || steps[steps.length - 1]
}
function draw() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  const dpr = window.devicePixelRatio || 1
  const axisLength = Math.max(0, Math.round(props.axisLengthPx))
  const thickness = Math.max(0, Math.round(props.thicknessPx))
  const cssWidth = props.orientation === 'horizontal' ? axisLength : thickness
  const cssHeight = props.orientation === 'horizontal' ? thickness : axisLength
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  canvas.width = Math.max(1, Math.round(cssWidth * dpr))
  canvas.height = Math.max(1, Math.round(cssHeight * dpr))
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = '#fafbfd'
  ctx.fillRect(0, 0, cssWidth, cssHeight)
  ctx.strokeStyle = '#d9dee8'
  ctx.lineWidth = 1
  ctx.beginPath()
  if (props.orientation === 'horizontal') {
    ctx.moveTo(0, cssHeight - 0.5)
    ctx.lineTo(cssWidth, cssHeight - 0.5)
  }
  else {
    ctx.moveTo(cssWidth - 0.5, 0)
    ctx.lineTo(cssWidth - 0.5, cssHeight)
  }
  ctx.stroke()
  const pageStartPx = props.originPx + props.pageStartUnit * props.pixelsPerUnit
  const pageEndPx = props.originPx + props.pageEndUnit * props.pixelsPerUnit
  const pageMinPx = clamp(Math.min(pageStartPx, pageEndPx), 0, axisLength)
  const pageMaxPx = clamp(Math.max(pageStartPx, pageEndPx), 0, axisLength)
  if (pageMaxPx > pageMinPx) {
    ctx.fillStyle = 'rgba(230, 238, 248, 0.82)'
    if (props.orientation === 'horizontal') {
      ctx.fillRect(pageMinPx, 0, pageMaxPx - pageMinPx, cssHeight)
    }
    else {
      ctx.fillRect(0, pageMinPx, cssWidth, pageMaxPx - pageMinPx)
    }
  }
  ctx.beginPath()
  ctx.strokeStyle = '#94a3b8'
  ctx.fillStyle = '#6b7280'
  ctx.font = '9px sans-serif'
  ctx.textBaseline = 'top'
  const majorStep = pickMajorStep(props.pixelsPerUnit)
  const mediumStep = majorStep / 2
  const minorStep = majorStep / 5
  const startUnit = Math.floor(props.visibleStartUnit / minorStep) * minorStep
  for (let unit = startUnit; unit <= props.visibleEndUnit + minorStep; unit += minorStep) {
    const normalizedUnit = +unit.toFixed(4)
    const position = props.originPx + normalizedUnit * props.pixelsPerUnit
    if (position < -2 || position > axisLength + 2) {
      continue
    }
    const isMajor = Math.abs(normalizedUnit / majorStep - Math.round(normalizedUnit / majorStep)) < 0.0001
    const isMedium = !isMajor && Math.abs(normalizedUnit / mediumStep - Math.round(normalizedUnit / mediumStep)) < 0.0001
    const lineExtent = isMajor ? 12 : isMedium ? 9 : 6
    if (props.orientation === 'horizontal') {
      const aligned = Math.round(position) + 0.5
      ctx.moveTo(aligned, cssHeight - lineExtent)
      ctx.lineTo(aligned, cssHeight)
      if (isMajor) {
        ctx.fillText(`${+normalizedUnit.toFixed(1)}`, aligned + 2, 3)
      }
    }
    else {
      const aligned = Math.round(position) + 0.5
      ctx.moveTo(cssWidth - lineExtent, aligned)
      ctx.lineTo(cssWidth, aligned)
      if (isMajor) {
        ctx.save()
        ctx.translate(9, aligned + 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${+normalizedUnit.toFixed(1)}`, 0, 0)
        ctx.restore()
      }
    }
  }
  ctx.stroke()
}
function observeCanvas() {
  if (resizeObserver || !canvasRef.value?.parentElement) {
    return
  }
  resizeObserver = new ResizeObserver(() => {
    draw()
  })
  resizeObserver.observe(canvasRef.value.parentElement)
}
onMounted(() => {
  observeCanvas()
  draw()
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
watch(() => [
  props.orientation,
  props.axisLengthPx,
  props.thicknessPx,
  props.originPx,
  props.pixelsPerUnit,
  props.visibleStartUnit,
  props.visibleEndUnit,
  props.pageStartUnit,
  props.pageEndUnit,
], draw, { deep: true })
</script>

<template>
  <div class="designer-ruler" :class="[`designer-ruler--${orientation}`]" @pointerdown="$emit('guide-start', $event)">
    <canvas ref="canvasRef" class="designer-ruler__canvas" />
  </div>
</template>

<style scoped lang="scss">
.designer-ruler {
  position: relative;
  overflow: hidden;
  user-select: none;
  background: #fafbfd;
  cursor: crosshair;
}

.designer-ruler--horizontal {
  height: 26px;
}

.designer-ruler--vertical {
  width: 26px;
}

.designer-ruler__canvas {
  display: block;
}
</style>
