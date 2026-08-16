/**
 * 打印设计器核心状态 (Pinia setup store)
 * 参照还原文档第三节：state + getters + helpers + actions 分片
 * actions 按职责分区：core / element / selection / history / layer / page / table / guide
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { cloneDeep, createId } from "../core/clone";
import { DEFAULT_CANVAS_SIZE, HistoryAction, Unit, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, } from "../core/constants";
import { createElement } from "../core/elementFactory";
function createEmptyPage(): any {
    return { id: createId("page"), elements: [] };
}
export const useDesignerStore = defineStore("printDesigner", (): any => {
    // ============ state ============
    const pages = ref([createEmptyPage()]) as any;
    const currentPageIndex = ref(0) as any;
    const selectedElementIds = ref([]) as any;
    const canvasSize = ref({ ...DEFAULT_CANVAS_SIZE }) as any;
    const zoom = ref(1) as any;
    const unit: any = ref(Unit.PX) as any;
    const showGrid = ref(true) as any;
    const gridSize = ref(10) as any;
    const snapToGrid = ref(false) as any;
    // 页眉页脚线（距上/下边距）
    const headerLine = ref({ enabled: false, offset: 80 }) as any;
    const footerLine = ref({ enabled: false, offset: 80 }) as any;
    // 水印
    const watermark = ref({
        enabled: false,
        text: "",
        angle: -30,
        color: "#cccccc",
        opacity: 0.3,
        size: 16,
        density: 3,
    }) as any;
    // 辅助线：{ id, axis: 'x'|'y', position }
    const guides = ref([]) as any;
    // 剪贴板
    const clipboard = ref([]) as any;
    // 表格单元格选择态：{ tableId, cells: [{row, col}] }
    const tableSelection = ref(null) as any;
    // 历史快照栈
    const historyPast = ref([]) as any;
    const historyFuture = ref([]) as any;
    const historyPastActionKeys = ref([]) as any;
    const historyFutureActionKeys = ref([]) as any;
    const HISTORY_LIMIT = 50 as any;
    // ============ getters ============
    const currentPage = computed((): any => pages.value[currentPageIndex.value] || null) as any;
    const currentElements = computed((): any => currentPage.value?.elements || []) as any;
    const totalPages = computed((): any => pages.value.length) as any;
    const elementCount = computed((): any => currentElements.value.length) as any;
    const selectedElements = computed((): any => currentElements.value.filter((el: any): any => selectedElementIds.value.includes(el.id))) as any;
    const selectedElement = computed((): any => selectedElements.value.length === 1 ? selectedElements.value[0] : null) as any;
    const hasSelection = computed((): any => selectedElementIds.value.length > 0) as any;
    const canUndo = computed((): any => historyPast.value.length > 0) as any;
    const canRedo = computed((): any => historyFuture.value.length > 0) as any;
    // ============ helpers ============
    function findElement(id: any): any {
        for (const page of pages.value) {
            const el = page.elements.find((e: any): any => e.id === id) as any;
            if (el)
                return el;
        }
        return null;
    }
    function maxZIndex(): any {
        return currentElements.value.reduce((max: any, el: any): any => Math.max(max, el.zIndex || 0), 0);
    }
    // ============ history actions ============
    // 每次可撤销操作前调用：快照当前 pages 压入 past，清空 future
    function pushHistory(actionKey: any = HistoryAction.OTHER): any {
        historyPast.value.push(cloneDeep(pages.value));
        historyPastActionKeys.value.push(actionKey);
        if (historyPast.value.length > HISTORY_LIMIT) {
            historyPast.value.shift();
            historyPastActionKeys.value.shift();
        }
        historyFuture.value = [];
        historyFutureActionKeys.value = [];
    }
    function restoreSnapshot(snapshot: any): any {
        pages.value = cloneDeep(snapshot);
        // 校验当前页索引与选中项有效性
        if (currentPageIndex.value >= pages.value.length) {
            currentPageIndex.value = Math.max(0, pages.value.length - 1);
        }
        const validIds = new Set(currentElements.value.map((e: any): any => e.id)) as any;
        selectedElementIds.value = selectedElementIds.value.filter((id: any): any => validIds.has(id));
    }
    function undo(): any {
        if (!canUndo.value)
            return;
        const snapshot = historyPast.value.pop() as any;
        const key = historyPastActionKeys.value.pop() as any;
        historyFuture.value.push(cloneDeep(pages.value));
        historyFutureActionKeys.value.push(key);
        restoreSnapshot(snapshot);
    }
    function redo(): any {
        if (!canRedo.value)
            return;
        const snapshot = historyFuture.value.pop() as any;
        const key = historyFutureActionKeys.value.pop() as any;
        historyPast.value.push(cloneDeep(pages.value));
        historyPastActionKeys.value.push(key);
        restoreSnapshot(snapshot);
    }
    // PLACEHOLDER_ACTIONS
    return {
        // state
        pages,
        currentPageIndex,
        selectedElementIds,
        canvasSize,
        zoom,
        unit,
        showGrid,
        gridSize,
        snapToGrid,
        headerLine,
        footerLine,
        watermark,
        guides,
        clipboard,
        tableSelection,
        historyPastActionKeys,
        historyFutureActionKeys,
        // getters
        currentPage,
        currentElements,
        totalPages,
        elementCount,
        selectedElements,
        selectedElement,
        hasSelection,
        canUndo,
        canRedo,
        // helpers
        findElement,
        // history
        pushHistory,
        undo,
        redo,
        // PLACEHOLDER_RETURN
    };
}) as any;
