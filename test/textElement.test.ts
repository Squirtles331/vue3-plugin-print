// @vitest-environment jsdom
import assert from 'node:assert/strict'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { it } from 'vitest'
import { nextTick } from 'vue'
import TextElement from '../src/print-designer/components/elements/TextElement.vue'
import PaperCanvas from '../src/print-designer/components/layout/PaperCanvas.vue'
import { useEditorDocumentStore } from '../src/print-designer/editor/stores/documentStore.js'
import { useEditorHistoryStore } from '../src/print-designer/editor/stores/historyStore.js'
import { useEditorPreviewStore } from '../src/print-designer/editor/stores/previewStore.js'
import { useEditorSelectionStore } from '../src/print-designer/editor/stores/selectionStore.js'

function createTextObject(overrides = {}) {
  return {
    id: 'text-1',
    type: 'text',
    content: 'Draft text',
    variable: '',
    locked: false,
    x: 10,
    y: 10,
    width: 40,
    height: 10,
    style: {
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      verticalAlign: 'top',
      color: '#111827',
    },
    props: {
      writingMode: 'horizontal-tb',
      whiteSpace: 'pre-wrap',
      ...overrides.props,
    },
    ...overrides,
  }
}
function createMountedText(object, { selected = true, runtimeData = {} } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const documentStore = useEditorDocumentStore()
  const historyStore = useEditorHistoryStore()
  const previewStore = useEditorPreviewStore()
  const selectionStore = useEditorSelectionStore()
  documentStore.addObject(object)
  previewStore.setRuntimeData(runtimeData)
  if (selected)
    selectionStore.select(object.id)
  const wrapper = mount(TextElement, { props: { object }, attachTo: document.body, global: { plugins: [pinia] } })
  return { wrapper, documentStore, historyStore, previewStore, selectionStore }
}
it('text element resolves bound preview data without changing the authored fallback', async () => {
  const object = createTextObject({
    content: 'Fallback title',
    variable: 'invoice.customer.name',
    props: { sampleValue: 'Sample customer' },
  })
  const { wrapper, previewStore } = createMountedText(object, { selected: false, runtimeData: { invoice: { customer: { name: 'Ada' } } } })
  assert.equal(wrapper.find('.pd-text-element__value').text(), 'Ada')
  previewStore.setRuntimeData({})
  await nextTick()
  assert.equal(wrapper.find('.pd-text-element__value').text(), 'Sample customer')
  assert.equal(object.content, 'Fallback title')
  wrapper.unmount()
})
it('selected text commits the authored fallback once and keeps runtime data read-only', async () => {
  const object = createTextObject({ content: 'Fallback', variable: 'customer.name' })
  const { wrapper, documentStore, historyStore, previewStore } = createMountedText(object, { runtimeData: { customer: { name: 'Ada' } } })
  await wrapper.find('.pd-text-element__value').trigger('dblclick')
  const editor = wrapper.find('textarea')
  assert.equal(editor.exists(), true)
  await editor.setValue('Edited fallback')
  await editor.trigger('keydown', { key: 'Enter', shiftKey: false, isComposing: false })
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].content, 'Edited fallback')
  assert.deepEqual(previewStore.runtimeData, { customer: { name: 'Ada' } })
  assert.equal(historyStore.undoStack.length, 1)
  historyStore.undo()
  assert.equal(documentStore.objectsById[object.id].content, 'Fallback')
  historyStore.redo()
  assert.equal(documentStore.objectsById[object.id].content, 'Edited fallback')
  wrapper.unmount()
})
it('text inline editing preserves Shift+Enter and cancels with Escape', async () => {
  const object = createTextObject()
  const { wrapper, documentStore, historyStore } = createMountedText(object)
  await wrapper.find('.pd-text-element__value').trigger('dblclick')
  const editor = wrapper.find('textarea')
  await editor.setValue('First line\nSecond line')
  await editor.trigger('keydown', { key: 'Enter', shiftKey: true, isComposing: false })
  assert.equal(wrapper.find('textarea').exists(), true)
  await editor.trigger('keydown', { key: 'Escape' })
  await nextTick()
  assert.equal(wrapper.find('textarea').exists(), false)
  assert.equal(documentStore.objectsById[object.id].content, 'Draft text')
  assert.equal(historyStore.undoStack.length, 0)
  wrapper.unmount()
})
it('text inline editing commits on blur', async () => {
  const object = createTextObject()
  const { wrapper, documentStore, historyStore } = createMountedText(object)
  await wrapper.find('.pd-text-element__value').trigger('dblclick')
  const editor = wrapper.find('textarea')
  await editor.setValue('Saved on blur')
  await editor.trigger('blur')
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].content, 'Saved on blur')
  assert.equal(historyStore.undoStack.length, 1)
  wrapper.unmount()
})
it('text inline editing saves when its selection changes', async () => {
  const object = createTextObject()
  const other = createTextObject({ id: 'text-2' })
  const { wrapper, documentStore, selectionStore } = createMountedText(object)
  documentStore.addObject(other)
  await wrapper.find('.pd-text-element__value').trigger('dblclick')
  await wrapper.find('textarea').setValue('Saved on switch')
  selectionStore.select(other.id)
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].content, 'Saved on switch')
  wrapper.unmount()
})
it('quick toolbar formats a single unlocked text element and stays hidden for locked text', async () => {
  const object = createTextObject()
  const { wrapper, documentStore, historyStore } = createMountedText(object)
  await nextTick()
  const boldButton = document.body.querySelector('button[aria-label=\'粗体\']')
  assert.ok(boldButton)
  boldButton.click()
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].style.fontWeight, 'bold')
  assert.equal(historyStore.undoStack.length, 1)
  await wrapper.setProps({ object: documentStore.objectsById[object.id] })
  const writingButton = document.body.querySelector('button[aria-label=\'竖排文字\']')
  assert.ok(writingButton)
  writingButton.click()
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].props.writingMode, 'vertical-rl')
  await wrapper.setProps({ object: documentStore.objectsById[object.id] })
  const fontSizeInput = document.body.querySelector('input[aria-label=\'字号\']')
  assert.ok(fontSizeInput)
  fontSizeInput.value = '999'
  fontSizeInput.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
  assert.equal(documentStore.objectsById[object.id].style.fontSize, 240)
  wrapper.unmount()
  const locked = createTextObject({ id: 'text-locked', locked: true })
  const mountedLocked = createMountedText(locked)
  await nextTick()
  assert.equal(mountedLocked.wrapper.find('textarea').exists(), false)
  assert.equal(document.body.querySelector('.pd-text-element__quick-toolbar'), null)
  mountedLocked.wrapper.unmount()
})
it('paper canvas gives only selected unlocked text elements direct content interaction', async () => {
  const object = createTextObject()
  const pinia = createPinia()
  setActivePinia(pinia)
  const documentStore = useEditorDocumentStore()
  const selectionStore = useEditorSelectionStore()
  documentStore.addObject(object)
  selectionStore.select(object.id)
  const wrapper = mount(PaperCanvas, { props: { pixelsPerUnit: 3.78 }, global: { plugins: [pinia] } })
  await nextTick()
  assert.equal(wrapper.find('.paper-canvas__interaction-layer').classes().includes('is-content-editing'), true)
  selectionStore.clearSelection()
  await nextTick()
  assert.equal(wrapper.find('.paper-canvas__interaction-layer').classes().includes('is-content-editing'), false)
  wrapper.unmount()
})
