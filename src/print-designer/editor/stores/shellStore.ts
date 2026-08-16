const PANEL_MIN_WIDTH = 280
const PANEL_MIN_HEIGHT = 320
const PANEL_MIN_X = 26
const PANEL_MIN_Y = 26
const RIGHT_PANEL_MIN_WIDTH = 500
const TOP_PANEL_KEYS = ['template', 'pages', 'view', 'properties'] as const
type PanelName = typeof TOP_PANEL_KEYS[number]
interface PanelBounds { width: number, height: number }
interface PanelState { key: PanelName, title: string, visible: boolean, x: number, y: number, width: number, height: number, defaultWidth: number, defaultHeight: number, zIndex: number }
type PanelInput = Omit<PanelState, 'visible' | 'defaultWidth' | 'defaultHeight'>
function createPanelState({ key, title, x, y, width, height, zIndex }: PanelInput): PanelState {
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
  }
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
function clampPanelPosition(panel: PanelState, bounds?: PanelBounds): PanelState {
  if (!bounds?.width || !bounds?.height) {
    return panel
  }
  const maxX = Math.max(PANEL_MIN_X, bounds.width - panel.width)
  const maxY = Math.max(PANEL_MIN_Y, bounds.height - panel.height)
  return {
    ...panel,
    x: clamp(panel.x, PANEL_MIN_X, maxX),
    y: clamp(panel.y, PANEL_MIN_Y, maxY),
  }
}
function clampPanelSize(panel: PanelState, bounds?: PanelBounds): PanelState {
  const maxWidth = bounds?.width ? Math.max(PANEL_MIN_WIDTH, bounds.width - PANEL_MIN_X) : panel.width
  const maxHeight = bounds?.height ? Math.max(PANEL_MIN_HEIGHT, bounds.height - PANEL_MIN_Y) : panel.height
  return {
    ...panel,
    width: clamp(panel.width, PANEL_MIN_WIDTH, maxWidth),
    height: clamp(panel.height, PANEL_MIN_HEIGHT, maxHeight),
  }
}
function createDefaultPanels(): Record<PanelName, PanelState> {
  return {
    template: createPanelState({
      key: 'template',
      title: '模板',
      x: PANEL_MIN_X,
      y: PANEL_MIN_Y,
      width: 320,
      height: 960,
      zIndex: 1,
    }),
    pages: createPanelState({
      key: 'pages',
      title: '页面',
      x: 366,
      y: PANEL_MIN_Y,
      width: 320,
      height: 960,
      zIndex: 2,
    }),
    view: createPanelState({
      key: 'view',
      title: '视图',
      x: 706,
      y: PANEL_MIN_Y,
      width: 340,
      height: 960,
      zIndex: 3,
    }),
    properties: createPanelState({
      key: 'properties',
      title: '属性',
      x: 1066,
      y: PANEL_MIN_Y,
      width: 340,
      height: 960,
      zIndex: 4,
    }),
  }
}
export const useEditorShellStore = defineStore('printDesignerShell', () => {
  const statusbarVisible = shallowRef(true)
  const panelZSeed = shallowRef(4)
  const panels = ref(createDefaultPanels())
  const activeFloatingPanel = shallowRef('')
  const leftDockCollapsed = shallowRef(false)
  const rightDockCollapsed = shallowRef(false)
  const activeLeftPanel = shallowRef('pages')
  const activeRightPanel = shallowRef('properties')
  const leftPanelWidth = shallowRef(360)
  const rightPanelWidth = shallowRef(500)
  function nextZIndex() {
    panelZSeed.value += 1
    return panelZSeed.value
  }
  function getPanel(panelName: PanelName): PanelState | null {
    return panels.value[panelName] || null
  }
  function updatePanel(panelName: PanelName, patch: Partial<PanelState>) {
    const current = getPanel(panelName)
    if (!current) {
      return
    }
    panels.value = {
      ...panels.value,
      [panelName]: {
        ...current,
        ...patch,
      },
    }
  }
  function focusPanel(panelName: PanelName) {
    updatePanel(panelName, {
      zIndex: nextZIndex(),
    })
  }
  function setFloatingPanelVisibility(panelName: PanelName | '', { focusActive = false }: { focusActive?: boolean } = {}) {
    const nextPanels = {} as Record<PanelName, PanelState>
    TOP_PANEL_KEYS.forEach((key) => {
      const panel = getPanel(key)
      if (!panel) {
        return
      }
      const isActivePanel = key === panelName
      const sizedPanel = isActivePanel ? restorePanelSize(panel) : panel
      nextPanels[key] = {
        ...sizedPanel,
        visible: isActivePanel,
        ...(isActivePanel && focusActive
          ? {
              zIndex: nextZIndex(),
            }
          : {}),
      }
    })
    panels.value = nextPanels
  }
  function openPanel(panelName: PanelName) {
    const current = getPanel(panelName)
    if (!current) {
      return
    }
    activeFloatingPanel.value = panelName
    setFloatingPanelVisibility(panelName, { focusActive: true })
  }
  function togglePanel(panelName: PanelName) {
    const current = getPanel(panelName)
    if (!current) {
      return
    }
    if (activeFloatingPanel.value === panelName && current.visible) {
      closePanel(panelName)
      return
    }
    openPanel(panelName)
  }
  function closePanel(panelName: PanelName) {
    if (!getPanel(panelName)) {
      return
    }
    if (activeFloatingPanel.value === panelName) {
      activeFloatingPanel.value = ''
      setFloatingPanelVisibility('')
      return
    }
    updatePanel(panelName, { visible: false })
  }
  function restorePanelSize(panel: PanelState): PanelState {
    return {
      ...panel,
      width: Math.max(panel.width, panel.defaultWidth || panel.width),
      height: Math.max(panel.height, panel.defaultHeight || panel.height),
    }
  }
  function setPanelPosition(panelName: PanelName, x: number, y: number, bounds?: PanelBounds) {
    const current = getPanel(panelName)
    if (!current) {
      return
    }
    const nextPanel = clampPanelPosition({
      ...current,
      x: Math.round(x),
      y: Math.round(y),
    }, bounds)
    updatePanel(panelName, nextPanel)
  }
  function setPanelSize(panelName: PanelName, width: number, height: number, bounds?: PanelBounds) {
    const current = getPanel(panelName)
    if (!current) {
      return
    }
    const nextPanel = clampPanelPosition(clampPanelSize({
      ...current,
      width: Math.round(width),
      height: Math.round(height),
    }, bounds), bounds)
    updatePanel(panelName, nextPanel)
  }
  function ensurePanelBounds(bounds?: PanelBounds) {
    if (!bounds?.width || !bounds?.height) {
      return
    }
    const fallbackPositions: Record<PanelName, { x: number, y: number }> = {
      template: { x: PANEL_MIN_X, y: PANEL_MIN_Y },
      pages: { x: 366, y: PANEL_MIN_Y },
      view: { x: 706, y: PANEL_MIN_Y },
      properties: { x: 1066, y: PANEL_MIN_Y },
    }
    TOP_PANEL_KEYS.forEach((panelName) => {
      const current = getPanel(panelName)
      if (!current) {
        return
      }
      const nextSized = clampPanelSize(restorePanelSize(current), bounds)
      const fallback = fallbackPositions[panelName] || fallbackPositions.template
      const nextPositioned = clampPanelPosition({
        ...nextSized,
        x: current.x > PANEL_MIN_X ? current.x : fallback.x,
        y: current.y > PANEL_MIN_Y
          ? current.y
          : fallback.y,
      }, bounds)
      updatePanel(panelName, nextPositioned)
    })
  }
  function setLeftPanelWidth(width: number) {
    const nextWidth = Math.round(Number(width))
    if (!Number.isFinite(nextWidth)) {
      return
    }
    leftPanelWidth.value = clamp(nextWidth, PANEL_MIN_WIDTH, 520)
  }
  function setRightPanelWidth(width: number) {
    const nextWidth = Math.round(Number(width))
    if (!Number.isFinite(nextWidth)) {
      return
    }
    rightPanelWidth.value = clamp(nextWidth, RIGHT_PANEL_MIN_WIDTH, 760)
  }
  function toggleLeftDock() {
    leftDockCollapsed.value = !leftDockCollapsed.value
  }
  function toggleRightDock() {
    rightDockCollapsed.value = !rightDockCollapsed.value
  }
  function openLeftDock(panelName: string) {
    activeLeftPanel.value = panelName
    leftDockCollapsed.value = false
  }
  function toggleLeftDockPanel(panelName: string) {
    if (activeLeftPanel.value === panelName && !leftDockCollapsed.value) {
      leftDockCollapsed.value = true
      return
    }
    openLeftDock(panelName)
  }
  function openRightDock(panelName: string) {
    activeRightPanel.value = panelName
    rightDockCollapsed.value = false
  }
  function toggleRightDockPanel(panelName: string) {
    if (activeRightPanel.value === panelName && !rightDockCollapsed.value) {
      rightDockCollapsed.value = true
      return
    }
    openRightDock(panelName)
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
  }
})
