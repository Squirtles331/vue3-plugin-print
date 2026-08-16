<script setup lang="ts">
import PdIcon from '../../ui/primitives/PdIcon.vue'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="sidebar-tabs">
    <button
      v-for="item in tabs"
      :key="item.key"
      class="sidebar-tabs__item"
      :class="{ 'is-active': item.key === modelValue }"
      type="button"
      @click="$emit('update:modelValue', item.key)"
    >
      <span class="sidebar-tabs__icon">
        <PdIcon><component :is="item.icon" /></PdIcon>
      </span>
      <span class="sidebar-tabs__label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 60px;
  padding: 16px 10px;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.98));
}

.sidebar-tabs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 6px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: rgba(226, 232, 240, 0.74);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.sidebar-tabs__item:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.sidebar-tabs__item.is-active {
  color: #f8fafc;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.24), rgba(37, 99, 235, 0.18));
  box-shadow: inset 0 0 0 1px rgba(148, 197, 255, 0.28);
}

.sidebar-tabs__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 16px;
}

.sidebar-tabs__label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.1;
}
</style>
