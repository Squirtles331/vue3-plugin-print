const DEFAULT_MAX_DEPTH = 8 as any;
const DEFAULT_MAX_ARRAY_ITEMS = 20 as any;
const DEFAULT_MAX_PATHS = 500 as any;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/ as any;
function object(value: any): any {
    return value && typeof value === "object";
}
function propertyPath(parent: any, key: any): any {
    const stringKey = String(key) as any;
    if (IDENTIFIER_PATTERN.test(stringKey)) {
        return parent ? `${parent}.${stringKey}` : stringKey;
    }
    if (stringKey.includes('"')) {
        return "";
    }
    return `${parent}["${stringKey}"]`;
}
export function collectRuntimeBindingPaths(data: any, { maxDepth = DEFAULT_MAX_DEPTH, maxArrayItems = DEFAULT_MAX_ARRAY_ITEMS, maxPaths = DEFAULT_MAX_PATHS, }: any = {}): any {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return [];
    }
    const paths = [] as any;
    const visited = new WeakSet() as any;
    const add = (path: any): any => {
        if (path && paths.length < maxPaths) {
            paths.push(path);
        }
    };
    const walk = (value: any, path: any, depth: any): any => {
        if (!object(value) || depth >= maxDepth || paths.length >= maxPaths || visited.has(value)) {
            return;
        }
        visited.add(value);
        if (Array.isArray(value)) {
            value.slice(0, maxArrayItems).forEach((item: any, index: any): any => {
                const itemPath = `${path}[${index}]` as any;
                add(itemPath);
                walk(item, itemPath, depth + 1);
            });
            return;
        }
        Object.keys(value).forEach((key: any): any => {
            if (paths.length >= maxPaths) {
                return;
            }
            const nextPath = propertyPath(path, key) as any;
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
export function getRuntimeBindingValueKind(value: any): any {
    if (Array.isArray(value)) {
        return "array";
    }
    if (value !== null && typeof value === "object") {
        return "object";
    }
    return "scalar";
}
export function describeRuntimeBindingPaths(data: any, options: any = {}): any {
    return collectRuntimeBindingPaths(data, options).map((path: any): any => {
        let current = data as any;
        const normalizedSegments = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean) as any;
        for (const segment of normalizedSegments) {
            current = current?.[segment];
        }
        return { path, kind: getRuntimeBindingValueKind(current) };
    });
}
