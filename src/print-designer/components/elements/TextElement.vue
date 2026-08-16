<script setup lang="ts">
import { FONT_FAMILY_OPTIONS } from '../../core/textFormatting.js'
import { createUpdateObjectPropsCommand } from '../../editor/commands/documentCommands.js'
import { executeEditorCommand } from '../../editor/commands/executeCommand.js'
import { createUpdateTextFormattingCommand } from '../../editor/commands/textCommands.js'
import { useEditorDocumentStore } from '../../editor/stores/documentStore.js'
import { useEditorHistoryStore } from '../../editor/stores/historyStore.js'
import { useEditorPreviewStore } from '../../editor/stores/previewStore.js'
import { useEditorSelectionStore } from '../../editor/stores/selectionStore.js'
import { useEditorViewportStore } from '../../editor/stores/viewportStore.js'
import { resolveDataPath } from '../../runtime/dataResolver.js'
import { bindingLabel, textStyle } from './elementPreview.js'

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['start-object-drag'])
const documentStore = useEditorDocumentStore()
const historyStore = useEditorHistoryStore()
const previewStore = useEditorPreviewStore()
const selectionStore = useEditorSelectionStore()
const viewportStore = useEditorViewportStore()
const { runtimeData } = storeToRefs(previewStore)
const { selectedIds } = storeToRefs(selectionStore)
const { zoom } = storeToRefs(viewportStore)
const rootRef = ref(null)
const editorRef = ref(null)
const toolbarRef = ref(null)
const isInlineEditing = ref(false)
const editingValue = ref('')
const toolbarPosition = ref({ visible: false, left: 0, top: 0, placement: 'above' })
let resizeObserver = null
const canEditText = computed(() => selectedIds.value.length === 1 && selectedIds.value[0] === props.object.id && !props.object.locked)
const showQuickToolbar = computed(() => canEditText.value && !isInlineEditing.value)
const binding = computed(() => bindingLabel(props.object))
const hasValue = computed(() => Boolean(props.object?.variable || String(props.object?.content || '').trim()))
const previewValue = computed(() => resolvePreviewValue(props.object, runtimeData.value))
const contentStyle = computed(() => textStyle(props.object))
const fontFamilyValue = computed(() => props.object?.style?.fontFamily || '')
const fontSizeValue = computed(() => clampFontSize(props.object?.style?.fontSize))
const textAlignValue = computed(() => props.object?.style?.textAlign || 'left')
const verticalAlignValue = computed(() => props.object?.style?.verticalAlign || 'top')
const isBold = computed(() => ['bold', '700'].includes(String(props.object?.style?.fontWeight || '')))
const isItalic = computed(() => props.object?.style?.fontStyle === 'italic')
const isUnderline = computed(() => props.object?.style?.textDecoration === 'underline')
const isVertical = computed(() => props.object?.props?.writingMode === 'vertical-rl')
const quickToolbarStyle = computed(() => ({
  display: toolbarPosition.value.visible ? 'flex' : 'none',
  left: `${toolbarPosition.value.left}px`,
  top: `${toolbarPosition.value.top}px`,
}))
const horizontalAlignButtons = [
  { label: '左', value: 'left', ariaLabel: '左对齐' },
  { label: '中', value: 'center', ariaLabel: '水平居中' },
  { label: '右', value: 'right', ariaLabel: '右对齐' },
]
const verticalAlignButtons = [
  { label: '上', value: 'top', ariaLabel: '顶端对齐' },
  { label: '中', value: 'middle', ariaLabel: '垂直居中' },
  { label: '下', value: 'bottom', ariaLabel: '底端对齐' },
]
function normalizeBinding(variable) {
  return String(variable || '').trim().replace(/^@/, '')
}
function resolvePreviewValue(object, data) {
  const variable = normalizeBinding(object?.variable)
  if (variable) {
    const result = resolveDataPath(data, variable)
    if (result.found) {
      return result.value == null ? '' : String(result.value)
    }
    const sampleValue = object?.props?.sampleValue
    if (sampleValue != null && String(sampleValue).trim() !== '') {
      return String(sampleValue)
    }
    return `{{${variable}}}`
  }
  const content = object?.content
  return content != null && String(content).trim() !== '' ? String(content) : '输入文本'
}
function clampFontSize(value) {
  const parsed = Number(value)
  return Math.min(240, Math.max(1, Number.isFinite(parsed) ? Math.round(parsed) : 14))
}
function emitDrag(event) {
  if (canEditText.value) {
    emit('start-object-drag', event)
  }
}
async function startInlineEdit() {
  if (!canEditText.value)
    return
  editingValue.value = String(props.object?.content || '')
  isInlineEditing.value = true
  await nextTick()
  editorRef.value?.focus?.()
  editorRef.value?.select?.()
}
function commitInlineEdit() {
  if (!isInlineEditing.value)
    return
  const nextValue = editingValue.value
  const previousValue = String(props.object?.content || '')
  isInlineEditing.value = false
  editingValue.value = ''
  if (nextValue === previousValue || props.object?.locked)
    return
  const command = createUpdateObjectPropsCommand(documentStore, props.object.id, { content: nextValue })
  if (!command)
    return
  command.label = '编辑文本内容'
  executeEditorCommand(historyStore, command)
}
function cancelInlineEdit() {
  if (!isInlineEditing.value)
    return
  isInlineEditing.value = false
  editingValue.value = ''
}
function handleEditorKeydown(event) {
  event.stopPropagation()
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelInlineEdit()
  }
  else if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    commitInlineEdit()
  }
}
function updateTextFormat(stylePatch = {}, propsPatch = {}) {
  if (!canEditText.value)
    return
  const command = createUpdateTextFormattingCommand(documentStore, props.object.id, stylePatch, propsPatch)
  if (command) {
    executeEditorCommand(historyStore, command)
  }
}
function setFontFamily(value) {
  updateTextFormat({ fontFamily: value })
}
function commitFontSize(value) {
  updateTextFormat({ fontSize: clampFontSize(value) })
}
function changeFontSize(delta) {
  commitFontSize(fontSizeValue.value + delta)
}
function setTextAlign(value) {
  updateTextFormat({ textAlign: value })
}
function setVerticalAlign(value) {
  updateTextFormat({ verticalAlign: value })
}
function toggleBold() {
  updateTextFormat({ fontWeight: isBold.value ? 'normal' : 'bold' })
}
function toggleItalic() {
  updateTextFormat({ fontStyle: isItalic.value ? 'normal' : 'italic' })
}
function toggleUnderline() {
  updateTextFormat({ textDecoration: isUnderline.value ? 'none' : 'underline' })
}
function toggleWritingMode() {
  updateTextFormat({}, { writingMode: isVertical.value ? 'horizontal-tb' : 'vertical-rl' })
}
async function updateToolbarPosition() {
  if (!showQuickToolbar.value || !rootRef.value) {
    toolbarPosition.value = { ...toolbarPosition.value, visible: false }
    return
  }
  await nextTick()
  if (!showQuickToolbar.value || !rootRef.value) {
    toolbarPosition.value = { ...toolbarPosition.value, visible: false }
    return
  }
  const anchor = rootRef.value.getBoundingClientRect()
  const toolbar = toolbarRef.value
  const toolbarWidth = toolbar?.offsetWidth || 460
  const toolbarHeight = toolbar?.offsetHeight || 36
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || toolbarWidth + 16
  const left = Math.max(8, Math.min(anchor.left, Math.max(8, viewportWidth - toolbarWidth - 8)))
  const placeBelow = anchor.top < toolbarHeight + 12
  toolbarPosition.value = {
    visible: true,
    left,
    top: placeBelow ? anchor.bottom + 8 : Math.max(8, anchor.top - toolbarHeight - 8),
    placement: placeBelow ? 'below' : 'above',
  }
}
watch(() => selectedIds.value.join(','), () => {
  if (isInlineEditing.value && !canEditText.value) {
    commitInlineEdit()
  }
})
watch(showQuickToolbar, () => {
  updateToolbarPosition()
})
watch(() => [props.object?.x, props.object?.y, props.object?.width, props.object?.height, props.object?.rotation, zoom.value], () => {
  updateToolbarPosition()
})
onMounted(() => {
  window.addEventListener('resize', updateToolbarPosition)
  window.addEventListener('scroll', updateToolbarPosition, true)
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(updateToolbarPosition)
    resizeObserver.observe(rootRef.value)
  }
  updateToolbarPosition()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateToolbarPosition)
  window.removeEventListener('scroll', updateToolbarPosition, true)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="pd-text-element"
    :class="{ 'is-placeholder': !hasValue, 'is-editable': canEditText, 'is-inline-editing': isInlineEditing }"
    :style="contentStyle"
    @pointerdown.stop
  >
    <template v-if="canEditText">
      <span class="pd-text-element__drag-zone pd-text-element__drag-zone--top" @pointerdown.stop="emitDrag" />
      <span class="pd-text-element__drag-zone pd-text-element__drag-zone--right" @pointerdown.stop="emitDrag" />
      <span class="pd-text-element__drag-zone pd-text-element__drag-zone--bottom" @pointerdown.stop="emitDrag" />
      <span class="pd-text-element__drag-zone pd-text-element__drag-zone--left" @pointerdown.stop="emitDrag" />
    </template>

    <textarea
      v-if="isInlineEditing"
      ref="editorRef"
      class="pd-text-element__editor"
      :value="editingValue"
      aria-label="编辑文本"
      @input="editingValue = ($event.target as HTMLInputElement).value"
      @pointerdown.stop
      @keydown="handleEditorKeydown"
      @blur="commitInlineEdit"
    />
    <template v-else>
      <span v-if="binding" class="pd-text-element__binding">{{ binding }}</span>
      <span class="pd-text-element__value" @dblclick.stop="startInlineEdit">{{ previewValue }}</span>
    </template>
  </div>

  <Teleport to="body">
    <section
      v-if="showQuickToolbar"
      ref="toolbarRef"
      class="pd-text-element__quick-toolbar"
      :class="`is-${toolbarPosition.placement}`"
      :style="quickToolbarStyle"
      v-bind="{ 'data-print-exclude': 'true' }"
      aria-label="文本快速格式"
      @pointerdown.stop
      @dblclick.stop
    >
      <select
        class="pd-text-element__toolbar-font"
        :value="fontFamilyValue"
        aria-label="字体"
        @change="setFontFamily(($event.target as HTMLInputElement).value)"
      >
        <option v-for="option in FONT_FAMILY_OPTIONS" :key="option.value || '__default__'" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <span class="pd-text-element__toolbar-divider" />

      <div class="pd-text-element__toolbar-size">
        <button type="button" aria-label="减小字号" @click="changeFontSize(-1)">
          −
        </button>
        <input
          :value="fontSizeValue"
          type="number"
          min="1"
          max="240"
          step="1"
          aria-label="字号"
          @change="commitFontSize(($event.target as HTMLInputElement).value)"
        >
        <button type="button" aria-label="增大字号" @click="changeFontSize(1)">
          +
        </button>
      </div>

      <span class="pd-text-element__toolbar-divider" />

      <div class="pd-text-element__toolbar-group">
        <button
          v-for="option in horizontalAlignButtons"
          :key="option.value"
          type="button"
          :class="{ 'is-active': textAlignValue === option.value }"
          :aria-label="option.ariaLabel"
          @click="setTextAlign(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="pd-text-element__toolbar-group">
        <button
          v-for="option in verticalAlignButtons"
          :key="option.value"
          type="button"
          :class="{ 'is-active': verticalAlignValue === option.value }"
          :aria-label="option.ariaLabel"
          @click="setVerticalAlign(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <span class="pd-text-element__toolbar-divider" />

      <div class="pd-text-element__toolbar-group">
        <button type="button" :class="{ 'is-active': isBold }" aria-label="粗体" @click="toggleBold">
          <strong>B</strong>
        </button>
        <button type="button" :class="{ 'is-active': isItalic }" aria-label="斜体" @click="toggleItalic">
          <em>I</em>
        </button>
        <button type="button" :class="{ 'is-active': isUnderline }" aria-label="下划线" @click="toggleUnderline">
          <u>U</u>
        </button>
        <button type="button" :class="{ 'is-active': isVertical }" aria-label="竖排文字" @click="toggleWritingMode">
          竖
        </button>
      </div>
    </section>
  </Teleport>
</template>

<style scoped lang="scss">
.pd-text-element {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.pd-text-element.is-placeholder {
  color: #94a3b8 !important;
}

.pd-text-element__value {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
}

.pd-text-element__binding {
  position: absolute;
  top: 3px;
  right: 4px;
  z-index: 2;
  max-width: calc(100% - 8px);
  padding: 1px 5px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 999px;
  background: rgba(239, 246, 255, 0.94);
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.35;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.pd-text-element__editor {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-align: inherit;
  text-decoration: inherit;
  white-space: pre-wrap;
  writing-mode: inherit;
}

.pd-text-element__drag-zone {
  position: absolute;
  z-index: 5;
  display: block;
}

.pd-text-element__drag-zone--top,
.pd-text-element__drag-zone--bottom {
  right: 5px;
  left: 5px;
  height: 5px;
  cursor: move;
}

.pd-text-element__drag-zone--top { top: -2px; }
.pd-text-element__drag-zone--bottom { bottom: -2px; }

.pd-text-element__drag-zone--left,
.pd-text-element__drag-zone--right {
  top: 5px;
  bottom: 5px;
  width: 5px;
  cursor: move;
}

.pd-text-element__drag-zone--left { left: -2px; }
.pd-text-element__drag-zone--right { right: -2px; }

.pd-text-element__quick-toolbar {
  position: fixed;
  z-index: 2000;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 4px 7px;
  border: 1px solid #d7dee8;
  border-radius: 6px;
  background: #f8fafc;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
  color: #374151;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.pd-text-element__toolbar-font {
  width: 130px;
  height: 26px;
  border: 1px solid #d9e1ea;
  border-radius: 3px;
  background: #ffffff;
  color: inherit;
  font: inherit;
}

.pd-text-element__toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dce3ec;
}

.pd-text-element__toolbar-size,
.pd-text-element__toolbar-group {
  display: flex;
  align-items: center;
  gap: 3px;
}

.pd-text-element__toolbar-size input {
  width: 38px;
  height: 24px;
  padding: 0 2px;
  border: 1px solid #d9e1ea;
  border-radius: 3px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  text-align: center;
}

.pd-text-element__quick-toolbar button {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #d9e1ea;
  border-radius: 3px;
  background: #ffffff;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.pd-text-element__quick-toolbar button:hover,
.pd-text-element__quick-toolbar button.is-active {
  border-color: var(--pd-accent-border, #93c5fd);
  background: var(--pd-accent-bg, #eff6ff);
  color: var(--pd-accent-text, #1d4ed8);
}
</style>
