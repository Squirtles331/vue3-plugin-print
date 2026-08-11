<template>
  <div class="pages-panel">
    <header class="pages-panel__header">
      <div>
        <p class="pages-panel__eyebrow">页面切换</p>
        <h3 class="pages-panel__title">文档页</h3>
        <p class="pages-panel__description">
          点击任意页签可切换当前编辑页，选区会同步清空，避免跨页误操作。
        </p>
      </div>
      <div class="pages-panel__badge">
        <strong>{{ filteredPages.length }}</strong>
        <span>{{ pages.length }} 页</span>
      </div>
    </header>

    <div class="pages-panel__stack">
      <div v-if="!filteredPages.length" class="pages-panel__empty">
        <strong>{{ searchQuery ? "没有匹配的页面" : "当前没有页面" }}</strong>
        <span>{{ searchQuery ? "清空搜索后可以看到全部页面。" : "先创建一个页面，再开始布局。" }}</span>
      </div>

      <button
        v-for="page in filteredPages"
        :key="page.id"
        class="pages-panel__card"
        :class="{ 'is-current': page.isCurrent }"
        type="button"
        :title="page.title"
        :aria-pressed="page.isCurrent"
        @click="emit('select', page)"
      >
        <span class="pages-panel__card-head">
          <span class="pages-panel__page-index">#{{ pageIndex(page.id) }}</span>
          <span v-if="page.isCurrent" class="pages-panel__current-tag">当前页</span>
        </span>
        <span class="pages-panel__card-title">{{ page.title }}</span>
        <span class="pages-panel__meta">{{ page.size }} / {{ page.orientation }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  pages: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["select"]);

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
</script>

<style scoped lang="scss">
.pages-panel {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: #ffffff;
}

.pages-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
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
  gap: 12px;
}

.pages-panel__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px solid var(--pd-border);
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
  gap: 5px;
  padding: 10px 12px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: var(--pd-panel-bg);
  text-align: left;
  color: inherit;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.pages-panel__card:hover {
  border-color: var(--pd-accent-border);
  background: #f8fafc;
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

.pages-panel__current-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--pd-accent-border);
  background: #f5f9ff;
  color: var(--pd-accent-text);
  font-size: 11px;
  font-weight: 700;
}

.pages-panel__card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.pages-panel__meta {
  font-size: 12px;
  color: var(--pd-muted);
}
</style>
