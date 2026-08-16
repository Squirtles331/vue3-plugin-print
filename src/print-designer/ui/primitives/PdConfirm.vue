<script setup lang="ts">
const props = defineProps({
  title: { type: String, default: '确认执行此操作？' },
  confirmButtonText: { type: String, default: '确认' },
  cancelButtonText: { type: String, default: '取消' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel'])
const open = shallowRef(false)
function confirm() {
  open.value = false
  emit('confirm')
}
function cancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <span class="pd-confirm">
    <span class="pd-confirm__reference" @click.stop="!disabled && (open = !open)">
      <slot name="reference" />
    </span>
    <span v-if="open && !disabled" class="pd-confirm__pop">
      <span class="pd-confirm__title">{{ title }}</span>
      <span class="pd-confirm__actions">
        <button type="button" class="pd-confirm__cancel" @click="cancel">{{ cancelButtonText }}</button>
        <button type="button" class="pd-confirm__confirm" @click="confirm">{{ confirmButtonText }}</button>
      </span>
    </span>
  </span>
</template>
