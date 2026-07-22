export function createAddObjectCommand(documentStore, object) {
  return {
    id: `add-object-${object.id}`,
    label: `Add object ${object.name || object.id}`,
    execute() {
      documentStore.addObject(object);
    },
    undo() {
      documentStore.removeObject(object.id);
    },
  };
}

export function createUpdateObjectPropsCommand(documentStore, objectId, patch) {
  const currentObject = documentStore.objectsById[objectId];

  if (!currentObject) {
    return null;
  }

  const previous = { ...currentObject };

  return {
    id: `update-object-${objectId}`,
    label: `Update object ${objectId}`,
    execute() {
      documentStore.updateObjectProps(objectId, patch);
    },
    undo() {
      documentStore.updateObjectProps(objectId, previous);
    },
  };
}

export function createMoveObjectCommand(documentStore, objectId, previousPatch, nextPatch) {
  return {
    id: `move-object-${objectId}`,
    label: `Move object ${objectId}`,
    execute() {
      documentStore.updateObjectProps(objectId, nextPatch);
    },
    undo() {
      documentStore.updateObjectProps(objectId, previousPatch);
    },
  };
}

export function createTransformObjectCommand(documentStore, objectId, previousPatch, nextPatch, label = "Transform") {
  return {
    id: `transform-object-${objectId}`,
    label: `${label} object ${objectId}`,
    execute() {
      documentStore.updateObjectProps(objectId, nextPatch);
    },
    undo() {
      documentStore.updateObjectProps(objectId, previousPatch);
    },
  };
}
