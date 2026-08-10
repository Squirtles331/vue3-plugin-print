<template>
  <div class="pages-panel">
    <div class="pages-panel__stack">
      <div v-if="!filteredPages.length" class="pages-panel__empty">
        没有匹配的页面
      </div>
      <button
        v-for="page in filteredPages"
        :key="page.id"
        class="pages-panel__card"
        :class="{ 'is-current': page.isCurrent }"
        type="button"
        :title="page.title"
      >
        <span class="pages-panel__title">{{ page.title }}</span>
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
</script>

<style scoped lang="scss">
.pages-panel {
  flex: 1;
  min-height: 0;
  padding: 18px;
  overflow: auto;
  background: #ffffff;
}

.pages-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pages-panel__empty {
  padding: 18px;
  border: 1px solid var(--pd-border);
  border-radius: var(--pd-radius-section);
  background: #f8fafc;
  color: var(--pd-muted);
  font-size: 12px;
  text-align: center;
}

.pages-panel__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.pages-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--pd-strong);
}

.pages-panel__meta {
  font-size: 12px;
  color: var(--pd-muted);
}
</style>
