<template>
  <div class="pages-panel">
    <header class="pages-panel__header">
      <div>
        <p class="pages-panel__eyebrow">页面管理</p>
        <h3 class="pages-panel__title">页面列表</h3>
        <p class="pages-panel__description">
          在这里切换、重命名、复制和删除页面，当前页会同步到画布与右侧属性区。
        </p>
      </div>
      <div class="pages-panel__header-actions">
        <div class="pages-panel__badge">
          <strong>{{ filteredPages.length }}</strong>
          <span>{{ pages.length }} 页</span>
        </div>
        <PdButton v-if="showActions" class="pages-panel__create" type="primary" plain size="small" @click="emit('create')">
          <template #icon><PdIcon><Plus /></PdIcon></template>
          新建
        </PdButton>
      </div>
    </header>

    <div class="pages-panel__stack">
      <div v-if="!filteredPages.length" class="pages-panel__empty">
        <strong>{{ searchQuery ? "没有匹配的页面" : "当前没有页面" }}</strong>
        <span>{{ searchQuery ? "清空搜索后可以看到全部页面。" : "先新建一个页面，再开始编辑内容。" }}</span>
      </div>

      <article
        v-for="(page, index) in filteredPages"
        :key="page.id"
        class="pages-panel__card"
        :class="{ 'is-current': page.isCurrent }"
        :title="page.title"
        role="button"
        tabindex="0"
        :aria-pressed="page.isCurrent"
        @click="emit('select', page)"
        @keydown.enter.prevent="emit('select', page)"
        @keydown.space.prevent="emit('select', page)"
      >
        <div class="pages-panel__card-head">
          <span class="pages-panel__page-index">#{{ pageIndex(page.id) }}</span>
          <span class="pages-panel__head-meta">
            <span v-if="page.isCurrent" class="pages-panel__current-tag">当前页</span>
            <span v-if="showActions" class="pages-panel__order-hint">{{ index === 0 ? "首位" : index === filteredPages.length - 1 ? "末位" : "可排序" }}</span>
          </span>
        </div>

        <PdInput
          v-if="showActions"
          class="pages-panel__title-input"
          :model-value="page.title"
          size="small"
          @click.stop
          @change="onRename(page, $event)"
        />
        <span v-else class="pages-panel__card-title">{{ page.title }}</span>

        <span class="pages-panel__meta">{{ page.size }} / {{ page.orientation }}</span>

        <div v-if="showActions" class="pages-panel__actions" @click.stop>
          <PdButton :disabled="pageIndex(page.id) <= 1" size="small" text title="上移页面" @click="onMove(page, 'up')">
            <PdIcon><Top /></PdIcon>
          </PdButton>
          <PdButton :disabled="pageIndex(page.id) >= pages.length" size="small" text title="下移页面" @click="onMove(page, 'down')">
            <PdIcon><Bottom /></PdIcon>
          </PdButton>
          <PdButton size="small" text title="复制页面" @click="emit('duplicate', page)">
            <PdIcon><CopyDocument /></PdIcon>
          </PdButton>
          <PdConfirm
            title="删除此页面后无法恢复，继续吗？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            :disabled="pages.length <= 1"
            @confirm="emit('remove', page)"
          >
            <template #reference>
              <PdButton :disabled="pages.length <= 1" size="small" text class="pages-panel__danger" title="删除页面">
                <PdIcon><Delete /></PdIcon>
              </PdButton>
            </template>
          </PdConfirm>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bottom, CopyDocument, Delete, Plus, Top } from "../../ui/icons.js";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdConfirm from "../../ui/primitives/PdConfirm.vue";
import PdIcon from "../../ui/primitives/PdIcon.vue";
import PdInput from "../../ui/primitives/PdInput.vue";

const props = defineProps({
  pages: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: "",
  },
  showActions: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select", "create", "duplicate", "remove", "rename", "move"]);

const filteredPages = computed(() => {
  const query = String(props.searchQuery || "").trim().toLowerCase();

  if (!query) {
    return props.pages;
  }

  return props.pages.filter((page) => {
    const haystack = `${page.title || ""} ${page.size || ""} ${page.orientation || ""}`.toLowerCase();
    return haystack.includes(query);
  });
});

function pageIndex(pageId) {
  const index = props.pages.findIndex((page) => page.id === pageId);
  return index >= 0 ? index + 1 : 0;
}

function onRename(page, value) {
  emit("rename", { page, title: value });
}

function onMove(page, direction) {
  emit("move", { page, direction });
}
</script>

<style scoped lang="scss">
.pages-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.pages-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.pages-panel__header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.pages-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pages-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.2;
}

.pages-panel__description {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.pages-panel__badge {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--pd-border);
  background: #f8fafc;
  text-align: center;
}

.pages-panel__badge strong {
  color: var(--pd-strong);
  font-size: 18px;
  line-height: 1;
}

.pages-panel__badge span {
  color: var(--pd-muted);
  font-size: 11px;
}

.pages-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pages-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px dashed var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  line-height: 1.5;
}

.pages-panel__empty strong {
  color: var(--pd-strong);
  font-size: 14px;
}

.pages-panel__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.pages-panel__card:hover,
.pages-panel__card:focus-visible {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.08) inset;
  outline: none;
}

.pages-panel__card.is-current {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
}

.pages-panel__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pages-panel__page-index {
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
}

.pages-panel__head-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pages-panel__current-tag,
.pages-panel__order-hint {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--pd-border);
  background: #ffffff;
  color: var(--pd-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pages-panel__current-tag {
  border-color: var(--pd-accent-border);
  background: #f5f9ff;
  color: var(--pd-accent-text);
}

.pages-panel__title-input {
  width: 100%;
}

.pages-panel__title-input {
  background: rgba(255, 255, 255, 0.7);
}

.pages-panel__card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.pages-panel__meta {
  color: var(--pd-muted);
  font-size: 12px;
}

.pages-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.pages-panel__actions :deep(.pd-button) {
  height: 28px;
  width: 28px;
  padding: 0;
  border-color: var(--pd-border);
  color: #475569;
}

.pages-panel__actions :deep(.pd-button:hover:not(:disabled)) {
  border-color: var(--pd-accent-border);
  background: var(--pd-accent-bg);
  color: var(--pd-accent-text);
}

.pages-panel__danger {
  color: #b91c1c;
}

.pages-panel__create {
  width: fit-content;
}

@media (max-width: 1100px) {
  .pages-panel__header {
    flex-direction: column;
  }

  .pages-panel__header-actions {
    width: 100%;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
