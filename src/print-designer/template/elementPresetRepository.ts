import { createElement, isElementType } from "../core/elementFactory.js";
const DEFAULT_STORAGE_KEY = "print-template-studio:element-presets:v1" as any;
function clone(value: any): any {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
function getBrowserStorage(): any {
    try {
        return globalThis.localStorage;
    }
    catch {
        return null;
    }
}
function readCollection(storage: any, key: any): any {
    if (!storage) {
        return {};
    }
    try {
        return JSON.parse(storage.getItem(key) || "{}");
    }
    catch {
        return {};
    }
}
function writeCollection(storage: any, key: any, collection: any): any {
    if (!storage) {
        throw new Error("Browser storage is not available.");
    }
    storage.setItem(key, JSON.stringify(collection));
}
function presetId(): any {
    return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function normalizeName(name: any): any {
    const result = typeof name === "string" ? name.trim() : "" as any;
    if (!result || result.length > 120) {
        throw new Error("Preset name must contain 1 to 120 characters.");
    }
    return result;
}
export function createElementPresetBlueprint(element: any): any {
    if (!element || !isElementType(element.type)) {
        throw new Error("A supported element is required to create a preset.");
    }
    const normalized = createElement(element.type, clone(element)) as any;
    const { id, pageId, zIndex, selected, hovered, editing, interactionState, runtime, ...blueprint } = normalized as any;
    return blueprint;
}
export function instantiateElementPreset(preset: any, { pageId, x = 10, y = 10, zIndex = 0 }: any = {}): any {
    if (!preset?.blueprint) {
        throw new Error("Preset was not found.");
    }
    return createElement(preset.type, { ...clone(preset.blueprint), pageId, x, y, zIndex });
}
export function createLocalElementPresetRepository({ storage = getBrowserStorage(), key = DEFAULT_STORAGE_KEY }: any = {}): any {
    return {
        async create({ name, element }: any): Promise<any> {
            const normalizedName = normalizeName(name) as any;
            const collection = readCollection(storage, key) as any;
            if (Object.values(collection).some((preset: any): any => preset.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
                throw new Error("A preset with this name already exists.");
            }
            const now = new Date().toISOString() as any;
            const preset = { id: presetId(), name: normalizedName, type: element.type, createdAt: now, updatedAt: now, blueprint: createElementPresetBlueprint(element) } as any;
            collection[preset.id] = preset;
            writeCollection(storage, key, collection);
            return clone(preset);
        },
        async list(): Promise<any> {
            return Object.values(readCollection(storage, key)).map(clone).sort((left: any, right: any): any => left.name.localeCompare(right.name));
        },
        async get(id: any): Promise<any> {
            const preset = readCollection(storage, key)[id] as any;
            return preset ? clone(preset) : null;
        },
        async rename(id: any, name: any): Promise<any> {
            const collection = readCollection(storage, key) as any;
            if (!collection[id]) {
                throw new Error("Preset was not found.");
            }
            const normalizedName = normalizeName(name) as any;
            if (Object.entries(collection).some(([otherId, preset]: any): any => otherId !== id && preset.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())) {
                throw new Error("A preset with this name already exists.");
            }
            collection[id] = { ...collection[id], name: normalizedName, updatedAt: new Date().toISOString() };
            writeCollection(storage, key, collection);
            return clone(collection[id]);
        },
        async delete(id: any): Promise<any> {
            const collection = readCollection(storage, key) as any;
            if (!collection[id]) {
                return false;
            }
            delete collection[id];
            writeCollection(storage, key, collection);
            return true;
        },
    };
}
