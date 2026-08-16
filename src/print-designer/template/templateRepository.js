import { createBlankTemplateDocument, serializeTemplateDocument, validateTemplateDocument } from "./templateDocument.js";

const DEFAULT_STORAGE_KEY = "print-template-studio:templates:v2";

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
    throw new Error("Browser template storage is not available.");
  }

  try {
    const value = storage.getItem(key);
    if (!value) {
      return {};
    }
    const collection = JSON.parse(value);
    if (!collection || typeof collection !== "object" || Array.isArray(collection)) {
      throw new Error("Template collection must be a JSON object.");
    }
    return collection;
  } catch (error) {
    throw new Error(`Unable to read local template storage: ${error?.message || "stored templates are corrupted."}`, { cause: error });
  }
}

function writeCollection(storage, key, collection) {
  if (!storage) {
    throw new Error("Browser storage is not available.");
  }

  try {
    storage.setItem(key, JSON.stringify(collection));
  } catch (error) {
    throw new Error(`Unable to save local template storage: ${error?.message || "storage write failed."}`, { cause: error });
  }
}

function normalizeRepositoryDocument(document) {
  const result = validateTemplateDocument(document);
  if (!result.valid) {
    const error = new Error("Stored template validation failed.");
    error.issues = result.issues;
    throw error;
  }
  return result.document;
}

export function createLocalTemplateRepository({ storage = getBrowserStorage(), key = DEFAULT_STORAGE_KEY } = {}) {
  return {
    async create(overrides = {}) {
      return createBlankTemplateDocument(overrides);
    },

    async list() {
      return Object.values(readCollection(storage, key))
        .map((document) => ({
          id: document.id,
          name: document.meta?.name || "Untitled print template",
          updatedAt: document.meta?.updatedAt || "",
        }))
        .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
    },

    async get(id) {
      const document = readCollection(storage, key)[id];
      return document ? clone(normalizeRepositoryDocument(document)) : null;
    },

    async save(document) {
      const result = serializeTemplateDocument(document);
      if (!result.valid) {
        const error = new Error("Template validation failed.");
        error.issues = result.issues;
        throw error;
      }

      const collection = readCollection(storage, key);
      collection[result.document.id] = result.document;
      writeCollection(storage, key, collection);
      return clone(result.document);
    },

    async delete(id) {
      const collection = readCollection(storage, key);
      if (!Object.prototype.hasOwnProperty.call(collection, id)) {
        return false;
      }

      delete collection[id];
      writeCollection(storage, key, collection);
      return true;
    },

    async clear() {
      writeCollection(storage, key, {});
    },
  };
}

export function createRestTemplateRepository({ baseUrl, fetchImpl = globalThis.fetch, getHeaders = () => ({}) } = {}) {
  if (!baseUrl || typeof fetchImpl !== "function") {
    throw new Error("A baseUrl and fetch implementation are required for the REST template repository.");
  }

  const request = async (path, options = {}) => {
    let response;
    try {
      response = await fetchImpl(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getHeaders(),
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      throw new Error(`Template request could not reach the server: ${error?.message || "network error."}`, { cause: error });
    }

    if (!response.ok) {
      if (response.status === 409 || response.status === 412) {
        throw new Error(`Template update conflict (${response.status}). Refresh the template before saving again.`);
      }
      throw new Error(`Template request failed (${response.status} ${response.statusText || "".trim()}).`);
    }

    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      throw new Error("Template request returned invalid JSON.");
    }
  };

  return {
    async create(overrides = {}) {
      return createBlankTemplateDocument(overrides);
    },
    async list() {
      return request("/templates");
    },
    async get(id) {
      const document = await request(`/templates/${encodeURIComponent(id)}`);
      return document ? normalizeRepositoryDocument(document) : null;
    },
    async save(document) {
      const result = serializeTemplateDocument(document);
      if (!result.valid) {
        const error = new Error("Template validation failed.");
        error.issues = result.issues;
        throw error;
      }

      return request(`/templates/${encodeURIComponent(result.document.id)}`, {
        method: "PUT",
        body: JSON.stringify(result.document),
      });
    },
    async delete(id) {
      await request(`/templates/${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    },
  };
}
