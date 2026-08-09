<template>
  <el-dialog :model-value="visible" title="Open template" width="min(560px, 92vw)" @update:model-value="emit('update:visible', $event)">
    <div class="template-library">
      <div class="template-library__actions"><el-button :loading="loading" @click="emit('refresh')">Refresh</el-button></div>
      <p v-if="!loading && !templates.length" class="template-library__empty">No saved templates yet.</p>
      <button v-for="template in templates" :key="template.id" type="button" class="template-library__item" @click="emit('select', template.id)">
        <strong>{{ template.name }}</strong><small>{{ template.updatedAt ? new Date(template.updatedAt).toLocaleString() : template.id }}</small>
      </button>
    </div>
  </el-dialog>
</template>

<script setup>
defineProps({ visible: { type: Boolean, default: false }, templates: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } });
const emit = defineEmits(['update:visible', 'refresh', 'select']);
</script>

<style scoped>
.template-library { display: flex; min-height: 180px; flex-direction: column; gap: 8px; }.template-library__actions { display: flex; justify-content: flex-end; }.template-library__empty { margin: auto; color: #64748b; font-size: 13px; }.template-library__item { display: flex; flex-direction: column; gap: 4px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; padding: 12px; text-align: left; cursor: pointer; }.template-library__item:hover { border-color: #2563eb; background: #eff6ff; }.template-library__item small { color: #64748b; }
</style>
