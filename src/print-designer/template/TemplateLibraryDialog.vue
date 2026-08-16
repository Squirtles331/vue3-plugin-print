<template>
  <PdDialog :model-value="visible" title="模板库" width="min(720px, 92vw)" @update:model-value="emit('update:visible', $event)">
    <div class="template-library">
      <div class="template-library__toolbar">
        <PdInput
          v-model="searchQuery"
          clearable
          :prefix-icon="Search"
          placeholder="搜索模板名称"
        />
        <div class="template-library__actions">
          <PdButton type="danger" plain :disabled="loading || !templates.length" @click="confirmClear">清空本地库</PdButton>
          <PdButton :loading="loading" @click="emit('refresh')">刷新</PdButton>
        </div>
      </div>
      <p class="template-library__summary">{{ summaryText }}</p>
      <p v-if="!loading && !filteredTemplates.length" class="template-library__empty">{{ emptyText }}</p>
      <article v-for="template in filteredTemplates" :key="template.id" class="template-library__item">
        <button type="button" class="template-library__open" @click="emit('select', template.id)">
          <strong>{{ template.name }}</strong>
          <small>{{ formatUpdatedAt(template.updatedAt) }}</small>
        </button>
        <PdButton text type="danger" class="template-library__delete" @click="confirmRemove(template)">删除</PdButton>
      </article>
    </div>
  </PdDialog>
</template>

<script setup lang="ts">import { computed, shallowRef } from "vue";
import { PdMessageBox } from "../ui/feedback.js";
import { Search } from "../ui/icons.js";
import PdButton from "../ui/primitives/PdButton.vue";
import PdDialog from "../ui/primitives/PdDialog.vue";
import PdInput from "../ui/primitives/PdInput.vue";
const props = defineProps({ visible: { type: Boolean, default: false }, templates: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } });
const emit = defineEmits(["update:visible", "refresh", "select", "remove", "clear"]);
const searchQuery = shallowRef("");
const filteredTemplates = computed(() => {
    const query = String(searchQuery.value || "").trim().toLowerCase();
    const list = [...props.templates].sort((left, right) => {
        const leftTime = new Date(left.updatedAt || 0).getTime();
        const rightTime = new Date(right.updatedAt || 0).getTime();
        return rightTime - leftTime;
    });
    if (!query) {
        return list;
    }
    return list.filter((template) => `${template.name || ""} ${template.id || ""}`.toLowerCase().includes(query));
});
const summaryText = computed(() => {
    if (props.loading) {
        return "正在加载模板库...";
    }
    return `共 ${props.templates.length} 个模板`;
});
const emptyText = computed(() => props.templates.length ? "没有匹配的模板，清空搜索后可查看全部。" : "本地模板库还是空的，先新建或导入一个模板。");
async function confirmRemove(template) {
    try {
        await PdMessageBox.confirm(`Delete “${template.name}” from this browser? This cannot be undone.`, "Delete saved template", { type: "warning" });
    }
    catch {
        return;
    }
    emit("remove", template.id);
}
async function confirmClear() {
    try {
        await PdMessageBox.confirm("Remove every saved template from this browser? This cannot be undone.", "Clear local template library", { type: "warning" });
    }
    catch {
        return;
    }
    emit("clear");
}
function formatUpdatedAt(value) {
    if (!value) {
        return "未保存到本地";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleString();
}
</script>

<style scoped>
.template-library { display: flex; min-height: 180px; flex-direction: column; gap: 10px; }.template-library__toolbar { display: flex; align-items: center; gap: 10px; }.template-library__actions { display: flex; flex: 0 0 auto; gap: 8px; }.template-library__summary { margin: 0; color: #64748b; font-size: 12px; }.template-library__empty { margin: auto; color: #64748b; font-size: 13px; text-align: center; }.template-library__item { display: flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; padding: 5px 8px 5px 12px; }.template-library__item:hover { border-color: #2563eb; background: #eff6ff; }.template-library__open { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 4px; border: 0; background: transparent; padding: 7px 0; text-align: left; cursor: pointer; }.template-library__item small { color: #64748b; }.template-library__delete { flex: 0 0 auto; }
</style>
