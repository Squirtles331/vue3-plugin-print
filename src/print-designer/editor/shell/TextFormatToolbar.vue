<template>
  <section class="text-format-toolbar" :class="{ 'is-disabled': toolbarDisabled }">
    <div class="text-format-toolbar__group">
      <span class="text-format-toolbar__label">文字</span>
      <PdSelect
        class="text-format-toolbar__preset"
        size="small"
        :model-value="activePreset"
        placeholder="预设"
        :disabled="!presetEnabled"
        @change="applyPreset"
      >
        <PdOption
          v-for="option in TEXT_PRESET_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </PdSelect>
    </div>

    <div class="text-format-toolbar__divider"></div>

    <div class="text-format-toolbar__group">
      <PdSelect
        class="text-format-toolbar__font"
        size="small"
        :model-value="fontFamilyValue"
        :disabled="toolbarDisabled"
        @change="setStyleValue('fontFamily', $event)"
      >
        <PdOption
          v-for="option in FONT_FAMILY_OPTIONS"
          :key="option.value || '__default__'"
          :label="option.label"
          :value="option.value"
        />
      </PdSelect>

      <PdSelect
        class="text-format-toolbar__size"
        size="small"
        :model-value="fontSizeValue"
        :disabled="toolbarDisabled"
        @change="setStyleValue('fontSize', Number($event))"
      >
        <PdOption
          v-for="size in FONT_SIZE_OPTIONS"
          :key="size"
          :label="String(size)"
          :value="size"
        />
      </PdSelect>
    </div>

    <div class="text-format-toolbar__divider"></div>

    <div class="text-format-toolbar__group text-format-toolbar__group--icons">
      <PdButton
        native-type="button"
        class="text-format-toolbar__icon"
        :class="{ 'is-active': isBold }"
        :disabled="toolbarDisabled"
        @click="toggleFontWeight"
      >
        B
      </PdButton>
      <PdButton
        native-type="button"
        class="text-format-toolbar__icon text-format-toolbar__icon--italic"
        :class="{ 'is-active': isItalic }"
        :disabled="toolbarDisabled"
        @click="toggleFontStyle"
      >
        I
      </PdButton>
      <PdButton
        native-type="button"
        class="text-format-toolbar__icon text-format-toolbar__icon--underline"
        :class="{ 'is-active': isUnderline }"
        :disabled="toolbarDisabled"
        @click="toggleUnderline"
      >
        U
      </PdButton>
    </div>

    <div class="text-format-toolbar__divider"></div>

    <div class="text-format-toolbar__group">
      <input
        class="text-format-toolbar__color"
        type="color"
        :value="textColorValue"
        :disabled="toolbarDisabled"
        @input="setStyleValue('color', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="text-format-toolbar__divider"></div>

    <div class="text-format-toolbar__group text-format-toolbar__group--icons">
      <PdButton
        v-for="option in horizontalAlignButtons"
        :key="option.value"
        native-type="button"
        class="text-format-toolbar__icon"
        :class="{ 'is-active': textAlignValue === option.value }"
        :disabled="toolbarDisabled"
        @click="setStyleValue('textAlign', option.value)"
      >
        {{ option.label }}
      </PdButton>
    </div>

    <div class="text-format-toolbar__group text-format-toolbar__group--icons">
      <PdButton
        v-for="option in verticalAlignButtons"
        :key="option.value"
        native-type="button"
        class="text-format-toolbar__icon"
        :class="{ 'is-active': verticalAlignValue === option.value }"
        :disabled="toolbarDisabled"
        @click="setStyleValue('verticalAlign', option.value)"
      >
        {{ option.label }}
      </PdButton>
    </div>

    <div class="text-format-toolbar__divider"></div>

    <div class="text-format-toolbar__group">
      <PdSelect
        class="text-format-toolbar__line-height"
        size="small"
        :model-value="lineHeightValue"
        :disabled="toolbarDisabled"
        @change="setStyleValue('lineHeight', Number($event))"
      >
        <PdOption
          v-for="value in LINE_HEIGHT_OPTIONS"
          :key="value"
          :label="`行高 ${value}`"
          :value="value"
        />
      </PdSelect>
    </div>
  </section>
</template>

<script setup lang="ts">import { computed } from "vue";
import { storeToRefs } from "pinia";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdOption from "../../ui/primitives/PdOption.vue";
import PdSelect from "../../ui/primitives/PdSelect.vue";
import { FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS, LINE_HEIGHT_OPTIONS, TEXT_PRESET_OPTIONS, } from "../../core/textFormatting";
import { executeEditorCommand } from "../commands/executeCommand";
import { createApplyTextPresetCommand, createUpdateTextFormattingCommand } from "../commands/textCommands";
import { useEditorDocumentStore } from "../stores/documentStore";
import { useEditorHistoryStore } from "../stores/historyStore";
import { useEditorSelectionStore } from "../stores/selectionStore";
const TYPOGRAPHY_TYPES = new Set(["text", "pageNumber", "barcode", "table", "multiLabel"]) as any;
const documentStore = useEditorDocumentStore() as any;
const historyStore = useEditorHistoryStore() as any;
const selectionStore = useEditorSelectionStore() as any;
const { objectsById } = storeToRefs(documentStore) as any;
const { selectedIds, selectedCount } = storeToRefs(selectionStore) as any;
const selectedTypographyObject = computed((): any => {
    if (selectedCount.value !== 1) {
        return null;
    }
    const object = objectsById.value[selectedIds.value[0]];
    return TYPOGRAPHY_TYPES.has(object?.type) ? object : null;
}) as any;
const toolbarDisabled = computed((): any => !selectedTypographyObject.value) as any;
const presetEnabled = computed((): any => selectedTypographyObject.value?.type === "text") as any;
const activePreset = computed((): any => selectedTypographyObject.value?.props?.textPreset || "") as any;
const fontFamilyValue = computed((): any => selectedTypographyObject.value?.style?.fontFamily || "") as any;
const fontSizeValue = computed((): any => selectedTypographyObject.value?.style?.fontSize || 14) as any;
const textColorValue = computed((): any => selectedTypographyObject.value?.style?.color || "#000000") as any;
const textAlignValue = computed((): any => selectedTypographyObject.value?.style?.textAlign || "left") as any;
const verticalAlignValue = computed((): any => selectedTypographyObject.value?.style?.verticalAlign || "top") as any;
const lineHeightValue = computed((): any => selectedTypographyObject.value?.style?.lineHeight || 1.4) as any;
const isBold = computed((): any => selectedTypographyObject.value?.style?.fontWeight === "bold") as any;
const isItalic = computed((): any => selectedTypographyObject.value?.style?.fontStyle === "italic") as any;
const isUnderline = computed((): any => selectedTypographyObject.value?.style?.textDecoration === "underline") as any;
const horizontalAlignButtons = [
    { label: "左", value: "left" },
    { label: "中", value: "center" },
    { label: "右", value: "right" },
] as any;
const verticalAlignButtons = [
    { label: "上", value: "top" },
    { label: "中", value: "middle" },
    { label: "下", value: "bottom" },
] as any;
function runTextCommand(command: any): any {
    if (!command) {
        return;
    }
    executeEditorCommand(historyStore, command);
}
function applyPreset(preset: any): any {
    if (!presetEnabled.value || !preset) {
        return;
    }
    runTextCommand(createApplyTextPresetCommand(documentStore, selectedTypographyObject.value.id, preset));
}
function setStyleValue(key: any, value: any): any {
    if (!selectedTypographyObject.value) {
        return;
    }
    runTextCommand(createUpdateTextFormattingCommand(documentStore, selectedTypographyObject.value.id, {
        [key]: value,
    }));
}
function toggleFontWeight(): any {
    setStyleValue("fontWeight", isBold.value ? "normal" : "bold");
}
function toggleFontStyle(): any {
    setStyleValue("fontStyle", isItalic.value ? "normal" : "italic");
}
function toggleUnderline(): any {
    setStyleValue("textDecoration", isUnderline.value ? "none" : "underline");
}
</script>

<style scoped lang="scss">
.text-format-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 42px;
  padding: 5px 12px;
  border-top: 1px solid #edf1f5;
  background: #f8fafc;
}

.text-format-toolbar.is-disabled {
  opacity: 0.72;
}

.text-format-toolbar__group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.text-format-toolbar__group--icons {
  gap: 4px;
}

.text-format-toolbar__label {
  color: #6b7789;
  font-size: 11px;
  font-weight: 700;
}

.text-format-toolbar__preset,
.text-format-toolbar__font,
.text-format-toolbar__size,
.text-format-toolbar__line-height {
  min-width: 0;
}

.text-format-toolbar__preset {
  width: 120px;
}

.text-format-toolbar__font {
  width: 140px;
}

.text-format-toolbar__size,
.text-format-toolbar__line-height {
  width: 84px;
}

.text-format-toolbar__divider {
  width: 1px;
  align-self: center;
  height: 24px;
  background: #e1e7ef;
}

.text-format-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  min-height: 27px;
  padding: 0;
  border: 1px solid #d9e1ea;
  border-radius: 3px;
  background: #ffffff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
}

.text-format-toolbar__icon:hover:not(:disabled),
.text-format-toolbar__icon.is-active {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.text-format-toolbar__icon:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.text-format-toolbar__icon--italic {
  font-style: italic;
}

.text-format-toolbar__icon--underline {
  text-decoration: underline;
}

.text-format-toolbar__color {
  width: 30px;
  height: 27px;
  padding: 0;
  border: 1px solid #d9e1ea;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}

.text-format-toolbar__color:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.text-format-toolbar :deep(.pd-select) {
  width: 100%;
}

@media (max-width: 1280px) {
  .text-format-toolbar {
    flex-wrap: wrap;
  }
}
</style>
