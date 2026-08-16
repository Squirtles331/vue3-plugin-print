<script setup lang="ts">
import PdButton from '../ui/primitives/PdButton.vue'
import PdDialog from '../ui/primitives/PdDialog.vue'

defineProps({ visible: { type: Boolean, default: false }, presets: { type: Array, default: () => [] } })
const emit = defineEmits(['update:visible', 'insert', 'rename', 'remove'])
const TYPE_LABELS = { text: '文本', image: '图片', table: '表格', barcode: '条码', qrcode: '二维码', pageNumber: '页码', line: '线条', rect: '矩形', circle: '圆形', multiLabel: '多标签' }
function typeLabel(type) { return TYPE_LABELS[type] || type }
</script>

<template>
  <PdDialog :model-value="visible" title="元素预设" width="min(620px, 92vw)" @update:model-value="emit('update:visible', $event)">
    <div class="preset-dialog">
      <p v-if="!presets.length" class="preset-dialog__empty">
        还没有元素预设。选中一个元素后，可在属性面板中保存为预设。
      </p>
      <article v-for="preset in presets" :key="preset.id" class="preset-dialog__item">
        <div><strong>{{ preset.name }}</strong><small>{{ typeLabel(preset.type) }}</small></div>
        <div class="preset-dialog__actions">
          <PdButton type="primary" size="small" @click="emit('insert', preset.id)">
            插入
          </PdButton>
          <PdButton size="small" @click="emit('rename', preset)">
            重命名
          </PdButton>
          <PdButton type="danger" plain size="small" @click="emit('remove', preset)">
            删除
          </PdButton>
        </div>
      </article>
    </div>
  </PdDialog>
</template>

<style scoped>
.preset-dialog { display: flex; min-height: 180px; flex-direction: column; gap: 8px; }.preset-dialog__empty { margin: auto; color: #64748b; font-size: 13px; }.preset-dialog__item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; }.preset-dialog__item div:first-child { display: flex; min-width: 0; flex-direction: column; gap: 4px; }.preset-dialog__item small { color: #64748b; }.preset-dialog__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
</style>
