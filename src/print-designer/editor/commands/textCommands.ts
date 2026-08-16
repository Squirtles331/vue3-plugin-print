import { getTextPresetDefinition } from "../../core/textFormatting";
const TYPOGRAPHY_TYPES = new Set(["text", "pageNumber", "barcode", "table", "multiLabel"]) as any;
function cloneTextStyle(style: any = {}): any {
    return {
        ...style,
    };
}
function cloneTextProps(props: any = {}): any {
    return {
        ...props,
    };
}
function createTextCommandLabel(prefix: any, objectId: any): any {
    return `${prefix} ${objectId}`;
}
export function createUpdateTextFormattingCommand(documentStore: any, objectId: any, nextStylePatch: any = {}, nextPropsPatch: any = {}): any {
    const currentObject = documentStore.objectsById[objectId] as any;
    if (!currentObject || !TYPOGRAPHY_TYPES.has(currentObject.type)) {
        return null;
    }
    const previousStyle = cloneTextStyle(currentObject.style) as any;
    const previousProps = cloneTextProps(currentObject.props) as any;
    const nextStyle = {
        ...previousStyle,
        ...nextStylePatch,
    } as any;
    const nextProps = {
        ...previousProps,
        ...nextPropsPatch,
    } as any;
    return {
        id: `update-text-format-${objectId}`,
        label: createTextCommandLabel("Update text format", objectId),
        execute(): any {
            documentStore.updateObjectProps(objectId, {
                style: nextStyle,
                props: nextProps,
            });
        },
        undo(): any {
            documentStore.updateObjectProps(objectId, {
                style: previousStyle,
                props: previousProps,
            });
        },
    };
}
export function createApplyTextPresetCommand(documentStore: any, objectId: any, preset: any): any {
    const currentObject = documentStore.objectsById[objectId] as any;
    const presetDefinition = getTextPresetDefinition(preset) as any;
    if (!currentObject || currentObject.type !== "text" || !presetDefinition) {
        return null;
    }
    const previousStyle = cloneTextStyle(currentObject.style) as any;
    const previousProps = cloneTextProps(currentObject.props) as any;
    const nextStyle = {
        ...previousStyle,
        ...presetDefinition.style,
    } as any;
    const nextProps = {
        ...previousProps,
        ...presetDefinition.props,
        textPreset: preset,
    } as any;
    return {
        id: `apply-text-preset-${objectId}-${preset}`,
        label: createTextCommandLabel(`Apply preset ${preset}`, objectId),
        execute(): any {
            documentStore.updateObjectProps(objectId, {
                style: nextStyle,
                props: nextProps,
            });
        },
        undo(): any {
            documentStore.updateObjectProps(objectId, {
                style: previousStyle,
                props: previousProps,
            });
        },
    };
}
