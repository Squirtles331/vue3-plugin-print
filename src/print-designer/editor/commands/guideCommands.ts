export function createAddGuideCommand(viewportStore, orientation, position) {
    return {
        id: `guide-${orientation}-${position}`,
        label: `${orientation === "vertical" ? "Add vertical" : "Add horizontal"} guide`,
        execute() {
            viewportStore.addGuide(orientation, position);
        },
        undo() {
            viewportStore.removeGuide(orientation, position);
        },
    };
}
export function createMoveGuideCommand(viewportStore, orientation, fromPosition, toPosition) {
    if (+fromPosition.toFixed(2) === +toPosition.toFixed(2)) {
        return null;
    }
    return {
        id: `move-guide-${orientation}-${fromPosition}-${toPosition}`,
        label: `${orientation === "vertical" ? "Move vertical" : "Move horizontal"} guide`,
        execute() {
            viewportStore.moveGuide(orientation, fromPosition, toPosition);
        },
        undo() {
            viewportStore.moveGuide(orientation, toPosition, fromPosition);
        },
    };
}
export function createRemoveGuideCommand(viewportStore, orientation, position) {
    return {
        id: `remove-guide-${orientation}-${position}`,
        label: `${orientation === "vertical" ? "Remove vertical" : "Remove horizontal"} guide`,
        execute() {
            viewportStore.removeGuide(orientation, position);
        },
        undo() {
            viewportStore.addGuide(orientation, position);
        },
    };
}
