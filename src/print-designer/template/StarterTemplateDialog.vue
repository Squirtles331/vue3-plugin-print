<template>
  <el-dialog :model-value="visible" title="选择起始模板" width="min(920px, 94vw)" @update:model-value="emit('update:visible', $event)">
    <div class="starter-dialog">
      <aside class="starter-dialog__filters" aria-label="模板分类">
        <button type="button" :class="{ 'is-active': !selectedCategory }" @click="selectedCategory = ''">
          <span>全部模板</span>
          <small>{{ templates.length }}</small>
        </button>
        <button v-for="category in categories" :key="category.id" type="button" :class="{ 'is-active': selectedCategory === category.id }" @click="selectedCategory = category.id">
          <span>{{ category.label }}</span>
          <small>{{ category.count }}</small>
        </button>
      </aside>
      <section class="starter-dialog__content">
        <div class="starter-dialog__toolbar">
          <el-input
            v-model="searchQuery"
            size="small"
            clearable
            :prefix-icon="Search"
            placeholder="搜索起始模板"
          />
          <span>{{ filteredTemplates.length }} 个可用模板</span>
        </div>
        <div class="starter-dialog__grid">
          <p v-if="!filteredTemplates.length" class="starter-dialog__empty">没有匹配的起始模板。</p>
          <button v-for="template in filteredTemplates" :key="template.id" type="button" class="starter-card" :class="{ 'is-active': selectedId === template.id }" @click="selectedId = template.id">
            <span class="starter-card__thumbnail" aria-hidden="true">
              <i v-for="(block, index) in template.thumbnail.blocks" :key="index" :class="`is-${block.tone || 'soft'}`" :style="blockStyle(block)"></i>
            </span>
            <strong>{{ template.name }}</strong>
            <small>{{ template.categoryLabel }}</small>
          </button>
        </div>
        <div v-if="selectedTemplate" class="starter-dialog__preview">
          <div><strong>{{ selectedTemplate.name }}</strong><span>{{ selectedTemplate.categoryLabel }}</span></div>
          <p>{{ selectedTemplate.description }}</p>
          <el-button type="primary" @click="emit('create', selectedTemplate.id)">使用此模板</el-button>
        </div>
      </section>
    </div>
  </el-dialog>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";
import { computed, shallowRef, ref, watch } from "vue";

const props = defineProps({ visible: { type: Boolean, default: false }, templates: { type: Array, default: () => [] } });
const emit = defineEmits(["update:visible", "create"]);
const selectedCategory = ref("");
const selectedId = ref("");
const searchQuery = shallowRef("");
const categories = computed(() => {
  const categoryMap = new Map();
  props.templates.forEach((template) => {
    const current = categoryMap.get(template.category) || { id: template.category, label: template.categoryLabel, count: 0 };
    categoryMap.set(template.category, { ...current, count: current.count + 1 });
  });
  return [...categoryMap.values()];
});
const filteredTemplates = computed(() => {
  const query = String(searchQuery.value || "").trim().toLowerCase();

  return props.templates.filter((template) => {
    const matchesCategory = !selectedCategory.value || template.category === selectedCategory.value;
    const haystack = `${template.name || ""} ${template.categoryLabel || ""} ${template.description || ""}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
});
const selectedTemplate = computed(() => filteredTemplates.value.find((template) => template.id === selectedId.value) || filteredTemplates.value[0] || null);

watch(filteredTemplates, (templates) => {
  if (!templates.some((template) => template.id === selectedId.value)) {
    selectedId.value = templates[0]?.id || "";
  }
}, { immediate: true });

function blockStyle(block) {
  return { left: `${block.x}%`, top: `${block.y}%`, width: `${block.w}%`, height: `${block.h}%` };
}
</script>

<style scoped>
.starter-dialog { display: grid; min-height: 440px; grid-template-columns: 164px minmax(0, 1fr); border: 1px solid #e2e8f0; }.starter-dialog__filters { display: flex; flex-direction: column; gap: 6px; padding: 14px; border-right: 1px solid #e2e8f0; background: #f8fafc; }.starter-dialog__filters button { display: flex; min-height: 34px; align-items: center; justify-content: space-between; gap: 8px; border: 0; border-radius: 6px; background: transparent; color: #475569; text-align: left; cursor: pointer; }.starter-dialog__filters small { color: #94a3b8; font-weight: 700; }.starter-dialog__filters button:hover, .starter-dialog__filters button.is-active { background: #dbeafe; color: #1d4ed8; }.starter-dialog__content { display: flex; min-width: 0; flex-direction: column; }.starter-dialog__toolbar { display: flex; align-items: center; gap: 12px; padding: 14px 18px 0; }.starter-dialog__toolbar span { flex: 0 0 auto; color: #64748b; font-size: 12px; font-weight: 700; }.starter-dialog__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(172px, 1fr)); gap: 14px; padding: 18px; }.starter-dialog__empty { grid-column: 1 / -1; margin: 0; padding: 24px; color: #64748b; font-size: 13px; text-align: center; }.starter-card { display: flex; flex-direction: column; gap: 5px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; padding: 10px; color: #1e293b; text-align: left; cursor: pointer; }.starter-card:hover, .starter-card.is-active { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }.starter-card small { color: #64748b; }.starter-card__thumbnail { position: relative; display: block; aspect-ratio: 1 / 1.1; overflow: hidden; border: 1px solid #cbd5e1; background: #fff; }.starter-card__thumbnail i { position: absolute; display: block; border-radius: 2px; background: #e2e8f0; }.starter-card__thumbnail .is-strong { background: #172554; }.starter-card__thumbnail .is-accent { background: #2563eb; }.starter-card__thumbnail .is-soft { background: #dbeafe; }.starter-card__thumbnail .is-outline { border: 1px solid #94a3b8; background: transparent; }.starter-dialog__preview { display: flex; align-items: center; gap: 14px; margin-top: auto; padding: 16px 18px; border-top: 1px solid #e2e8f0; background: #f8fafc; }.starter-dialog__preview div { display: flex; flex-direction: column; gap: 4px; }.starter-dialog__preview span, .starter-dialog__preview p { color: #64748b; font-size: 12px; }.starter-dialog__preview p { flex: 1; margin: 0; line-height: 1.5; } @media (max-width: 640px) { .starter-dialog { grid-template-columns: 1fr; }.starter-dialog__filters { flex-direction: row; overflow: auto; border-right: 0; border-bottom: 1px solid #e2e8f0; }.starter-dialog__filters button { flex: 0 0 auto; padding: 0 10px; }.starter-dialog__preview { align-items: flex-start; flex-direction: column; } }
</style>
