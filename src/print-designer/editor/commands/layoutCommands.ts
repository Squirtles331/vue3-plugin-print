import type { TemplateElement } from '../../types.js'
import { cloneDeep } from '../../core/clone.js'
import { createElement, isElementType } from '../../core/elementFactory.js'

type ObjectMap = Record<string, TemplateElement>
type ObjectPatch = Partial<TemplateElement>
interface ObjectPatchEntry { id: string, patch: ObjectPatch }
interface PageBounds { widthMm?: number, heightMm?: number }
type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
type Axis = 'horizontal' | 'vertical'
type LayerAction = 'bringForward' | 'sendBackward' | 'bringToFront' | 'sendToBack'
interface LayoutStore {
  objectsById: ObjectMap
  pageObjectMap: Record<string, string[]>
  currentPage: { id: string } | null
  addObjects: (objects: readonly TemplateElement[]) => boolean
  applyObjectPatches: (patches: readonly ObjectPatchEntry[]) => boolean
  removeObjects: (ids: readonly string[]) => boolean
  setPageObjectOrder: (pageId: string, ids: readonly string[]) => boolean
}

function number(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}
function round(value: unknown): number {
  return +number(value).toFixed(2)
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
function uniqueIds(ids: readonly string[] = []): string[] {
  return [...new Set(ids.filter(Boolean))]
}
export function getEditableSelection(objectsById: ObjectMap, selectedIds: readonly string[], pageId?: string): TemplateElement[] {
  return uniqueIds(selectedIds)
    .map(id => objectsById[id])
    .filter((object): object is TemplateElement => object !== undefined && !object.locked && (!pageId || object.pageId === pageId))
}
export function getSelectionBounds(objects: readonly TemplateElement[] = []): { left: number, top: number, right: number, bottom: number, width: number, height: number } | null {
  if (!objects.length) {
    return null
  }
  const left = Math.min(...objects.map(object => number(object.x)))
  const top = Math.min(...objects.map(object => number(object.y)))
  const right = Math.max(...objects.map(object => number(object.x) + number(object.width)))
  const bottom = Math.max(...objects.map(object => number(object.y) + number(object.height)))
  return { left, top, right, bottom, width: round(right - left), height: round(bottom - top) }
}
function clampPatch(object: TemplateElement, patch: ObjectPatch, page?: PageBounds, allowOverflow = false): ObjectPatch {
  if (allowOverflow) {
    return Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, round(value)])) as ObjectPatch
  }
  const width = number(object.width)
  const height = number(object.height)
  const pageWidth = number(page?.widthMm, Number.POSITIVE_INFINITY)
  const pageHeight = number(page?.heightMm, Number.POSITIVE_INFINITY)
  const next = { ...patch }
  if (next.x != null) {
    next.x = round(clamp(number(next.x), 0, Math.max(0, pageWidth - width)))
  }
  if (next.y != null) {
    next.y = round(clamp(number(next.y), 0, Math.max(0, pageHeight - height)))
  }
  return next
}
export function createAlignmentPatches(objects: readonly TemplateElement[], alignment: Alignment, page?: PageBounds, { allowOverflow = false }: { allowOverflow?: boolean } = {}): ObjectPatchEntry[] {
  if (objects.length < 2) {
    return []
  }
  const bounds = getSelectionBounds(objects)
  if (!bounds)
    return []
  const positions: Record<Alignment, (object: TemplateElement) => ObjectPatch> = {
    left: object => ({ x: bounds.left }),
    center: object => ({ x: bounds.left + (bounds.width - number(object.width)) / 2 }),
    right: object => ({ x: bounds.right - number(object.width) }),
    top: () => ({ y: bounds.top }),
    middle: object => ({ y: bounds.top + (bounds.height - number(object.height)) / 2 }),
    bottom: object => ({ y: bounds.bottom - number(object.height) }),
  }
  const resolver = positions[alignment]
  if (!resolver) {
    return []
  }
  return objects.map(object => ({
    id: object.id,
    patch: clampPatch(object, resolver(object), page, allowOverflow),
  }))
}
export function createDistributionPatches(objects: readonly TemplateElement[], axis: Axis, page?: PageBounds, { allowOverflow = false }: { allowOverflow?: boolean } = {}): ObjectPatchEntry[] {
  if (objects.length < 3 || !['horizontal', 'vertical'].includes(axis)) {
    return []
  }
  const coordinate = axis === 'horizontal' ? 'x' : 'y'
  const dimension = axis === 'horizontal' ? 'width' : 'height'
  const sorted = [...objects].sort((left, right) => number(left[coordinate]) - number(right[coordinate]))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (!first || !last)
    return []
  const span = number(last[coordinate]) + number(last[dimension]) - number(first[coordinate])
  const used = sorted.reduce((total, object) => total + number(object[dimension]), 0)
  const gap = (span - used) / (sorted.length - 1)
  let cursor = number(first[coordinate])
  return sorted.map((object, index) => {
    const patch = index === 0 ? {} : { [coordinate]: cursor }
    cursor += number(object[dimension]) + gap
    return { id: object.id, patch: clampPatch(object, patch, page, allowOverflow) }
  })
}
export function createDuplicateObjects(objects: readonly TemplateElement[], page?: PageBounds, { offsetMm = 4, allowOverflow = false }: { offsetMm?: number, allowOverflow?: boolean } = {}): TemplateElement[] {
  return objects.map((object, index) => {
    const { id, zIndex, ...copy } = cloneDeep(object)
    if (!isElementType(object.type))
      throw new Error(`Unknown element type: ${object.type}`)
    const candidate = createElement(object.type, {
      ...copy,
      x: number(object.x) + offsetMm,
      y: number(object.y) + offsetMm,
      zIndex: number(object.zIndex) + index + 1,
    })
    const position = clampPatch(candidate, { x: candidate.x, y: candidate.y }, page, allowOverflow)
    return { ...candidate, ...position }
  })
}
function unlockedOrder(currentIds: readonly string[], objectsById: ObjectMap, selectedIds: readonly string[], action: 'front' | 'back'): string[] {
  const selected = new Set(selectedIds)
  const unlockedSlots = currentIds
    .map((id, index) => ({ id, index, object: objectsById[id] }))
    .filter(({ object }) => object && !object.locked)
  const movableIds = unlockedSlots.map(({ id }) => id)
  const active = movableIds.filter(id => selected.has(id))
  if (!active.length) {
    return [...currentIds]
  }
  const rest = movableIds.filter(id => !selected.has(id))
  const ordered = action === 'back' ? [...active, ...rest] : [...rest, ...active]
  const next = [...currentIds]
  unlockedSlots.forEach(({ index }, orderIndex) => {
    const id = ordered[orderIndex]
    if (id)
      next[index] = id
  })
  return next
}
export function createOrderIds(currentIds: readonly string[], objectsById: ObjectMap, selectedIds: readonly string[], action: 'front' | 'back'): string[] {
  return unlockedOrder(currentIds, objectsById, selectedIds, action)
}
export function createPatchTransactionCommand(documentStore: LayoutStore, label: string, patches: readonly ObjectPatchEntry[], { previousPatches = null }: { previousPatches?: readonly ObjectPatchEntry[] | null } = {}) {
  const effective = patches.filter(({ id, patch }) => documentStore.objectsById[id] && Object.keys(patch || {}).length)
  const previous = Array.isArray(previousPatches)
    ? cloneDeep(previousPatches)
    : effective.map(({ id, patch }) => {
        const object = documentStore.objectsById[id]
        if (!object)
          return { id, patch }
        return { id, patch: Object.fromEntries(Object.keys(patch).map(key => [key, object[key]])) }
      })
  if (!effective.length) {
    return null
  }
  return {
    id: `layout-${label}-${Date.now()}`,
    label,
    execute() {
      documentStore.applyObjectPatches(effective)
    },
    undo() {
      documentStore.applyObjectPatches(previous)
    },
  }
}
export function createDuplicateCommand(documentStore: LayoutStore, objects: readonly TemplateElement[]) {
  if (!objects.length) {
    return null
  }
  const copies = cloneDeep(objects)
  return {
    id: `duplicate-elements-${Date.now()}`,
    label: 'Duplicate elements',
    execute() {
      documentStore.addObjects(copies)
    },
    undo() {
      documentStore.removeObjects(copies.map(object => object.id))
    },
  }
}
export function createOrderTransactionCommand(documentStore: LayoutStore, pageId: string, nextIds: readonly string[], label: string) {
  const previousIds = [...(documentStore.pageObjectMap[pageId] || [])]
  if (!nextIds.length || previousIds.join('|') === nextIds.join('|')) {
    return null
  }
  return {
    id: `layout-order-${Date.now()}`,
    label,
    execute() {
      documentStore.setPageObjectOrder(pageId, nextIds)
    },
    undo() {
      documentStore.setPageObjectOrder(pageId, previousIds)
    },
  }
}
export function createReorderObjectCommand(documentStore: LayoutStore, objectId: string, action: LayerAction) {
  const object = documentStore.objectsById[objectId]
  if (!object || object.locked) {
    return null
  }
  const pageId = object.pageId || documentStore.currentPage?.id || 'page-1'
  const previousIds = [...(documentStore.pageObjectMap[pageId] || [])]
  const currentIndex = previousIds.indexOf(objectId)
  const nextIds = [...previousIds]
  if (currentIndex < 0) {
    return null
  }
  if (action === 'bringForward' && currentIndex < nextIds.length - 1) {
    const nextId = nextIds[currentIndex + 1]
    if (!nextId)
      return null
    nextIds[currentIndex] = nextId
    nextIds[currentIndex + 1] = objectId
  }
  else if (action === 'sendBackward' && currentIndex > 0) {
    const previousId = nextIds[currentIndex - 1]
    if (!previousId)
      return null
    nextIds[currentIndex] = previousId
    nextIds[currentIndex - 1] = objectId
  }
  else if (action === 'bringToFront' && currentIndex < nextIds.length - 1) {
    nextIds.splice(currentIndex, 1)
    nextIds.push(objectId)
  }
  else if (action === 'sendToBack' && currentIndex > 0) {
    nextIds.splice(currentIndex, 1)
    nextIds.unshift(objectId)
  }
  else {
    return null
  }
  if (previousIds.join('|') === nextIds.join('|')) {
    return null
  }
  const labels: Record<LayerAction, string> = {
    bringForward: 'Bring layer forward',
    sendBackward: 'Send layer backward',
    bringToFront: 'Bring layer to front',
    sendToBack: 'Send layer to back',
  }
  return {
    id: `layout-layer-order-${objectId}-${action}-${Date.now()}`,
    label: labels[action],
    execute() {
      documentStore.setPageObjectOrder(pageId, nextIds)
    },
    undo() {
      documentStore.setPageObjectOrder(pageId, previousIds)
    },
  }
}
