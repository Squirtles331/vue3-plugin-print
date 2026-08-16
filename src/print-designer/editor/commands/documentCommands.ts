import { cloneDeep } from '../../core/clone.js'

export function createAddObjectCommand(documentStore, object) {
  return {
    id: `add-object-${object.id}`,
    label: `Add object ${object.name || object.id}`,
    execute() {
      documentStore.addObject(object)
    },
    undo() {
      documentStore.removeObject(object.id)
    },
  }
}
export function createRemoveObjectsCommand(documentStore, objectIds = []) {
  const removableIds = [...new Set(objectIds)].filter(id => documentStore.objectsById[id] && !documentStore.objectsById[id].locked)
  if (!removableIds.length) {
    return null
  }
  const previousObjects = cloneDeep(removableIds.map(id => documentStore.objectsById[id]))
  const previousOrders = new Map()
  const previousGroups = new Map()
  removableIds.forEach((id) => {
    const object = documentStore.objectsById[id]
    const pageId = object?.pageId || documentStore.currentPage?.id || 'page-1'
    if (!previousOrders.has(pageId)) {
      previousOrders.set(pageId, [...(documentStore.pageObjectMap[pageId] || [])])
      const page = documentStore.pages.find(item => item.id === pageId)
      previousGroups.set(pageId, cloneDeep(page?.groups || []))
    }
  })
  return {
    id: `remove-objects-${Date.now()}`,
    label: `Delete ${removableIds.length} element${removableIds.length > 1 ? 's' : ''}`,
    execute() {
      documentStore.removeObjects(removableIds)
    },
    undo() {
      documentStore.addObjects(previousObjects)
      previousOrders.forEach((ids, pageId) => {
        documentStore.setPageObjectOrder(pageId, ids)
      })
      previousGroups.forEach((groups, pageId) => {
        documentStore.setPageGroups?.(pageId, groups)
      })
    },
  }
}
export function createUpdateObjectPropsCommand(documentStore, objectId, patch) {
  const currentObject = documentStore.objectsById[objectId]
  if (!currentObject) {
    return null
  }
  const previous = cloneDeep(currentObject)
  let nextPatch = cloneDeep(patch)
  return {
    id: `update-object-${objectId}`,
    label: `Update object ${objectId}`,
    execute() {
      return documentStore.updateObjectProps(objectId, cloneDeep(nextPatch))
    },
    undo() {
      if (typeof documentStore.restoreObjectSnapshot === 'function') {
        return documentStore.restoreObjectSnapshot(objectId, previous)
      }
      return documentStore.updateObjectProps(objectId, cloneDeep(previous))
    },
    setPatch(patch) {
      nextPatch = cloneDeep(patch)
    },
  }
}
export function createMoveObjectCommand(documentStore, objectId, previousPatch, nextPatch) {
  return {
    id: `move-object-${objectId}`,
    label: `Move object ${objectId}`,
    execute() {
      documentStore.updateObjectProps(objectId, nextPatch)
    },
    undo() {
      documentStore.updateObjectProps(objectId, previousPatch)
    },
  }
}
export function createTransformObjectCommand(documentStore, objectId, previousPatch, nextPatch, label = 'Transform') {
  return {
    id: `transform-object-${objectId}`,
    label: `${label} object ${objectId}`,
    execute() {
      documentStore.updateObjectProps(objectId, nextPatch)
    },
    undo() {
      documentStore.updateObjectProps(objectId, previousPatch)
    },
  }
}
