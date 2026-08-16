import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
const PANEL_MIN_WIDTH = 280 as any;
const PANEL_MIN_HEIGHT = 320 as any;
const PANEL_MIN_X = 26 as any;
const PANEL_MIN_Y = 26 as any;
const RIGHT_PANEL_MIN_WIDTH = 500 as any;
const TOP_PANEL_KEYS = ["template", "pages", "view", "properties"] as any;
function createPanelState({ key, title, x, y, width, height, zIndex }: any): any {
    return {
        key,
        title,
        visible: false,
        x,
        y,
        width,
        height,
        defaultWidth: width,
        defaultHeight: height,
        zIndex,
    };
}
function clamp(value: any, min: any, max: any): any {
    return Math.min(max, Math.max(min, value));
}
function clampPanelPosition(panel: any, bounds: any): any {
    if (!bounds?.width || !bounds?.height) {
        return panel;
    }
    const maxX = Math.max(PANEL_MIN_X, bounds.width - panel.width) as any;
    const maxY = Math.max(PANEL_MIN_Y, bounds.height - panel.height) as any;
    return {
        ...panel,
        x: clamp(panel.x, PANEL_MIN_X, maxX),
        y: clamp(panel.y, PANEL_MIN_Y, maxY),
    };
}
function clampPanelSize(panel: any, bounds: any): any {
    const maxWidth = bounds?.width ? Math.max(PANEL_MIN_WIDTH, bounds.width - PANEL_MIN_X) : panel.width as any;
    const maxHeight = bounds?.height ? Math.max(PANEL_MIN_HEIGHT, bounds.height - PANEL_MIN_Y) : panel.height as any;
    return {
        ...panel,
        width: clamp(panel.width, PANEL_MIN_WIDTH, maxWidth),
        height: clamp(panel.height, PANEL_MIN_HEIGHT, maxHeight),
    };
}
function createDefaultPanels(): any {
    return {
        template: createPanelState({
            key: "template",
            title: "模板",
            x: PANEL_MIN_X,
            y: PANEL_MIN_Y,
            width: 320,
            height: 960,
            zIndex: 1,
        }),
        pages: createPanelState({
            key: "pages",
            title: "页面",
            x: 366,
            y: PANEL_MIN_Y,
            width: 320,
            height: 960,
            zIndex: 2,
        }),
        view: createPanelState({
            key: "view",
            title: "视图",
            x: 706,
            y: PANEL_MIN_Y,
            width: 340,
            height: 960,
            zIndex: 3,
        }),
        properties: createPanelState({
            key: "properties",
            title: "属性",
            x: 1066,
            y: PANEL_MIN_Y,
            width: 340,
            height: 960,
            zIndex: 4,
        }),
    };
}
export const useEditorShellStore = defineStore("printDesignerShell", (): any => {
    const statusbarVisible = shallowRef(true) as any;
    const panelZSeed = shallowRef(4) as any;
    const panels = ref(createDefaultPanels()) as any;
    const activeFloatingPanel = shallowRef("") as any;
    const leftDockCollapsed = shallowRef(false) as any;
    const rightDockCollapsed = shallowRef(false) as any;
    const activeLeftPanel = shallowRef("pages") as any;
    const activeRightPanel = shallowRef("properties") as any;
    const leftPanelWidth = shallowRef(360) as any;
    const rightPanelWidth = shallowRef(500) as any;
    function nextZIndex(): any {
        panelZSeed.value += 1;
        return panelZSeed.value;
    }
    function getPanel(panelName: any): any {
        return panels.value[panelName] || null;
    }
    function updatePanel(panelName: any, patch: any): any {
        const current = getPanel(panelName) as any;
        if (!current) {
            return;
        }
        panels.value = {
            ...panels.value,
            [panelName]: {
                ...current,
                ...patch,
            },
        };
    }
    function focusPanel(panelName: any): any {
        updatePanel(panelName, {
            zIndex: nextZIndex(),
        });
    }
    function setFloatingPanelVisibility(panelName: any, { focusActive = false }: any = {}): any {
        const nextPanels = {} as any;
        TOP_PANEL_KEYS.forEach((key: any): any => {
            const panel = getPanel(key) as any;
            if (!panel) {
                return;
            }
            const isActivePanel = key === panelName as any;
            const sizedPanel = isActivePanel ? restorePanelSize(panel) : panel as any;
            nextPanels[key] = {
                ...sizedPanel,
                visible: isActivePanel,
                ...(isActivePanel && focusActive
                    ? {
                        zIndex: nextZIndex(),
                    }
                    : {}),
            };
        });
        panels.value = nextPanels;
    }
    function openPanel(panelName: any): any {
        const current = getPanel(panelName) as any;
        if (!current) {
            return;
        }
        activeFloatingPanel.value = panelName;
        setFloatingPanelVisibility(panelName, { focusActive: true });
    }
    function togglePanel(panelName: any): any {
        const current = getPanel(panelName) as any;
        if (!current) {
            return;
        }
        if (activeFloatingPanel.value === panelName && current.visible) {
            closePanel(panelName);
            return;
        }
        openPanel(panelName);
    }
    function closePanel(panelName: any): any {
        if (!getPanel(panelName)) {
            return;
        }
        if (activeFloatingPanel.value === panelName) {
            activeFloatingPanel.value = "";
            setFloatingPanelVisibility("");
            return;
        }
        updatePanel(panelName, { visible: false });
    }
    function restorePanelSize(panel: any): any {
        return {
            ...panel,
            width: Math.max(panel.width, panel.defaultWidth || panel.width),
            height: Math.max(panel.height, panel.defaultHeight || panel.height),
        };
    }
    function setPanelPosition(panelName: any, x: any, y: any, bounds: any): any {
        const current = getPanel(panelName) as any;
        if (!current) {
            return;
        }
        const nextPanel = clampPanelPosition({
            ...current,
            x: Math.round(x),
            y: Math.round(y),
        }, bounds) as any;
        updatePanel(panelName, nextPanel);
    }
    function setPanelSize(panelName: any, width: any, height: any, bounds: any): any {
        const current = getPanel(panelName) as any;
        if (!current) {
            return;
        }
        const nextPanel = clampPanelPosition(clampPanelSize({
            ...current,
            width: Math.round(width),
            height: Math.round(height),
        }, bounds), bounds) as any;
        updatePanel(panelName, nextPanel);
    }
    function ensurePanelBounds(bounds: any): any {
        if (!bounds?.width || !bounds?.height) {
            return;
        }
        const fallbackPositions = {
            template: { x: PANEL_MIN_X, y: PANEL_MIN_Y },
            pages: { x: 366, y: PANEL_MIN_Y },
            view: { x: 706, y: PANEL_MIN_Y },
            properties: { x: 1066, y: PANEL_MIN_Y },
        } as any;
        Object.keys(panels.value).forEach((panelName: any): any => {
            const current = getPanel(panelName) as any;
            if (!current) {
                return;
            }
            const nextSized = clampPanelSize(restorePanelSize(current), bounds) as any;
            const fallback = fallbackPositions[panelName] || fallbackPositions.template as any;
            const nextPositioned = clampPanelPosition({
                ...nextSized,
                x: current.x > PANEL_MIN_X ? current.x : fallback.x,
                y: current.y > PANEL_MIN_Y
                    ? current.y
                    : fallback.y,
            }, bounds) as any;
            updatePanel(panelName, nextPositioned);
        });
    }
    function setLeftPanelWidth(width: any): any {
        const nextWidth = Math.round(Number(width)) as any;
        if (!Number.isFinite(nextWidth)) {
            return;
        }
        leftPanelWidth.value = clamp(nextWidth, PANEL_MIN_WIDTH, 520);
    }
    function setRightPanelWidth(width: any): any {
        const nextWidth = Math.round(Number(width)) as any;
        if (!Number.isFinite(nextWidth)) {
            return;
        }
        rightPanelWidth.value = clamp(nextWidth, RIGHT_PANEL_MIN_WIDTH, 760);
    }
    function toggleLeftDock(): any {
        leftDockCollapsed.value = !leftDockCollapsed.value;
    }
    function toggleRightDock(): any {
        rightDockCollapsed.value = !rightDockCollapsed.value;
    }
    function openLeftDock(panelName: any): any {
        activeLeftPanel.value = panelName;
        leftDockCollapsed.value = false;
    }
    function toggleLeftDockPanel(panelName: any): any {
        if (activeLeftPanel.value === panelName && !leftDockCollapsed.value) {
            leftDockCollapsed.value = true;
            return;
        }
        openLeftDock(panelName);
    }
    function openRightDock(panelName: any): any {
        activeRightPanel.value = panelName;
        rightDockCollapsed.value = false;
    }
    function toggleRightDockPanel(panelName: any): any {
        if (activeRightPanel.value === panelName && !rightDockCollapsed.value) {
            rightDockCollapsed.value = true;
            return;
        }
        openRightDock(panelName);
    }
    return {
        statusbarVisible,
        panels,
        activeFloatingPanel,
        openPanel,
        togglePanel,
        closePanel,
        focusPanel,
        leftDockCollapsed,
        rightDockCollapsed,
        activeLeftPanel,
        activeRightPanel,
        leftPanelWidth,
        rightPanelWidth,
        setLeftPanelWidth,
        setRightPanelWidth,
        toggleLeftDock,
        toggleRightDock,
        openLeftDock,
        openRightDock,
        toggleLeftDockPanel,
        toggleRightDockPanel,
        setPanelPosition,
        setPanelSize,
        ensurePanelBounds,
    };
}) as any;
