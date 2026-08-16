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
function createEmptyPage() {
    return { id: createId("page"), elements: [] };
}
export const useDesignerStore = defineStore("printDesigner", () => {
    // ============ state ============
    const pages = ref([createEmptyPage()]);
    const currentPageIndex = ref(0);
    const selectedElementIds = ref([]);
    const canvasSize = ref({ ...DEFAULT_CANVAS_SIZE });
    const zoom = ref(1);
    const unit = ref(Unit.PX);
    const showGrid = ref(true);
    const gridSize = ref(10);
    const snapToGrid = ref(false);
    // 页眉页脚线（距上/下边距）
    const headerLine = ref({ enabled: false, offset: 80 });
    const footerLine = ref({ enabled: false, offset: 80 });
    // 水印
    const watermark = ref({
        enabled: false,
        text: "",
        angle: -30,
        color: "#cccccc",
        opacity: 0.3,
        size: 16,
        density: 3,
    });
    // 辅助线：{ id, axis: 'x'|'y', position }
    const guides = ref([]);
    // 剪贴板
    const clipboard = ref([]);
    // 表格单元格选择态：{ tableId, cells: [{row, col}] }
    const tableSelection = ref(null);
    // 历史快照栈
    const historyPast = ref([]);
    const historyFuture = ref([]);
    const historyPastActionKeys = ref([]);
    const historyFutureActionKeys = ref([]);
    const HISTORY_LIMIT = 50;
    // ============ getters ============
    const currentPage = computed(() => pages.value[currentPageIndex.value] || null);
    const currentElements = computed(() => currentPage.value?.elements || []);
    const totalPages = computed(() => pages.value.length);
    const elementCount = computed(() => currentElements.value.length);
    const selectedElements = computed(() => currentElements.value.filter((el) => selectedElementIds.value.includes(el.id)));
    const selectedElement = computed(() => selectedElements.value.length === 1 ? selectedElements.value[0] : null);
    const hasSelection = computed(() => selectedElementIds.value.length > 0);
    const canUndo = computed(() => historyPast.value.length > 0);
    const canRedo = computed(() => historyFuture.value.length > 0);
    // ============ helpers ============
    function findElement(id) {
        for (const page of pages.value) {
            const el = page.elements.find((e) => e.id === id);
            if (el)
                return el;
        }
        return null;
    }
    function maxZIndex() {
        return currentElements.value.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
    }
    // ============ history actions ============
    // 每次可撤销操作前调用：快照当前 pages 压入 past，清空 future
    function pushHistory(actionKey = HistoryAction.OTHER) {
        historyPast.value.push(cloneDeep(pages.value));
        historyPastActionKeys.value.push(actionKey);
        if (historyPast.value.length > HISTORY_LIMIT) {
            historyPast.value.shift();
            historyPastActionKeys.value.shift();
        }
        historyFuture.value = [];
        historyFutureActionKeys.value = [];
    }
    function restoreSnapshot(snapshot) {
        pages.value = cloneDeep(snapshot);
        // 校验当前页索引与选中项有效性
        if (currentPageIndex.value >= pages.value.length) {
            currentPageIndex.value = Math.max(0, pages.value.length - 1);
        }
        const validIds = new Set(currentElements.value.map((e) => e.id));
        selectedElementIds.value = selectedElementIds.value.filter((id) => validIds.has(id));
    }
    function undo() {
        if (!canUndo.value)
            return;
        const snapshot = historyPast.value.pop();
        const key = historyPastActionKeys.value.pop();
        historyFuture.value.push(cloneDeep(pages.value));
        historyFutureActionKeys.value.push(key);
        restoreSnapshot(snapshot);
    }
    function redo() {
        if (!canRedo.value)
            return;
        const snapshot = historyFuture.value.pop();
        const key = historyFutureActionKeys.value.pop();
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
});
