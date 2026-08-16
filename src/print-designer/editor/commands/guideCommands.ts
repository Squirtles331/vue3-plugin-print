export function createAddGuideCommand(viewportStore: any, orientation: any, position: any): any {
    return {
        id: `guide-${orientation}-${position}`,
        label: `${orientation === "vertical" ? "Add vertical" : "Add horizontal"} guide`,
        execute(): any {
            viewportStore.addGuide(orientation, position);
        },
        undo(): any {
            viewportStore.removeGuide(orientation, position);
        },
    };
}
export function createMoveGuideCommand(viewportStore: any, orientation: any, fromPosition: any, toPosition: any): any {
    if (+fromPosition.toFixed(2) === +toPosition.toFixed(2)) {
        return null;
    }
    return {
        id: `move-guide-${orientation}-${fromPosition}-${toPosition}`,
        label: `${orientation === "vertical" ? "Move vertical" : "Move horizontal"} guide`,
        execute(): any {
            viewportStore.moveGuide(orientation, fromPosition, toPosition);
        },
        undo(): any {
            viewportStore.moveGuide(orientation, toPosition, fromPosition);
        },
    };
}
export function createRemoveGuideCommand(viewportStore: any, orientation: any, position: any): any {
    return {
        id: `remove-guide-${orientation}-${position}`,
        label: `${orientation === "vertical" ? "Remove vertical" : "Remove horizontal"} guide`,
        execute(): any {
            viewportStore.removeGuide(orientation, position);
        },
        undo(): any {
            viewportStore.addGuide(orientation, position);
        },
    };
}
