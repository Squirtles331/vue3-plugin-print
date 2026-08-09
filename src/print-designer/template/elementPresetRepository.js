import { createElement, isElementType } from "../core/elementFactory.js";

const DEFAULT_STORAGE_KEY = "print-template-studio:element-presets:v1";

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
    return JSON.parse(storage.getItem(key) || "{}");
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

function presetId() {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeName(name) {
  const result = typeof name === "string" ? name.trim() : "";
  if (!result || result.length > 120) {
    throw new Error("Preset name must contain 1 to 120 characters.");
  }
  return result;
}

export function createElementPresetBlueprint(element) {
  if (!element || !isElementType(element.type)) {
    throw new Error("A supported element is required to create a preset.");
  }
  const normalized = createElement(element.type, clone(element));
  const { id, pageId, zIndex, selected, hovered, editing, interactionState, runtime, ...blueprint } = normalized;
  return blueprint;
}

export function instantiateElementPreset(preset, { pageId, x = 10, y = 10, zIndex = 0 } = {}) {
  if (!preset?.blueprint) {
    throw new Error("Preset was not found.");
  }
  return createElement(preset.type, { ...clone(preset.blueprint), pageId, x, y, zIndex });
}

export function createLocalElementPresetRepository({ storage = getBrowserStorage(), key = DEFAULT_STORAGE_KEY } = {}) {
  return {
    async create({ name, element }) {
      const normalizedName = normalizeName(name);
      const collection = readCollection(storage, key);
      if (Object.values(collection).some((preset) => preset.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
        throw new Error("A preset with this name already exists.");
      }
      const now = new Date().toISOString();
      const preset = { id: presetId(), name: normalizedName, type: element.type, createdAt: now, updatedAt: now, blueprint: createElementPresetBlueprint(element) };
      collection[preset.id] = preset;
      writeCollection(storage, key, collection);
      return clone(preset);
    },
    async list() {
      return Object.values(readCollection(storage, key)).map(clone).sort((left, right) => left.name.localeCompare(right.name));
    },
    async get(id) {
      const preset = readCollection(storage, key)[id];
      return preset ? clone(preset) : null;
    },
    async rename(id, name) {
      const collection = readCollection(storage, key);
      if (!collection[id]) {
        throw new Error("Preset was not found.");
      }
      const normalizedName = normalizeName(name);
      if (Object.entries(collection).some(([otherId, preset]) => otherId !== id && preset.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
        throw new Error("A preset with this name already exists.");
      }
      collection[id] = { ...collection[id], name: normalizedName, updatedAt: new Date().toISOString() };
      writeCollection(storage, key, collection);
      return clone(collection[id]);
    },
    async delete(id) {
      const collection = readCollection(storage, key);
      if (!collection[id]) {
        return false;
      }
      delete collection[id];
      writeCollection(storage, key, collection);
      return true;
    },
  };
}
