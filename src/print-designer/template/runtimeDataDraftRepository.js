function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function getBrowserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function readCollection(storage, key) {
  if (!storage) {
    throw new Error("Browser draft storage is not available.");
  }
  const raw = storage.getItem(key);
  if (!raw) {
    return {};
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("draft collection must be an object");
    }
    return value;
  } catch (error) {
    throw new Error(`Unable to read runtime data drafts: ${error?.message || "stored drafts are corrupted."}`, { cause: error });
  }
}

function writeCollection(storage, key, value) {
  if (!storage) {
    throw new Error("Browser draft storage is not available.");
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Unable to save runtime data draft: ${error?.message || "storage write failed."}`, { cause: error });
  }
}

/**
 * Stores design-time example data separately from the template document.
 * The draft is never included in repository saves, exports, or print payloads.
 */
export function createLocalRuntimeDataDraftRepository({ storage = getBrowserStorage(), key = "print-template-studio:runtime-data-drafts:v2" } = {}) {
  return {
    async get(templateId) {
      const id = String(templateId || "").trim();
      if (!id) {
        return null;
      }
      const value = readCollection(storage, key)[id];
      return value && typeof value === "object" && !Array.isArray(value) ? clone(value) : null;
    },

    async save(templateId, runtimeData) {
      const id = String(templateId || "").trim();
      if (!id) {
        throw new Error("A template id is required to save runtime data.");
      }
      if (!runtimeData || typeof runtimeData !== "object" || Array.isArray(runtimeData)) {
        throw new Error("Runtime data draft must be a JSON object.");
      }
      const collection = readCollection(storage, key);
      collection[id] = clone(runtimeData);
      writeCollection(storage, key, collection);
      return clone(collection[id]);
    },

    async delete(templateId) {
      const id = String(templateId || "").trim();
      if (!id) {
        return false;
      }
      const collection = readCollection(storage, key);
      if (!Object.hasOwn(collection, id)) {
        return false;
      }
      delete collection[id];
      writeCollection(storage, key, collection);
      return true;
    },
  };
}
