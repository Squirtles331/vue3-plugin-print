<template>
  <aside
    v-if="!leftDockCollapsed"
    ref="leftDockRef"
    class="left-dock"
    :style="{ width: `${leftPanelWidth}px` }"
  >
    <section class="left-dock__surface">
      <header class="left-dock__header">
        <div>
          <p class="left-dock__eyebrow">任务窗格</p>
          <h2 class="left-dock__title">{{ panelTitle }}</h2>
          <p class="left-dock__description">{{ panelDescription }}</p>
        </div>
        <button class="left-dock__close" type="button" @click="shellStore.toggleLeftDock()">
          收起
        </button>
      </header>

      <div class="left-dock__main">
        <div class="left-dock__tabs">
          <button
            v-for="item in panelItems"
            :key="item.key"
            class="left-dock__tab"
            :class="{ 'is-active': item.key === activeLeftPanel }"
            type="button"
            :title="item.title"
            @click="shellStore.toggleLeftDockPanel(item.key)"
          >
            <el-icon class="left-dock__tab-icon"><component :is="item.icon" /></el-icon>
            <span class="left-dock__tab-label">{{ item.label }}</span>
            <small class="left-dock__tab-count">{{ panelCounts[item.key] }}</small>
          </button>
        </div>

        <div class="left-dock__content">
          <div class="left-dock__tools">
            <el-input
              v-model="searchQuery"
              size="small"
              clearable
              :prefix-icon="Search"
              :placeholder="searchPlaceholder"
            />
            <span class="left-dock__count">{{ panelCountLabel }}</span>
          </div>

          <div class="left-dock__body">
            <InsertAssetsPanel :panel-key="activeLeftPanel" :search-query="searchQuery" />
          </div>
        </div>
      </div>
    </section>

    <div class="left-dock__resizer" @pointerdown="startResize"></div>
  </aside>
</template>

<script setup>
import { CollectionTag, DataLine, Document, Files, Search } from "@element-plus/icons-vue";
import { computed, onBeforeUnmount, shallowRef, ref } from "vue";
import { storeToRefs } from "pinia";
import InsertAssetsPanel from "./InsertAssetsPanel.vue";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorShellStore } from "../stores/shellStore";

const shellStore = useEditorShellStore();
const documentStore = useEditorDocumentStore();
const { activeLeftPanel, leftDockCollapsed, leftPanelWidth } = storeToRefs(shellStore);
const { palette, pages, layers, variables } = storeToRefs(documentStore);
const leftDockRef = ref(null);
const searchQuery = shallowRef("");

const panelItems = [
  { key: "pages", label: "页面", title: "管理模板页面", icon: Document },
  { key: "insert", label: "插入", title: "插入元素和常用控件", icon: CollectionTag },
  { key: "layers", label: "图层", title: "查看并选择页面元素", icon: Files },
  { key: "data", label: "数据", title: "查看可绑定的数据字段", icon: DataLine },
];

const panelTitle = computed(() => {
  const map = {
    pages: "页面管理",
    insert: "插入元素",
    layers: "图层结构",
    data: "数据字段",
  };

  return map[activeLeftPanel.value] || "左侧面板";
});

const panelDescription = computed(() => {
  const map = {
    pages: "切换页面并查看每页纸张信息。",
    insert: "点击或拖拽元素到画布，开始搭建打印模板。",
    layers: "定位当前页面的元素，后续可用于锁定、隐藏和排序。",
    data: "查看模板可绑定的字段，快速确认打印数据来源。",
  };

  return map[activeLeftPanel.value] || "";
});

const panelCounts = computed(() => ({
  pages: pages.value.length,
  insert: palette.value.length,
  layers: layers.value.length,
  data: variables.value.length,
}));

const searchPlaceholder = computed(() => {
  const map = {
    pages: "搜索页面",
    insert: "搜索元素",
    layers: "搜索图层",
    data: "搜索字段路径",
  };

  return map[activeLeftPanel.value] || "搜索";
});

const panelCountLabel = computed(() => `${panelCounts.value[activeLeftPanel.value] || 0} 项`);

function onPointerMove(event) {
  const dockElement = leftDockRef.value;

  if (!dockElement) {
    return;
  }

  const dockRect = dockElement.getBoundingClientRect();
  shellStore.setLeftPanelWidth(event.clientX - dockRect.left);
}

function stopResize() {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", stopResize);
}

function startResize(event) {
  event.preventDefault();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", stopResize);
}

onBeforeUnmount(() => {
  stopResize();
});
</script>

<style scoped lang="scss">
.left-dock {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  border-right: 1px solid #dbe4ef;
  background: #edf2f7;
}

.left-dock__surface {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.left-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #e6ebf2;
  background: #fbfcfe;
}

.left-dock__eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.left-dock__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.1;
}

.left-dock__description {
  margin: 6px 0 0;
  max-width: 240px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.left-dock__close {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.left-dock__close:hover {
  border-color: #bfd3f3;
  background: #f4f8ff;
  color: #2456c7;
}

.left-dock__main {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.left-dock__tabs {
  display: flex;
  width: 112px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-right: 1px solid #e9eef5;
  background: #f8fafd;
}

.left-dock__tab {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #66758c;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.left-dock__tab-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.left-dock__tab-count {
  display: inline-flex;
  min-width: 20px;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.left-dock__tab:hover,
.left-dock__tab.is-active {
  border-color: #c8d9f5;
  background: linear-gradient(180deg, #ffffff 0%, #eef5ff 100%);
  color: #2456c7;
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.12);
}

.left-dock__tab-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 15px;
  color: currentColor;
}

.left-dock__content {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.left-dock__tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #e9eef5;
  background: #ffffff;
}

.left-dock__count {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.left-dock__body {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  background: #ffffff;
}

.left-dock__resizer {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
}

.left-dock__resizer::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  width: 1px;
  background: #d2dbe8;
}
</style>
