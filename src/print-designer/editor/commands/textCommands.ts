import { getTextPresetDefinition } from "../../core/textFormatting";
const TYPOGRAPHY_TYPES = new Set(["text", "pageNumber", "barcode", "table", "multiLabel"]);
function cloneTextStyle(style = {}) {
    return {
        ...style,
    };
}
function cloneTextProps(props = {}) {
    return {
        ...props,
    };
}
function createTextCommandLabel(prefix, objectId) {
    return `${prefix} ${objectId}`;
}
export function createUpdateTextFormattingCommand(documentStore, objectId, nextStylePatch = {}, nextPropsPatch = {}) {
    const currentObject = documentStore.objectsById[objectId];
    if (!currentObject || !TYPOGRAPHY_TYPES.has(currentObject.type)) {
        return null;
    }
    const previousStyle = cloneTextStyle(currentObject.style);
    const previousProps = cloneTextProps(currentObject.props);
    const nextStyle = {
        ...previousStyle,
        ...nextStylePatch,
    };
    const nextProps = {
        ...previousProps,
        ...nextPropsPatch,
    };
    return {
        id: `update-text-format-${objectId}`,
        label: createTextCommandLabel("Update text format", objectId),
        execute() {
            documentStore.updateObjectProps(objectId, {
                style: nextStyle,
                props: nextProps,
            });
        },
        undo() {
            documentStore.updateObjectProps(objectId, {
                style: previousStyle,
                props: previousProps,
            });
        },
    };
}
export function createApplyTextPresetCommand(documentStore, objectId, preset) {
    const currentObject = documentStore.objectsById[objectId];
    const presetDefinition = getTextPresetDefinition(preset);
    if (!currentObject || currentObject.type !== "text" || !presetDefinition) {
        return null;
    }
    const previousStyle = cloneTextStyle(currentObject.style);
    const previousProps = cloneTextProps(currentObject.props);
    const nextStyle = {
        ...previousStyle,
        ...presetDefinition.style,
    };
    const nextProps = {
        ...previousProps,
        ...presetDefinition.props,
        textPreset: preset,
    };
    return {
        id: `apply-text-preset-${objectId}-${preset}`,
        label: createTextCommandLabel(`Apply preset ${preset}`, objectId),
        execute() {
            documentStore.updateObjectProps(objectId, {
                style: nextStyle,
                props: nextProps,
            });
        },
        undo() {
            documentStore.updateObjectProps(objectId, {
                style: previousStyle,
                props: previousProps,
            });
        },
    };
}
