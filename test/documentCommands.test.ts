import { describe, expect, it } from 'vitest'
import { createUpdateObjectPropsCommand } from '../src/print-designer/editor/commands/documentCommands.js'

function createDocumentStore(object) {
  return {
    objectsById: { [object.id]: object },
    updateObjectProps(objectId, patch) {
      const current = this.objectsById[objectId]
      if (!current) {
        return false
      }
      this.objectsById[objectId] = { ...current, ...patch }
      return true
    },
    restoreObjectSnapshot(objectId, snapshot) {
      if (!this.objectsById[objectId]) {
        return false
      }
      this.objectsById[objectId] = structuredClone(snapshot)
      return true
    },
  }
}
describe('update object property command', () => {
  it('restores the complete original object and redoes the latest coalesced patch', () => {
    const original = {
      id: 'text-1',
      content: 'Before',
      locked: false,
      props: {},
      style: { color: '#000000' },
    }
    const documentStore = createDocumentStore(structuredClone(original))
    const command = createUpdateObjectPropsCommand(documentStore, original.id, {
      content: 'First input',
      editorHints: { rowCount: 3 },
    })
    command.execute()
    documentStore.updateObjectProps(original.id, {
      content: 'Latest input',
      editorHints: { rowCount: 5 },
    })
    command.setPatch({
      content: 'Latest input',
      editorHints: { rowCount: 5 },
    })
    command.undo()
    expect(documentStore.objectsById[original.id]).toEqual(original)
    command.execute()
    expect(documentStore.objectsById[original.id]).toMatchObject({
      content: 'Latest input',
      editorHints: { rowCount: 5 },
    })
  })
})
