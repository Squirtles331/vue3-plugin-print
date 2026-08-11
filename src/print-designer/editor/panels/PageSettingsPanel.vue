<template>
  <div class="page-settings-panel">
    <header class="page-settings-panel__header">
      <div>
        <p class="page-settings-panel__eyebrow">页面设置</p>
        <h2 class="page-settings-panel__title">文档页面</h2>
        <p class="page-settings-panel__description">
          控制纸张、边距和打印辅助线。修改后会同步到预览与输出。
        </p>
      </div>
      <div class="page-settings-panel__badge">
        <strong>{{ pageSummary.shortLabel }}</strong>
        <span>{{ pageSummary.detail }}</span>
      </div>
    </header>

    <div class="page-settings-panel__summary">
      <div class="page-settings-panel__summary-chip">
        <strong>纸张</strong>
        <span>{{ paperSizeLabel }}</span>
      </div>
      <div class="page-settings-panel__summary-chip">
        <strong>方向</strong>
        <span>{{ orientationLabel }}</span>
      </div>
      <div class="page-settings-panel__summary-chip">
        <strong>边距</strong>
        <span>{{ marginSummary }}</span>
      </div>
      <div class="page-settings-panel__summary-chip">
        <strong>辅助</strong>
        <span>{{ helperSummary }}</span>
      </div>
    </div>

    <section class="page-settings-panel__section">
      <div class="page-settings-panel__section-title">文档信息</div>
      <div class="page-settings-panel__field-stack">
        <label class="page-settings-panel__field">
          <span>模板名称</span>
          <PdInput :model-value="documentName" maxlength="160" @change="documentStore.setDocumentName($event)" />
        </label>
        <label class="page-settings-panel__field">
          <span>当前页名称</span>
          <PdInput :model-value="currentPageTitle" maxlength="160" @change="documentStore.setCurrentPageTitle($event)" />
        </label>
      </div>
    </section>

    <section class="page-settings-panel__section">
      <div class="page-settings-panel__section-title">纸张与方向</div>
      <div class="page-settings-panel__preset-grid">
        <button
          v-for="option in recommendedPaperOptions"
          :key="option.key"
          type="button"
          class="page-settings-panel__preset"
          :class="{ 'is-active': currentPaperPresetKey === option.key }"
          @click="documentStore.setPaperPreset(option.key)"
        >
          <strong>{{ option.label }}</strong>
          <span>{{ option.widthMm }} x {{ option.heightMm }} mm</span>
        </button>
      </div>

      <label class="page-settings-panel__field">
        <span>纸张尺寸</span>
        <PdSelect
          :model-value="currentPaperPresetKey"
          placeholder="选择纸张尺寸"
          @change="documentStore.setPaperPreset"
        >
          <PdOptionGroup v-for="group in paperSizeGroups" :key="group.group" :label="group.group">
            <PdOption
              v-for="option in group.options"
              :key="option.key"
              :label="option.recommended ? `${option.label} · 常用` : option.label"
              :value="option.key"
            />
          </PdOptionGroup>
          <PdOption label="自定义尺寸" :value="CUSTOM_PAPER_SIZE_KEY" />
        </PdSelect>
      </label>

      <div class="page-settings-panel__grid-2">
        <label class="page-settings-panel__field">
          <span>方向</span>
          <PdSelect :model-value="orientation" @change="documentStore.setOrientation($event)">
            <PdOption label="纵向" value="portrait" />
            <PdOption label="横向" value="landscape" />
          </PdSelect>
        </label>
        <label class="page-settings-panel__field">
          <span>单位</span>
          <span class="page-settings-panel__unit">毫米 (mm)</span>
        </label>
      </div>

      <div class="page-settings-panel__grid-2">
        <label class="page-settings-panel__field">
          <span>宽度 (mm)</span>
          <PdInputNumber
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
          <PdInputNumber
            :model-value="pageHeightMm"
            :min="20"
            :max="1500"
            :precision="1"
            controls-position="right"
            @change="onHeightChange"
          />
        </label>
      </div>
    </section>

    <section class="page-settings-panel__section">
      <div class="page-settings-panel__section-title">边距</div>
      <div class="page-settings-panel__margin-grid">
        <label class="page-settings-panel__field">
          <span>上</span>
          <PdInputNumber :model-value="marginTopMm" :min="0" :max="200" :precision="1" @change="documentStore.setMargins({ top: $event })" />
        </label>
        <label class="page-settings-panel__field">
          <span>右</span>
          <PdInputNumber :model-value="marginRightMm" :min="0" :max="200" :precision="1" @change="documentStore.setMargins({ right: $event })" />
        </label>
        <label class="page-settings-panel__field">
          <span>下</span>
          <PdInputNumber :model-value="marginBottomMm" :min="0" :max="200" :precision="1" @change="documentStore.setMargins({ bottom: $event })" />
        </label>
        <label class="page-settings-panel__field">
          <span>左</span>
          <PdInputNumber :model-value="marginLeftMm" :min="0" :max="200" :precision="1" @change="documentStore.setMargins({ left: $event })" />
        </label>
      </div>
    </section>

    <section class="page-settings-panel__section">
      <div class="page-settings-panel__section-title">打印辅助</div>
      <div class="page-settings-panel__field-stack">
        <div class="page-settings-panel__toggle-row">
          <span>页面背景</span>
          <input class="page-settings-panel__color" :value="pageBackground" type="color" @input="documentStore.setPageBackground($event.target.value)" />
        </div>

        <label class="page-settings-panel__toggle">
          <span>编辑器角标（不打印）</span>
          <PdSwitch :model-value="pageCornerVisible" @change="documentStore.togglePageCorner" />
        </label>

        <label class="page-settings-panel__toggle">
          <span>浏览器打印标记</span>
          <PdSwitch :model-value="printMarksVisible" @change="documentStore.togglePrintMarks" />
        </label>

        <div class="page-settings-panel__line-row">
          <PdSwitch :model-value="headerLineVisible" @change="documentStore.toggleHeaderLine" />
          <span class="page-settings-panel__line-label">页眉辅助线（不打印）</span>
          <PdInputNumber :model-value="headerOffsetMm" :min="0" :max="200" :precision="1" @change="documentStore.setHeaderOffset" />
        </div>

        <div class="page-settings-panel__line-row">
          <PdSwitch :model-value="footerLineVisible" @change="documentStore.toggleFooterLine" />
          <span class="page-settings-panel__line-label">页脚辅助线（不打印）</span>
          <PdInputNumber :model-value="footerOffsetMm" :min="0" :max="200" :precision="1" @change="documentStore.setFooterOffset" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import PdInput from "../../ui/primitives/PdInput.vue";
import PdInputNumber from "../../ui/primitives/PdInputNumber.vue";
import PdOption from "../../ui/primitives/PdOption.vue";
import PdOptionGroup from "../../ui/primitives/PdOptionGroup.vue";
import PdSelect from "../../ui/primitives/PdSelect.vue";
import PdSwitch from "../../ui/primitives/PdSwitch.vue";
import { CUSTOM_PAPER_SIZE_KEY, PAPER_SIZE_PRESETS } from "../paperSizePresets";
import { useEditorDocumentStore } from "../stores/documentStore";

const documentStore = useEditorDocumentStore();

const {
  currentPaperPresetKey,
  unit,
  pageWidthMm,
  pageHeightMm,
  marginTopMm,
  marginRightMm,
  marginBottomMm,
  marginLeftMm,
  pageBackground,
  pageCornerVisible,
  headerLineVisible,
  footerLineVisible,
  headerOffsetMm,
  footerOffsetMm,
  printMarksVisible,
  documentName,
  currentPageTitle,
} = storeToRefs(documentStore);

const paperSizeGroups = PAPER_SIZE_PRESETS;
const recommendedPaperOptions = paperSizeGroups[0]?.options || [];

const orientation = computed(() => (pageWidthMm.value > pageHeightMm.value ? "landscape" : "portrait"));
const orientationLabel = computed(() => (orientation.value === "landscape" ? "横向" : "纵向"));
const paperSizeLabel = computed(() => {
  if (currentPaperPresetKey.value === CUSTOM_PAPER_SIZE_KEY) {
    return "自定义";
  }

  return paperSizeGroups
    .flatMap((group) => group.options || [])
    .find((option) => option.key === currentPaperPresetKey.value)?.label || "纸张";
});
const marginSummary = computed(() => `${marginTopMm.value}/${marginRightMm.value}/${marginBottomMm.value}/${marginLeftMm.value} mm`);
const helperSummary = computed(() => {
  const active = [
    pageCornerVisible.value ? "角标" : "",
    printMarksVisible.value ? "标记" : "",
    headerLineVisible.value ? "页眉线" : "",
    footerLineVisible.value ? "页脚线" : "",
  ].filter(Boolean);

  return active.length ? active.join(" · ") : "已关闭";
});
const pageSummary = computed(() => ({
  shortLabel: paperSizeLabel.value,
  detail: `${pageWidthMm.value} x ${pageHeightMm.value} mm`,
}));

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

.page-settings-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-settings-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}

.page-settings-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.page-settings-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.page-settings-panel__badge {
  display: flex;
  min-width: 76px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #f8fafc;
  text-align: center;
}

.page-settings-panel__badge strong {
  color: var(--pd-strong);
  font-size: 16px;
  line-height: 1;
}

.page-settings-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.page-settings-panel__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.page-settings-panel__summary-chip {
  display: flex;
  min-height: 56px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: #f8fafc;
}

.page-settings-panel__summary-chip strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.page-settings-panel__summary-chip span {
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.page-settings-panel__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: var(--pd-panel-bg);
}

.page-settings-panel__section-title {
  color: var(--pd-strong);
  font-size: 12px;
  font-weight: 700;
}

.page-settings-panel__field-stack,
.page-settings-panel__grid-2,
.page-settings-panel__margin-grid {
  display: grid;
  gap: 12px;
}

.page-settings-panel__field-stack {
  grid-template-columns: minmax(0, 1fr);
}

.page-settings-panel__grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.page-settings-panel__margin-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.page-settings-panel__preset-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.page-settings-panel__preset {
  display: flex;
  min-height: 56px;
  flex-direction: column;
  gap: 4px;
  padding: 10px 11px;
  border: 1px solid var(--pd-border);
  border-radius: 6px;
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
}

.page-settings-panel__preset:hover,
.page-settings-panel__preset.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.page-settings-panel__preset strong {
  color: var(--pd-strong);
  font-size: 12px;
}

.page-settings-panel__preset span {
  color: var(--pd-muted);
  font-size: 11px;
  line-height: 1.4;
}

.page-settings-panel__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.page-settings-panel__field span,
.page-settings-panel__toggle span,
.page-settings-panel__toggle-row span,
.page-settings-panel__line-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.page-settings-panel__unit {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
}

.page-settings-panel__toggle,
.page-settings-panel__toggle-row {
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
  border-radius: 4px;
  background: var(--pd-surface-bg);
}

.page-settings-panel__line-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(96px, 112px);
  align-items: center;
  gap: 10px;
}

.page-settings-panel :deep(.pd-select),
.page-settings-panel :deep(.pd-input-number),
.page-settings-panel :deep(.pd-input) {
  width: 100%;
}

.page-settings-panel :deep(.pd-select),
.page-settings-panel :deep(.pd-input-number),
.page-settings-panel :deep(.pd-input) {
  border-radius: var(--pd-radius-control);
  background: var(--pd-surface-bg);
}

@media (max-width: 480px) {
  .page-settings-panel__header,
  .page-settings-panel__summary {
    grid-template-columns: 1fr;
  }

  .page-settings-panel__header {
    flex-direction: column;
  }

  .page-settings-panel__summary,
  .page-settings-panel__preset-grid,
  .page-settings-panel__grid-2,
  .page-settings-panel__margin-grid {
    grid-template-columns: 1fr;
  }

  .page-settings-panel__line-row {
    grid-template-columns: auto 1fr;
  }

  .page-settings-panel__line-row :deep(.pd-input-number) {
    grid-column: 2;
  }
}
</style>
