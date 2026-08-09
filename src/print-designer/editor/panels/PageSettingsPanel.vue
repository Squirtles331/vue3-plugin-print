<template>
  <div class="page-settings-panel">
    <p class="page-settings-panel__scope">以下为文档默认页面设置，应用于所有页面。辅助线仅在编辑器显示；印刷标记会进入预览和浏览器打印。</p>

    <label class="page-settings-panel__field">
      <span>模板名称</span>
      <el-input :model-value="documentName" maxlength="160" @change="documentStore.setDocumentName($event)" />
    </label>
    <label class="page-settings-panel__field">
      <span>当前页名称</span>
      <el-input :model-value="currentPageTitle" maxlength="160" @change="documentStore.setCurrentPageTitle($event)" />
    </label>

    <label class="page-settings-panel__field">
      <span>纸张尺寸</span>
      <el-select :model-value="currentPaperPresetKey" placeholder="选择纸张尺寸" @change="documentStore.setPaperPreset">
        <el-option-group v-for="group in paperSizeGroups" :key="group.group" :label="group.group">
          <el-option v-for="option in group.options" :key="option.key" :label="option.recommended ? `${option.label} · 常用` : option.label" :value="option.key" />
        </el-option-group>
        <el-option label="自定义尺寸" :value="CUSTOM_PAPER_SIZE_KEY" />
      </el-select>
    </label>

    <div class="page-settings-panel__row">
      <label class="page-settings-panel__field">
        <span>方向</span>
        <el-select :model-value="orientation" @change="documentStore.setOrientation($event)">
          <el-option label="纵向" value="portrait" />
          <el-option label="横向" value="landscape" />
        </el-select>
      </label>
      <label class="page-settings-panel__field">
        <span>单位</span>
        <el-select :model-value="unit" @change="documentStore.setUnit">
          <el-option label="毫米" value="mm" />
          <el-option label="像素" value="px" />
        </el-select>
      </label>
    </div>

    <div class="page-settings-panel__row">
      <label class="page-settings-panel__field"><span>宽度 (mm)</span><el-input-number :model-value="pageWidthMm" :min="20" :max="1000" :precision="1" controls-position="right" @change="onWidthChange" /></label>
      <label class="page-settings-panel__field"><span>高度 (mm)</span><el-input-number :model-value="pageHeightMm" :min="20" :max="1500" :precision="1" controls-position="right" @change="onHeightChange" /></label>
    </div>

    <div class="page-settings-panel__section-title">页边距 (mm)</div>
    <div class="page-settings-panel__margin-grid">
      <label class="page-settings-panel__field"><span>上</span><el-input-number :model-value="marginTopMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setMargins({ top: $event })" /></label>
      <label class="page-settings-panel__field"><span>右</span><el-input-number :model-value="marginRightMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setMargins({ right: $event })" /></label>
      <label class="page-settings-panel__field"><span>下</span><el-input-number :model-value="marginBottomMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setMargins({ bottom: $event })" /></label>
      <label class="page-settings-panel__field"><span>左</span><el-input-number :model-value="marginLeftMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setMargins({ left: $event })" /></label>
    </div>

    <div class="page-settings-panel__color-row"><span class="page-settings-panel__color-label">页面背景</span><input class="page-settings-panel__color" :value="pageBackground" type="color" @input="documentStore.setPageBackground($event.target.value)" /></div>

    <div class="page-settings-panel__section-title">辅助与印刷标记</div>
    <label class="page-settings-panel__toggle"><span>编辑器角标（不打印）</span><el-switch :model-value="pageCornerVisible" @change="documentStore.togglePageCorner" /></label>
    <label class="page-settings-panel__toggle"><span>浏览器打印标记</span><el-switch :model-value="printMarksVisible" @change="documentStore.togglePrintMarks" /></label>
    <div class="page-settings-panel__line-row"><el-switch :model-value="headerLineVisible" @change="documentStore.toggleHeaderLine" /><span class="page-settings-panel__line-label">页眉辅助线（不打印）</span><el-input-number :model-value="headerOffsetMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setHeaderOffset" /></div>
    <div class="page-settings-panel__line-row"><el-switch :model-value="footerLineVisible" @change="documentStore.toggleFooterLine" /><span class="page-settings-panel__line-label">页脚辅助线（不打印）</span><el-input-number :model-value="footerOffsetMm" :min="0" :max="200" :precision="1" controls-position="right" @change="documentStore.setFooterOffset" /></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { CUSTOM_PAPER_SIZE_KEY, PAPER_SIZE_PRESETS } from "../paperSizePresets";
import { useEditorDocumentStore } from "../stores/documentStore";

const documentStore = useEditorDocumentStore();
const { currentPaperPresetKey, unit, pageWidthMm, pageHeightMm, marginTopMm, marginRightMm, marginBottomMm, marginLeftMm, pageBackground, pageCornerVisible, headerLineVisible, footerLineVisible, headerOffsetMm, footerOffsetMm, printMarksVisible, documentName, currentPageTitle } = storeToRefs(documentStore);
const paperSizeGroups = PAPER_SIZE_PRESETS;
const orientation = computed(() => (pageWidthMm.value > pageHeightMm.value ? "landscape" : "portrait"));
function onWidthChange(value) { documentStore.setPageDimensions(value, pageHeightMm.value); }
function onHeightChange(value) { documentStore.setPageDimensions(pageWidthMm.value, value); }
</script>

<style scoped lang="scss">
.page-settings-panel { display: flex; min-width: 0; flex-direction: column; gap: 12px; }.page-settings-panel__scope { margin: 0; padding: 8px 10px; border: 1px solid #dbeafe; background: #eff6ff; color: #1e40af; font-size: 12px; line-height: 1.55; }.page-settings-panel__row, .page-settings-panel__margin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }.page-settings-panel__margin-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }.page-settings-panel__field { display: flex; min-width: 0; flex-direction: column; gap: 6px; }.page-settings-panel__field span, .page-settings-panel__toggle span, .page-settings-panel__color-label, .page-settings-panel__section-title, .page-settings-panel__line-label { font-size: 12px; font-weight: 500; color: #374151; }.page-settings-panel__section-title { padding-top: 4px; font-size: 13px; font-weight: 700; color: #1f2937; }.page-settings-panel__color-row, .page-settings-panel__toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; }.page-settings-panel__color { width: 44px; height: 28px; padding: 2px; border: 1px solid var(--pd-border); border-radius: var(--pd-radius-control); background: var(--pd-surface-bg); }.page-settings-panel__line-row { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(96px, 112px); align-items: center; gap: 10px; }:deep(.page-settings-panel .el-select), :deep(.page-settings-panel .el-input-number) { width: 100%; }:deep(.page-settings-panel .el-select__wrapper), :deep(.page-settings-panel .el-input-number), :deep(.page-settings-panel .el-input__wrapper) { border-radius: var(--pd-radius-control); background: var(--pd-surface-bg); box-shadow: inset 0 0 0 1px var(--pd-border); } @media (max-width: 480px) { .page-settings-panel__margin-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.page-settings-panel__line-row { grid-template-columns: auto 1fr; }.page-settings-panel__line-row :deep(.el-input-number) { grid-column: 2; } }
</style>
