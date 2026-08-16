import { defineStore } from "pinia";
import { computed, ref } from "vue";
export const useEditorHistoryStore = defineStore("printDesignerHistory", () => {
    const undoStack = ref([]);
    const redoStack = ref([]);
    const isApplyingHistory = ref(false);
    const lastCommandName = ref("No commands yet");
    const canUndo = computed(() => undoStack.value.length > 0);
    const canRedo = computed(() => redoStack.value.length > 0);
    const historyEntries = computed(() => undoStack.value
        .map((command, index) => ({
        id: command.id || `command-${index}`,
        label: command.label || command.id || `Command ${index + 1}`,
    }))
        .reverse());
    function execute(command) {
        if (!command?.execute || !command?.undo) {
            return;
        }
        command.execute();
        undoStack.value = [...undoStack.value, command];
        redoStack.value = [];
        lastCommandName.value = command.label || command.id || "Unnamed command";
    }
    function undo() {
        const command = undoStack.value[undoStack.value.length - 1];
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
    function redo() {
        const command = redoStack.value[redoStack.value.length - 1];
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
    function reset() {
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
});
