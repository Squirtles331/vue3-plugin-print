import { defineStore } from "pinia";
import { computed, ref } from "vue";
export const useEditorHistoryStore = defineStore("printDesignerHistory", (): any => {
    const undoStack = ref([]) as any;
    const redoStack = ref([]) as any;
    const isApplyingHistory = ref(false) as any;
    const lastCommandName = ref("No commands yet") as any;
    const canUndo = computed((): any => undoStack.value.length > 0) as any;
    const canRedo = computed((): any => redoStack.value.length > 0) as any;
    const historyEntries = computed((): any => undoStack.value
        .map((command: any, index: any): any => ({
        id: command.id || `command-${index}`,
        label: command.label || command.id || `Command ${index + 1}`,
    }))
        .reverse()) as any;
    function execute(command: any): any {
        if (!command?.execute || !command?.undo) {
            return;
        }
        command.execute();
        undoStack.value = [...undoStack.value, command];
        redoStack.value = [];
        lastCommandName.value = command.label || command.id || "Unnamed command";
    }
    function undo(): any {
        const command = undoStack.value[undoStack.value.length - 1] as any;
        if (!command) {
            return;
        }
        isApplyingHistory.value = true;
        command.undo();
        isApplyingHistory.value = false;
        undoStack.value = undoStack.value.slice(0, -1);
        redoStack.value = [...redoStack.value, command];
        lastCommandName.value = `Undo ${command.label || command.id || "command"}`;
    }
    function redo(): any {
        const command = redoStack.value[redoStack.value.length - 1] as any;
        if (!command) {
            return;
        }
        isApplyingHistory.value = true;
        command.execute();
        isApplyingHistory.value = false;
        redoStack.value = redoStack.value.slice(0, -1);
        undoStack.value = [...undoStack.value, command];
        lastCommandName.value = `Redo ${command.label || command.id || "command"}`;
    }
    function reset(): any {
        undoStack.value = [];
        redoStack.value = [];
        lastCommandName.value = "No commands yet";
    }
    return {
        undoStack,
        redoStack,
        isApplyingHistory,
        lastCommandName,
        canUndo,
        canRedo,
        historyEntries,
        execute,
        undo,
        redo,
        reset,
    };
}) as any;
