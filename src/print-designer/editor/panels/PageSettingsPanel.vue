<template>
  <div class="page-settings-panel">
    <label class="page-settings-panel__field">
      <span>纸张尺寸</span>
      <el-select
        :model-value="currentPaperPresetKey"
        placeholder="选择纸张尺寸"
        @change="documentStore.setPaperPreset"
      >
        <el-option-group
          v-for="group in paperSizeGroups"
          :key="group.group"
          :label="group.group"
        >
          <el-option
            v-for="option in group.options"
            :key="option.key"
            :label="option.recommended ? `${option.label} · 常用` : option.label"
            :value="option.key"
          />
        </el-option-group>
        <el-option label="自定义尺寸" :value="CUSTOM_PAPER_SIZE_KEY" />
      </el-select>
    </label>

    <label class="page-settings-panel__field">
      <span>单位</span>
      <el-select :model-value="unit" @change="documentStore.setUnit">
        <el-option label="毫米" value="mm" />
        <el-option label="像素" value="px" />
      </el-select>
    </label>

    <div class="page-settings-panel__row">
      <label class="page-settings-panel__field">
        <span>宽度 (mm)</span>
        <el-input-number
          :model-value="pageWidthMm"
          :min="20"
          :max="1000"
          :precision="1"
          controls-position="right"
          @change="onWidthChange"
        />
      </label>

      <label class="page-settings-panel__field">
        <span>高度 (mm)</span>
        <el-input-number
          :model-value="pageHeightMm"
          :min="20"
          :max="1500"
          :precision="1"
          controls-position="right"
          @change="onHeightChange"
        />
      </label>
    </div>

    <div class="page-settings-panel__row">
      <label class="page-settings-panel__field">
        <span>水平边距 (mm)</span>
        <el-input-number
          :model-value="marginXMm"
          :min="0"
          :max="200"
          :precision="1"
          controls-position="right"
          @change="documentStore.setMarginX"
        />
      </label>

      <label class="page-settings-panel__field">
        <span>垂直边距 (mm)</span>
        <el-input-number
          :model-value="marginYMm"
          :min="0"
          :max="200"
          :precision="1"
          controls-position="right"
          @change="documentStore.setMarginY"
        />
      </label>
    </div>

    <div class="page-settings-panel__color-row">
      <span class="page-settings-panel__color-label">背景颜色</span>
      <input
        class="page-settings-panel__color"
        :value="pageBackground"
        type="color"
        @input="documentStore.setPageBackground($event.target.value)"
      />
    </div>

    <div class="page-settings-panel__separator"></div>

    <label class="page-settings-panel__toggle">
      <span>显示角标</span>
      <el-switch :model-value="pageCornerVisible" @change="documentStore.togglePageCorner" />
    </label>

    <div class="page-settings-panel__section-title">
      <span>页眉页脚</span>
    </div>

    <div class="page-settings-panel__line-row">
      <el-switch :model-value="headerLineVisible" @change="documentStore.toggleHeaderLine" />
      <span class="page-settings-panel__line-label">页眉线</span>
      <el-input-number
        :model-value="headerOffsetMm"
        :min="0"
        :max="200"
        :precision="1"
        controls-position="right"
        @change="documentStore.setHeaderOffset"
      />
      <span class="page-settings-panel__unit-label">毫米</span>
    </div>

    <div class="page-settings-panel__line-row">
      <el-switch :model-value="footerLineVisible" @change="documentStore.toggleFooterLine" />
      <span class="page-settings-panel__line-label">页脚线</span>
      <el-input-number
        :model-value="footerOffsetMm"
        :min="0"
        :max="200"
        :precision="1"
        controls-position="right"
        @change="documentStore.setFooterOffset"
      />
      <span class="page-settings-panel__unit-label">毫米</span>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { CUSTOM_PAPER_SIZE_KEY, PAPER_SIZE_PRESETS } from "../paperSizePresets";
import { useEditorDocumentStore } from "../stores/documentStore";

const documentStore = useEditorDocumentStore();

const {
  currentPaperPresetKey,
  unit,
  pageWidthMm,
  pageHeightMm,
  marginXMm,
  marginYMm,
  pageBackground,
  pageCornerVisible,
  headerLineVisible,
  footerLineVisible,
  headerOffsetMm,
  footerOffsetMm,
} = storeToRefs(documentStore);

const paperSizeGroups = PAPER_SIZE_PRESETS;

function onWidthChange(value) {
  documentStore.setPageDimensions(value, pageHeightMm.value);
}

function onHeightChange(value) {
  documentStore.setPageDimensions(pageWidthMm.value, value);
}
</script>

<style scoped lang="scss">
.page-settings-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

.page-settings-panel__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.page-settings-panel__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.page-settings-panel__field span,
.page-settings-panel__toggle span,
.page-settings-panel__color-label,
.page-settings-panel__section-title span,
.page-settings-panel__line-label,
.page-settings-panel__unit-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.page-settings-panel__color-row,
.page-settings-panel__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-settings-panel__color {
  width: 44px;
  height: 28px;
  padding: 2px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-control);
  background: var(--pd-surface-bg);
}

.page-settings-panel__separator {
  height: 1px;
  margin: 2px 0;
  background: var(--pd-divider);
}

.page-settings-panel__section-title {
  padding-top: 2px;
}

.page-settings-panel__section-title span {
  font-size: 13px;
  font-weight: 700;
  color: var(--pd-strong);
}

.page-settings-panel__line-row {
  display: grid;
  grid-template-columns: auto 1fr minmax(96px, 112px) auto;
  align-items: center;
  gap: 10px;
}

.page-settings-panel__line-label {
  min-width: 0;
}

.page-settings-panel__unit-label {
  color: var(--pd-muted);
}

:deep(.page-settings-panel .el-select),
:deep(.page-settings-panel .el-input-number) {
  width: 100%;
}

:deep(.page-settings-panel .el-select__wrapper),
:deep(.page-settings-panel .el-input-number),
:deep(.page-settings-panel .el-input__wrapper) {
  border-radius: var(--pd-radius-control);
  background: var(--pd-surface-bg);
  box-shadow: inset 0 0 0 1px var(--pd-border);
}

@media (max-width: 420px) {
  .page-settings-panel__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-settings-panel__line-row {
    grid-template-columns: auto 1fr;
  }
}
</style>
