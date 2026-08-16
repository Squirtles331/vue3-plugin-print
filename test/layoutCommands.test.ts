import { describe, expect, it } from 'vitest'
import { createAlignmentPatches, createDistributionPatches, createDuplicateObjects, createOrderIds, createPatchTransactionCommand, getEditableSelection, getSelectionBounds } from '../src/print-designer/editor/commands/layoutCommands.js'
import { serializeTemplateDocument } from '../src/print-designer/template/templateDocument.js'

const page = { widthMm: 100, heightMm: 80 }
const objects = {
  alpha: { id: 'alpha', type: 'text', pageId: 'page-1', x: 10, y: 12, width: 20, height: 8, locked: false, props: {}, style: {} },
  beta: { id: 'beta', type: 'text', pageId: 'page-1', x: 54, y: 24, width: 10, height: 8, locked: false, props: {}, style: {} },
  gamma: { id: 'gamma', type: 'text', pageId: 'page-1', x: 76, y: 52, width: 16, height: 8, locked: false, props: {}, style: {} },
  locked: { id: 'locked', type: 'text', pageId: 'page-1', x: 40, y: 32, width: 10, height: 8, locked: true, props: {}, style: {} },
}
describe('layout commands', () => {
  it('uses document coordinates independently of viewport zoom and excludes locked elements', () => {
    const selected = getEditableSelection(objects, ['alpha', 'locked', 'beta'], 'page-1')
    expect(selected.map(object => object.id)).toEqual(['alpha', 'beta'])
    expect(getSelectionBounds(selected)).toMatchObject({ left: 10, top: 12, right: 64, bottom: 32 })
    const atSmallZoom = createAlignmentPatches(selected, 'right', page)
    const atLargeZoom = createAlignmentPatches(selected, 'right', page)
    expect(atSmallZoom).toEqual(atLargeZoom)
    expect(atSmallZoom).toEqual([
      { id: 'alpha', patch: { x: 44 } },
      { id: 'beta', patch: { x: 54 } },
    ])
  })
  it('distributes inside the selection bounds and clamps duplicate positions to the page by default', () => {
    const selection = [objects.alpha, objects.beta, objects.gamma]
    expect(createDistributionPatches(selection, 'horizontal', page)).toEqual([
      { id: 'alpha', patch: {} },
      { id: 'beta', patch: { x: 48 } },
      { id: 'gamma', patch: { x: 76 } },
    ])
    const copies = createDuplicateObjects([{ ...objects.gamma, x: 96, y: 76 }], page, { offsetMm: 8 })
    expect(copies[0]).toMatchObject({ pageId: 'page-1', x: 84, y: 72 })
    expect(copies[0].id).not.toBe('gamma')
  })
  it('keeps locked z-order slots fixed while moving editable selections', () => {
    const next = createOrderIds(['alpha', 'locked', 'beta', 'gamma'], objects, ['alpha', 'gamma'], 'front')
    expect(next).toEqual(['beta', 'locked', 'alpha', 'gamma'])
  })
  it('uses one history transaction and serializes no viewport state', () => {
    const state = {
      objectsById: { alpha: { ...objects.alpha }, beta: { ...objects.beta } },
      calls: [],
      applyObjectPatches(patches) {
        this.calls.push(patches)
        patches.forEach(({ id, patch }) => {
          this.objectsById[id] = { ...this.objectsById[id], ...patch }
        })
        return true
      },
    }
    const command = createPatchTransactionCommand(state, 'Align left', [
      { id: 'alpha', patch: { x: 8 } },
      { id: 'beta', patch: { x: 8 } },
    ])
    command.execute()
    command.undo()
    expect(state.calls).toHaveLength(2)
    expect(state.objectsById.alpha.x).toBe(10)
    expect(state.objectsById.beta.x).toBe(54)
    const serialized = serializeTemplateDocument({
      schemaVersion: 2,
      id: 'layout-document',
      meta: { name: 'Layout document', unit: 'mm' },
      pageSettings: { paper: page, margin: { top: 0, right: 0, bottom: 0, left: 0 } },
      pages: [{ id: 'page-1', elements: [objects.alpha] }],
      viewport: { zoom: 4, guides: [10] },
    })
    expect(serialized).not.toHaveProperty('viewport')
  })
})
