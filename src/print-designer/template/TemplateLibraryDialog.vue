<template>
  <el-dialog :model-value="visible" title="Open template" width="min(560px, 92vw)" @update:model-value="emit('update:visible', $event)">
    <div class="template-library">
      <div class="template-library__actions">
        <el-button type="danger" plain :disabled="loading || !templates.length" @click="confirmClear">Clear local library</el-button>
        <el-button :loading="loading" @click="emit('refresh')">Refresh</el-button>
      </div>
      <p v-if="!loading && !templates.length" class="template-library__empty">No saved templates yet.</p>
      <article v-for="template in templates" :key="template.id" class="template-library__item">
        <button type="button" class="template-library__open" @click="emit('select', template.id)">
          <strong>{{ template.name }}</strong><small>{{ template.updatedAt ? new Date(template.updatedAt).toLocaleString() : template.id }}</small>
        </button>
        <el-button text type="danger" class="template-library__delete" @click="confirmRemove(template)">Delete</el-button>
      </article>
    </div>
  </el-dialog>
</template>

<script setup>
import { ElMessageBox } from "element-plus";

defineProps({ visible: { type: Boolean, default: false }, templates: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } });
const emit = defineEmits(["update:visible", "refresh", "select", "remove", "clear"]);

async function confirmRemove(template) {
  try {
    await ElMessageBox.confirm(`Delete “${template.name}” from this browser? This cannot be undone.`, "Delete saved template", { type: "warning" });
  } catch {
    return;
  }
  emit("remove", template.id);
}

async function confirmClear() {
  try {
    await ElMessageBox.confirm("Remove every saved template from this browser? This cannot be undone.", "Clear local template library", { type: "warning" });
  } catch {
    return;
  }
  emit("clear");
}
</script>

<style scoped>
.template-library { display: flex; min-height: 180px; flex-direction: column; gap: 8px; }.template-library__actions { display: flex; justify-content: flex-end; gap: 8px; }.template-library__empty { margin: auto; color: #64748b; font-size: 13px; }.template-library__item { display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; padding: 5px 8px 5px 12px; }.template-library__item:hover { border-color: #2563eb; background: #eff6ff; }.template-library__open { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 4px; border: 0; background: transparent; padding: 7px 0; text-align: left; cursor: pointer; }.template-library__item small { color: #64748b; }.template-library__delete { flex: 0 0 auto; }
</style>
