<template>
  <el-dialog
    class="create-table-dialog"
    :model-value="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="384px"
    top="12vh"
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
        <el-radio-group v-model="mode" class="create-table-dialog__radio-group">
          <el-radio :value="TABLE_INSERT_MODES.SAMPLE">使用带测试数据的表格</el-radio>
          <el-radio :value="TABLE_INSERT_MODES.CUSTOM">自定义表格</el-radio>
        </el-radio-group>
      </div>

      <label class="create-table-dialog__field">
        <span>列数</span>
        <el-input-number v-model="columnCount" :min="1" :step="1" controls-position="right" />
      </label>

      <label class="create-table-dialog__field">
        <span>行数</span>
        <el-input-number v-model="rowCount" :min="1" :step="1" controls-position="right" />
      </label>
    </div>

    <template #footer>
      <div class="create-table-dialog__footer">
        <el-button @click="emit('cancel')">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  DEFAULT_TABLE_INSERT_COLUMN_COUNT,
  DEFAULT_TABLE_INSERT_MODE,
  DEFAULT_TABLE_INSERT_ROW_COUNT,
  TABLE_INSERT_MODES,
} from "../../core/tableInsertBuilder.js";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const mode = ref(DEFAULT_TABLE_INSERT_MODE);
const columnCount = ref(DEFAULT_TABLE_INSERT_COLUMN_COUNT);
const rowCount = ref(DEFAULT_TABLE_INSERT_ROW_COUNT);

function resetState() {
  mode.value = DEFAULT_TABLE_INSERT_MODE;
  columnCount.value = DEFAULT_TABLE_INSERT_COLUMN_COUNT;
  rowCount.value = DEFAULT_TABLE_INSERT_ROW_COUNT;
}

function normalizeCount(value, fallback) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(1, Math.round(numeric));
}

function confirm() {
  emit("confirm", {
    mode: mode.value,
    columnCount: normalizeCount(columnCount.value, DEFAULT_TABLE_INSERT_COLUMN_COUNT),
    rowCount: normalizeCount(rowCount.value, DEFAULT_TABLE_INSERT_ROW_COUNT),
  });
}

function onDialogVisibleChange(value) {
  if (!value) {
    emit("cancel");
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetState();
    }
  }
);
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

:deep(.create-table-dialog .el-dialog) {
  border-radius: 12px;
}

:deep(.create-table-dialog .el-dialog__body) {
  padding-top: 8px;
}

:deep(.create-table-dialog .el-input-number) {
  width: 100%;
}

:deep(.create-table-dialog .el-input-number),
:deep(.create-table-dialog .el-input__wrapper) {
  width: 100%;
}
</style>
