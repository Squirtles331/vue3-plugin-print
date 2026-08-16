import { defineStore } from "pinia";
import { ref } from "vue";
export const useEditorToolStore = defineStore("printDesignerTool", (): any => {
    const activeTool = ref("select") as any;
    const previousTool = ref(null) as any;
    const pointerMode = ref("default") as any;
    const dragState = ref(null) as any;
    function setActiveTool(tool: any): any {
        previousTool.value = activeTool.value;
        activeTool.value = tool;
    }
    return {
        activeTool,
        previousTool,
        pointerMode,
        dragState,
        setActiveTool,
    };
}) as any;
