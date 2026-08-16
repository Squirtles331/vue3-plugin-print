<template>
  <PdDialog
    class="create-table-dialog"
    :model-value="visible"
    :close-on-click-modal="false"
    width="384px"
    @update:model-value="onDialogVisibleChange"
  >
    <template #header>
      <div class="create-table-dialog__header">
        <strong>创建表格</strong>
      </div>
    </template>

    <div class="create-table-dialog__body">
      <div class="create-table-dialog__field">
        <span>表格类型</span>
        <PdRadioGroup v-model="mode" class="create-table-dialog__radio-group">
          <PdRadio :value="TABLE_INSERT_MODES.SAMPLE">使用带测试数据的表格</PdRadio>
          <PdRadio :value="TABLE_INSERT_MODES.CUSTOM">自定义表格</PdRadio>
        </PdRadioGroup>
      </div>

      <label class="create-table-dialog__field">
        <span>列数</span>
        <PdInputNumber v-model="columnCount" :min="1" :step="1" />
      </label>

      <label class="create-table-dialog__field">
        <span>行数</span>
        <PdInputNumber v-model="rowCount" :min="1" :step="1" />
      </label>
    </div>

    <template #footer>
      <div class="create-table-dialog__footer">
        <PdButton @click="emit('cancel')">取消</PdButton>
        <PdButton type="primary" @click="confirm">确认</PdButton>
      </div>
    </template>
  </PdDialog>
</template>

<script setup lang="ts">import { ref, watch } from "vue";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdDialog from "../../ui/primitives/PdDialog.vue";
import PdInputNumber from "../../ui/primitives/PdInputNumber.vue";
import PdRadio from "../../ui/primitives/PdRadio.vue";
import PdRadioGroup from "../../ui/primitives/PdRadioGroup.vue";
import { DEFAULT_TABLE_INSERT_COLUMN_COUNT, DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT, DEFAULT_TABLE_INSERT_MODE, DEFAULT_TABLE_INSERT_ROW_COUNT, TABLE_INSERT_MODES, } from "../../core/tableInsertBuilder.js";
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
}) as any;
const emit = defineEmits(["confirm", "cancel"]) as any;
const mode = ref(DEFAULT_TABLE_INSERT_MODE) as any;
const columnCount = ref(DEFAULT_TABLE_INSERT_COLUMN_COUNT) as any;
const rowCount = ref(DEFAULT_TABLE_INSERT_ROW_COUNT) as any;
function resetState(): any {
    mode.value = DEFAULT_TABLE_INSERT_MODE;
    columnCount.value = DEFAULT_TABLE_INSERT_COLUMN_COUNT;
    rowCount.value = DEFAULT_TABLE_INSERT_ROW_COUNT;
}
function defaultRowCountForMode(value: any): any {
    return value === TABLE_INSERT_MODES.CUSTOM ? DEFAULT_CUSTOM_TABLE_INSERT_ROW_COUNT : DEFAULT_TABLE_INSERT_ROW_COUNT;
}
function normalizeCount(value: any, fallback: any): any {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }
    return Math.max(1, Math.round(numeric));
}
function confirm(): any {
    const fallbackRowCount = defaultRowCountForMode(mode.value);
    emit("confirm", {
        mode: mode.value,
        columnCount: normalizeCount(columnCount.value, DEFAULT_TABLE_INSERT_COLUMN_COUNT),
        rowCount: normalizeCount(rowCount.value, fallbackRowCount),
    });
}
function onDialogVisibleChange(value: any): any {
    if (!value) {
        emit("cancel");
    }
}
watch((): any => props.visible, (visible: any): any => {
    if (visible) {
        resetState();
    }
});
watch(mode, (value: any): any => {
    rowCount.value = defaultRowCountForMode(value);
});
</script>

<style scoped lang="scss">
.create-table-dialog__header {
  display: flex;
  align-items: center;
  color: #111827;
  font-size: 18px;
}

.create-table-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.create-table-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #111827;
  font-size: 14px;
}

.create-table-dialog__radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.create-table-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.create-table-dialog :deep(.pd-input-number) {
  width: 100%;
}
</style>
