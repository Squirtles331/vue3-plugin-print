import { createBlankTemplateDocument, serializeTemplateDocument, validateTemplateDocument } from "./templateDocument.js";
const DEFAULT_STORAGE_KEY = "print-template-studio:templates:v2" as any;
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
        throw new Error("Browser template storage is not available.");
    }
    try {
        const value = storage.getItem(key) as any;
        if (!value) {
            return {};
        }
        const collection = JSON.parse(value) as any;
        if (!collection || typeof collection !== "object" || Array.isArray(collection)) {
            throw new Error("Template collection must be a JSON object.");
        }
        return collection;
    }
    catch (error: any) {
        throw new Error(`Unable to read local template storage: ${error?.message || "stored templates are corrupted."}`, { cause: error });
    }
}
function writeCollection(storage: any, key: any, collection: any): any {
    if (!storage) {
        throw new Error("Browser storage is not available.");
    }
    try {
        storage.setItem(key, JSON.stringify(collection));
    }
    catch (error: any) {
        throw new Error(`Unable to save local template storage: ${error?.message || "storage write failed."}`, { cause: error });
    }
}
function normalizeRepositoryDocument(document: any): any {
    const result = validateTemplateDocument(document) as any;
    if (!result.valid) {
        const error = new Error("Stored template validation failed.") as any;
        error.issues = result.issues;
        throw error;
    }
    return result.document;
}
export function createLocalTemplateRepository({ storage = getBrowserStorage(), key = DEFAULT_STORAGE_KEY }: any = {}): any {
    return {
        async create(overrides: any = {}): Promise<any> {
            return createBlankTemplateDocument(overrides);
        },
        async list(): Promise<any> {
            return Object.values(readCollection(storage, key))
                .map((document: any): any => ({
                id: document.id,
                name: document.meta?.name || "Untitled print template",
                updatedAt: document.meta?.updatedAt || "",
            }))
                .sort((left: any, right: any): any => String(right.updatedAt).localeCompare(String(left.updatedAt)));
        },
        async get(id: any): Promise<any> {
            const document = readCollection(storage, key)[id] as any;
            return document ? clone(normalizeRepositoryDocument(document)) : null;
        },
        async save(document: any): Promise<any> {
            const result = serializeTemplateDocument(document) as any;
            if (!result.valid) {
                const error = new Error("Template validation failed.") as any;
                error.issues = result.issues;
                throw error;
            }
            const collection = readCollection(storage, key) as any;
            collection[result.document.id] = result.document;
            writeCollection(storage, key, collection);
            return clone(result.document);
        },
        async delete(id: any): Promise<any> {
            const collection = readCollection(storage, key) as any;
            if (!Object.prototype.hasOwnProperty.call(collection, id)) {
                return false;
            }
            delete collection[id];
            writeCollection(storage, key, collection);
            return true;
        },
        async clear(): Promise<any> {
            writeCollection(storage, key, {});
        },
    };
}
export function createRestTemplateRepository({ baseUrl, fetchImpl = globalThis.fetch, getHeaders = (): any => ({}) }: any = {}): any {
    if (!baseUrl || typeof fetchImpl !== "function") {
        throw new Error("A baseUrl and fetch implementation are required for the REST template repository.");
    }
    const request = async (path: any, options: any = {}): Promise<any> => {
        let response: any;
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
        }
        catch (error: any) {
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
        }
        catch {
            throw new Error("Template request returned invalid JSON.");
        }
    };
    return {
        async create(overrides: any = {}): Promise<any> {
            return createBlankTemplateDocument(overrides);
        },
        async list(): Promise<any> {
            return request("/templates");
        },
        async get(id: any): Promise<any> {
            const document = await request(`/templates/${encodeURIComponent(id)}`) as any;
            return document ? normalizeRepositoryDocument(document) : null;
        },
        async save(document: any): Promise<any> {
            const result = serializeTemplateDocument(document) as any;
            if (!result.valid) {
                const error = new Error("Template validation failed.") as any;
                error.issues = result.issues;
                throw error;
            }
            return request(`/templates/${encodeURIComponent(result.document.id)}`, {
                method: "PUT",
                body: JSON.stringify(result.document),
            });
        },
        async delete(id: any): Promise<any> {
            await request(`/templates/${encodeURIComponent(id)}`, { method: "DELETE" });
            return true;
        },
    };
}
