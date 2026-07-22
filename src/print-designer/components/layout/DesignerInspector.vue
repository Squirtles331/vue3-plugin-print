<template>
  <aside class="designer-inspector">
    <div class="designer-inspector__header">
      <p class="designer-inspector__eyebrow">Inspector</p>
      <h2 class="designer-inspector__title">检查器</h2>
      <p class="designer-inspector__desc">查看当前页面结构，并编辑选中元素的属性与绑定信息。</p>
    </div>

    <el-tabs v-model="activeTab" class="designer-inspector__tabs" stretch>
      <el-tab-pane label="结构" name="structure">
        <StructurePanel :layers="layers" />
      </el-tab-pane>
      <el-tab-pane label="属性" name="properties">
        <PropertiesPanel :variables="variables" />
      </el-tab-pane>
    </el-tabs>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import PropertiesPanel from "../inspector/PropertiesPanel.vue";
import StructurePanel from "../inspector/StructurePanel.vue";

defineProps({
  layers: {
    type: Array,
    default: () => [],
  },
  variables: {
    type: Array,
    default: () => [],
  },
});

const activeTab = ref("properties");
</script>

<style scoped lang="scss">
.designer-inspector {
  display: flex;
  flex-direction: column;
  width: 320px;
  min-width: 320px;
  background: linear-gradient(180deg, rgba(252, 253, 255, 0.95), rgba(248, 250, 252, 0.98));
  border-left: 1px solid rgba(148, 163, 184, 0.12);
}

.designer-inspector__header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.designer-inspector__eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pd-muted);
}

.designer-inspector__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--pd-strong);
}

.designer-inspector__desc {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--pd-muted);
}

.designer-inspector__tabs {
  flex: 1;
  min-height: 0;
  padding: 0 14px 14px;
}

:deep(.designer-inspector__tabs .el-tabs__header) {
  margin: 0;
  padding-top: 10px;
}

:deep(.designer-inspector__tabs .el-tabs__content) {
  height: calc(100% - 54px);
  overflow: auto;
  padding-top: 14px;
}
</style>
