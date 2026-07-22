import { defineStore } from "pinia";
import { ref } from "vue";

const PANEL_MIN_WIDTH = 280;
const PANEL_MIN_HEIGHT = 320;
const PANEL_MIN_X = 26;
const PANEL_MIN_Y = 26;

function createPanelState({ key, title, x, y, width, height, zIndex }) {
  return {
    key,
    title,
    visible: false,
    x,
    y,
    width,
    height,
    zIndex,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampPanelPosition(panel, bounds) {
  if (!bounds?.width || !bounds?.height) {
    return panel;
  }

  const maxX = Math.max(PANEL_MIN_X, bounds.width - panel.width);
  const maxY = Math.max(PANEL_MIN_Y, bounds.height - panel.height);

  return {
    ...panel,
    x: clamp(panel.x, PANEL_MIN_X, maxX),
    y: clamp(panel.y, PANEL_MIN_Y, maxY),
  };
}

function clampPanelSize(panel, bounds) {
  const maxWidth = bounds?.width ? Math.max(PANEL_MIN_WIDTH, bounds.width - PANEL_MIN_X) : panel.width;
  const maxHeight = bounds?.height ? Math.max(PANEL_MIN_HEIGHT, bounds.height - PANEL_MIN_Y) : panel.height;

  return {
    ...panel,
    width: clamp(panel.width, PANEL_MIN_WIDTH, maxWidth),
    height: clamp(panel.height, PANEL_MIN_HEIGHT, maxHeight),
  };
}

function createDefaultPanels() {
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

export const useEditorShellStore = defineStore("printDesignerShell", () => {
  const statusbarVisible = ref(true);
  const panelZSeed = ref(4);
  const panels = ref(createDefaultPanels());

  function nextZIndex() {
    panelZSeed.value += 1;
    return panelZSeed.value;
  }

  function getPanel(panelName) {
    return panels.value[panelName] || null;
  }

  function updatePanel(panelName, patch) {
    const current = getPanel(panelName);

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

  function focusPanel(panelName) {
    updatePanel(panelName, {
      zIndex: nextZIndex(),
    });
  }

  function openPanel(panelName) {
    const current = getPanel(panelName);

    if (!current) {
      return;
    }

    updatePanel(panelName, {
      visible: true,
    });
    focusPanel(panelName);
  }

  function closePanel(panelName) {
    updatePanel(panelName, {
      visible: false,
    });
  }

  function setPanelPosition(panelName, x, y, bounds) {
    const current = getPanel(panelName);

    if (!current) {
      return;
    }

    const nextPanel = clampPanelPosition(
      {
        ...current,
        x: Math.round(x),
        y: Math.round(y),
      },
      bounds
    );

    updatePanel(panelName, nextPanel);
  }

  function setPanelSize(panelName, width, height, bounds) {
    const current = getPanel(panelName);

    if (!current) {
      return;
    }

    const nextPanel = clampPanelPosition(
      clampPanelSize(
        {
          ...current,
          width: Math.round(width),
          height: Math.round(height),
        },
        bounds
      ),
      bounds
    );

    updatePanel(panelName, nextPanel);
  }

  function ensurePanelBounds(bounds) {
    if (!bounds?.width || !bounds?.height) {
      return;
    }

    const fallbackPositions = {
      template: { x: PANEL_MIN_X, y: PANEL_MIN_Y },
      pages: { x: 366, y: PANEL_MIN_Y },
      view: { x: 706, y: PANEL_MIN_Y },
      properties: { x: 1066, y: PANEL_MIN_Y },
    };

    Object.keys(panels.value).forEach((panelName) => {
      const current = getPanel(panelName);

      if (!current) {
        return;
      }

      const nextSized = clampPanelSize(current, bounds);
      const fallback = fallbackPositions[panelName] || fallbackPositions.template;
      const nextPositioned = clampPanelPosition(
        {
          ...nextSized,
          x: current.x > PANEL_MIN_X ? current.x : fallback.x,
          y:
            current.y > PANEL_MIN_Y
              ? current.y
              : fallback.y,
        },
        bounds
      );

      updatePanel(panelName, nextPositioned);
    });
  }

  return {
    statusbarVisible,
    panels,
    openPanel,
    closePanel,
    focusPanel,
    setPanelPosition,
    setPanelSize,
    ensurePanelBounds,
  };
});
