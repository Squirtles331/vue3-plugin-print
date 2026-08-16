const DEFAULT_MAX_DEPTH = 8;
const DEFAULT_MAX_ARRAY_ITEMS = 20;
const DEFAULT_MAX_PATHS = 500;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;
function object(value) {
    return value && typeof value === "object";
}
function propertyPath(parent, key) {
    const stringKey = String(key);
    if (IDENTIFIER_PATTERN.test(stringKey)) {
        return parent ? `${parent}.${stringKey}` : stringKey;
    }
    if (stringKey.includes('"')) {
        return "";
    }
    return `${parent}["${stringKey}"]`;
}
export function collectRuntimeBindingPaths(data, { maxDepth = DEFAULT_MAX_DEPTH, maxArrayItems = DEFAULT_MAX_ARRAY_ITEMS, maxPaths = DEFAULT_MAX_PATHS, } = {}) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return [];
    }
    const paths = [];
    const visited = new WeakSet();
    const add = (path) => {
        if (path && paths.length < maxPaths) {
            paths.push(path);
        }
    };
    const walk = (value, path, depth) => {
        if (!object(value) || depth >= maxDepth || paths.length >= maxPaths || visited.has(value)) {
            return;
        }
        visited.add(value);
        if (Array.isArray(value)) {
            value.slice(0, maxArrayItems).forEach((item, index) => {
                const itemPath = `${path}[${index}]`;
                add(itemPath);
                walk(item, itemPath, depth + 1);
            });
            return;
        }
        Object.keys(value).forEach((key) => {
            if (paths.length >= maxPaths) {
                return;
            }
            const nextPath = propertyPath(path, key);
            if (!nextPath) {
                return;
            }
            add(nextPath);
            walk(value[key], nextPath, depth + 1);
        });
    };
    walk(data, "", 0);
    return paths;
}
/** Returns the runtime shape displayed next to a bindable JSON path. */
export function getRuntimeBindingValueKind(value) {
    if (Array.isArray(value)) {
        return "array";
    }
    if (value !== null && typeof value === "object") {
        return "object";
    }
    return "scalar";
}
export function describeRuntimeBindingPaths(data, options = {}) {
    return collectRuntimeBindingPaths(data, options).map((path) => {
        let current = data;
        const normalizedSegments = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
        for (const segment of normalizedSegments) {
            current = current?.[segment];
        }
        return { path, kind: getRuntimeBindingValueKind(current) };
    });
}
