import { createBlankTemplateDocument, serializeTemplateDocument } from "./templateDocument.js";

const DEFAULT_STORAGE_KEY = "print-template-studio:templates:v1";

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
    return {};
  }

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function writeCollection(storage, key, collection) {
  if (!storage) {
    throw new Error("Browser storage is not available.");
  }

  storage.setItem(key, JSON.stringify(collection));
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
      return document ? clone(document) : null;
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
    const response = await fetchImpl(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Template request failed (${response.status}).`);
    }

    return response.status === 204 ? null : response.json();
  };

  return {
    async create(overrides = {}) {
      return createBlankTemplateDocument(overrides);
    },
    async list() {
      return request("/templates");
    },
    async get(id) {
      return request(`/templates/${encodeURIComponent(id)}`);
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
