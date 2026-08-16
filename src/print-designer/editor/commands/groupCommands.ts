import { cloneDeep, createId } from '../../core/clone.js'

function pageGroups(documentStore, pageId) {
  return cloneDeep(documentStore.pages.find(page => page.id === pageId)?.groups || [])
}
export function createSetPageGroupsCommand(documentStore, pageId, nextGroups, label = 'Update groups') {
  const previousGroups = pageGroups(documentStore, pageId)
  const next = cloneDeep(nextGroups || [])
  if (JSON.stringify(previousGroups) === JSON.stringify(next)) {
    return null
  }
  return {
    id: `groups-${Date.now()}`,
    label,
    execute() {
      documentStore.setPageGroups(pageId, cloneDeep(next))
    },
    undo() {
      documentStore.setPageGroups(pageId, cloneDeep(previousGroups))
    },
  }
}
export function createGroupCommand(documentStore, pageId, elementIds, name = '') {
  const ids = [...new Set(elementIds || [])].filter(id => documentStore.objectsById[id]?.pageId === pageId)
  if (ids.length < 2) {
    return null
  }
  const existing = pageGroups(documentStore, pageId)
  const selected = new Set(ids)
  const remaining = existing
    .map(group => ({ ...group, elementIds: (group.elementIds || []).filter(id => !selected.has(id)) }))
    .filter(group => group.elementIds.length >= 2)
  const group = {
    id: createId('group'),
    name: String(name || `Group ${remaining.length + 1}`).trim() || `Group ${remaining.length + 1}`,
    elementIds: ids,
  }
  const command = createSetPageGroupsCommand(documentStore, pageId, [...remaining, group], 'Group elements')
  return command ? { command, group } : null
}
export function createUngroupCommand(documentStore, pageId, groupIds = []) {
  const targets = new Set(groupIds)
  if (!targets.size) {
    return null
  }
  const next = pageGroups(documentStore, pageId).filter(group => !targets.has(group.id))
  return createSetPageGroupsCommand(documentStore, pageId, next, 'Ungroup elements')
}
