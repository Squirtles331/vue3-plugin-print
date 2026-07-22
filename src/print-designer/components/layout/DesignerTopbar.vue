<template>
  <header class="designer-topbar">
    <div class="designer-topbar__brand">
      <div class="designer-topbar__brand-mark">PD</div>
      <div class="designer-topbar__brand-copy">
        <div class="designer-topbar__app">打印设计器</div>
        <div class="designer-topbar__doc">
          <span class="designer-topbar__title">{{ templateName }}</span>
          <span class="designer-topbar__status">{{ saveStatus }}</span>
        </div>
      </div>
    </div>

    <div class="designer-topbar__toolbar">
      <section class="designer-topbar__group">
        <span class="designer-topbar__label">文件</span>
        <button class="designer-topbar__tool" type="button" @click="$emit('new-template')">
          <el-icon><DocumentAdd /></el-icon>
          <span>新建</span>
        </button>
        <button class="designer-topbar__tool" type="button" @click="$emit('open-template')">
          <el-icon><FolderOpened /></el-icon>
          <span>打开</span>
        </button>
      </section>

      <section class="designer-topbar__group">
        <span class="designer-topbar__label">编辑</span>
        <button class="designer-topbar__tool" type="button" :disabled="!canUndo" @click="$emit('undo')">
          <el-icon><RefreshLeft /></el-icon>
          <span>撤销</span>
        </button>
        <button class="designer-topbar__tool" type="button" :disabled="!canRedo" @click="$emit('redo')">
          <el-icon><RefreshRight /></el-icon>
          <span>重做</span>
        </button>
      </section>

      <section class="designer-topbar__group">
        <span class="designer-topbar__label">视图</span>
        <button class="designer-topbar__tool designer-topbar__tool--icon" type="button" @click="$emit('zoom-out')">
          <el-icon><ZoomOut /></el-icon>
        </button>
        <button class="designer-topbar__tool designer-topbar__tool--value" type="button" @click="$emit('zoom-reset')">
          {{ zoomLabel }}
        </button>
        <button class="designer-topbar__tool designer-topbar__tool--icon" type="button" @click="$emit('zoom-in')">
          <el-icon><ZoomIn /></el-icon>
        </button>
      </section>
    </div>

    <div class="designer-topbar__toolbar designer-topbar__toolbar--right">
      <section class="designer-topbar__group">
        <span class="designer-topbar__pill">A4</span>
        <span class="designer-topbar__pill">{{ zoomLabel }}</span>
      </section>

      <section class="designer-topbar__group">
        <button class="designer-topbar__tool" type="button" @click="$emit('preview')">
          <el-icon><View /></el-icon>
          <span>预览</span>
        </button>
        <button class="designer-topbar__tool" type="button" @click="$emit('print')">
          <el-icon><Printer /></el-icon>
          <span>打印</span>
        </button>
        <button class="designer-topbar__tool" type="button" @click="$emit('export', 'pdf')">
          <el-icon><Download /></el-icon>
          <span>导出</span>
        </button>
        <button class="designer-topbar__tool designer-topbar__tool--primary" type="button" @click="$emit('save-template')">
          <el-icon><Check /></el-icon>
          <span>保存</span>
        </button>
      </section>
    </div>
  </header>
</template>

<script setup>
import {
  Check,
  DocumentAdd,
  Download,
  FolderOpened,
  Printer,
  RefreshLeft,
  RefreshRight,
  View,
  ZoomIn,
  ZoomOut,
} from "@element-plus/icons-vue";

defineProps({
  templateName: {
    type: String,
    default: "默认模板",
  },
  saveStatus: {
    type: String,
    default: "已保存",
  },
  zoomLabel: {
    type: String,
    default: "100%",
  },
  canUndo: {
    type: Boolean,
    default: false,
  },
  canRedo: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "new-template",
  "open-template",
  "save-template",
  "undo",
  "redo",
  "zoom-in",
  "zoom-out",
  "zoom-reset",
  "preview",
  "print",
  "export",
]);
</script>

<style scoped lang="scss">
.designer-topbar {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 52px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--pd-border);
  background:
    linear-gradient(180deg, rgba(26, 35, 48, 0.98), rgba(23, 31, 43, 0.98)),
    var(--pd-panel);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.designer-topbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.designer-topbar__brand-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f7fbff, #dbe8ff);
  color: #1d2838;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.designer-topbar__brand-copy {
  min-width: 0;
}

.designer-topbar__app {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(199, 212, 233, 0.74);
}

.designer-topbar__doc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.designer-topbar__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.designer-topbar__status {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(78, 172, 118, 0.14);
  color: #8fe1ad;
  font-size: 11px;
  font-weight: 700;
}

.designer-topbar__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.designer-topbar__toolbar--right {
  margin-left: auto;
}

.designer-topbar__group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-right: 10px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.designer-topbar__toolbar .designer-topbar__group:last-child {
  padding-right: 0;
  border-right: 0;
}

.designer-topbar__label {
  margin-right: 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(182, 197, 220, 0.62);
}

.designer-topbar__pill {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--pd-strong);
  font-size: 11px;
  font-weight: 700;
}

.designer-topbar__tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--pd-strong);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.designer-topbar__tool:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.designer-topbar__tool:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.designer-topbar__tool--icon {
  width: 32px;
  padding: 0;
  justify-content: center;
}

.designer-topbar__tool--value {
  min-width: 70px;
  justify-content: center;
}

.designer-topbar__tool--primary {
  background: linear-gradient(180deg, #4f8cff, #3777ef);
  border-color: rgba(115, 165, 255, 0.48);
  color: #ffffff;
}

@media (max-width: 1440px) {
  .designer-topbar {
    flex-wrap: wrap;
  }

  .designer-topbar__toolbar--right {
    margin-left: 0;
  }
}
</style>
