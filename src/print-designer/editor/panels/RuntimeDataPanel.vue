<template>
  <section class="runtime-data-panel">
    <header class="runtime-data-panel__header">
      <div>
        <p>测试数据</p>
        <strong>数据、字段与绑定</strong>
      </div>
      <span>{{ variables.length }} 字段</span>
    </header>

    <p class="runtime-data-panel__hint">输入 JSON 后，字段可直接绑定到当前选中的元素。测试数据不会写入模板。</p>
    <PdInput
      v-model="text"
      type="textarea"
      :rows="12"
      spellcheck="false"
      aria-label="测试数据 JSON"
      @blur="formatData"
    />
    <p v-if="parseError" class="runtime-data-panel__error">{{ parseError }}</p>

    <div class="runtime-data-panel__actions">
      <PdButton size="small" native-type="button" :disabled="Boolean(parseError)" @click="formatData">格式化</PdButton>
      <PdButton size="small" native-type="button" @click="resetData">清空</PdButton>
    </div>

    <div class="runtime-data-panel__fields">
      <div class="runtime-data-panel__fields-head">
        <strong>可绑定字段</strong>
        <span>{{ selectedHint }}</span>
      </div>
      <DataPanel variant="embedded" :variables="bindingFields" :search-query="searchQuery" @select="emit('bind', $event)" />
    </div>
  </section>
</template>

<script setup lang="ts">import { computed, ref, watch } from "vue";
import DataPanel from "../../components/sidebar/DataPanel.vue";
import { describeRuntimeBindingPaths } from "../../runtime/bindingPaths.js";
import PdButton from "../../ui/primitives/PdButton.vue";
import PdInput from "../../ui/primitives/PdInput.vue";
const props = defineProps({
    runtimeData: { type: Object, default: (): any => ({}) },
    variables: { type: Array as any, default: (): any => [] },
    selectedCount: { type: Number, default: 0 },
    searchQuery: { type: String, default: "" },
}) as any;
const emit = defineEmits(["update:runtime-data", "bind"]) as any;
const text = ref("{}") as any;
function normalized(value: any): any {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function parse(value: any = text.value): any {
    try {
        const parsed = JSON.parse(value || "{}");
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? { value: parsed, error: "" }
            : { value: null, error: "测试数据必须是 JSON 对象。" };
    }
    catch {
        return { value: null, error: "JSON 格式不正确；修复后会自动更新预览。" };
    }
}
const parseError = computed((): any => parse().error) as any;
const selectedHint = computed((): any => props.selectedCount === 1 ? "点击字段即可绑定" : props.selectedCount ? "请只选择一个元素" : "先选择元素") as any;
const bindingFields = computed((): any => describeRuntimeBindingPaths(normalized(props.runtimeData))) as any;
watch((): any => props.runtimeData, (value: any): any => {
    const parsed = parse();
    const next = normalized(value);
    if (!parsed.value || JSON.stringify(parsed.value) !== JSON.stringify(next)) {
        text.value = JSON.stringify(next, null, 2);
    }
}, { immediate: true, deep: true });
watch(text, (): any => {
    const result = parse();
    if (result.value) {
        emit("update:runtime-data", result.value);
    }
});
function formatData(): any {
    const result = parse();
    if (!result.value) {
        return;
    }
    text.value = JSON.stringify(result.value, null, 2);
}
function resetData(): any {
    text.value = "{}";
}
</script>

<style scoped lang="scss">
.runtime-data-panel { display: flex; flex: 1; min-height: 0; flex-direction: column; gap: 10px; padding: 12px; overflow: auto; }
.runtime-data-panel__header, .runtime-data-panel__actions, .runtime-data-panel__fields-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.runtime-data-panel__header p { margin: 0 0 2px; color: var(--pd-muted); font-size: 11px; }
.runtime-data-panel__header strong, .runtime-data-panel__fields-head strong { color: var(--pd-strong); font-size: 13px; }
.runtime-data-panel__header span, .runtime-data-panel__fields-head span { color: var(--pd-muted); font-size: 11px; }
.runtime-data-panel__hint { margin: 0; color: var(--pd-muted); font-size: 12px; line-height: 1.45; }
.runtime-data-panel__error { margin: -3px 0 0; color: #b91c1c; font-size: 12px; line-height: 1.4; }
.runtime-data-panel__actions { justify-content: flex-end; }
.runtime-data-panel__fields { display: flex; min-height: 0; flex: 1; flex-direction: column; gap: 8px; padding-top: 4px; }
</style>
