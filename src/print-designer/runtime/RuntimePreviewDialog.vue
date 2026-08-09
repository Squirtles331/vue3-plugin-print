<template>
  <el-dialog :model-value="visible" title="运行时预览" width="min(1200px, 94vw)" top="4vh" @update:model-value="emit('update:visible', $event)">
    <div class="runtime-preview">
      <aside class="runtime-preview__controls">
        <h3>运行时 JSON</h3>
        <p>请输入一个 JSON 对象。变量和表格绑定会按点路径解析。</p>
        <el-input v-model="runtimeDataText" type="textarea" :rows="16" spellcheck="false" />
        <p v-if="parseError" class="runtime-preview__error">{{ parseError }}</p>
        <el-button type="primary" :disabled="!!parseError || !documentValid" @click="print">浏览器打印</el-button>
        <ul v-if="validationIssues.length" class="runtime-preview__error-list"><li v-for="issue in validationIssues" :key="`${issue.path}-${issue.message}`">{{ issue.message }}</li></ul>
      </aside>
      <div class="runtime-preview__canvas"><RuntimeDocument v-if="documentValid && !parseError" :document="document" :runtime-data="runtimeData" /></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { validateTemplateDocument } from "../template/templateDocument.js";
import { printRuntimeDocument } from "./print.js";
import RuntimeDocument from "./RuntimeDocument.vue";

const props = defineProps({ visible: { type: Boolean, default: false }, document: { type: Object, default: null }, initialData: { type: Object, default: () => ({}) } });
const emit = defineEmits(["update:visible", "update:runtimeData", "print-error"]);
const runtimeDataText = ref("{}");

watch(() => props.initialData, (value) => { runtimeDataText.value = JSON.stringify(value || {}, null, 2); }, { immediate: true, deep: true });
const parseResult = computed(() => { try { const value = JSON.parse(runtimeDataText.value || "{}"); return value && typeof value === "object" && !Array.isArray(value) ? { value, error: "" } : { value: {}, error: "Runtime data must be a JSON object." }; } catch { return { value: {}, error: "Runtime data is not valid JSON." }; } });
const runtimeData = computed(() => parseResult.value.value);
const parseError = computed(() => parseResult.value.error);
const validation = computed(() => validateTemplateDocument(props.document));
const documentValid = computed(() => validation.value.valid);
const validationIssues = computed(() => validation.value.issues || []);

watch(runtimeData, (value) => emit("update:runtimeData", value), { deep: true });

async function print() { try { await printRuntimeDocument({ document: validation.value.document, runtimeData: runtimeData.value }); } catch (error) { emit("print-error", error); } }
</script>

<style scoped>
.runtime-preview { display: grid; min-height: 68vh; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; }.runtime-preview__controls { display: flex; flex-direction: column; gap: 10px; }.runtime-preview__controls h3, .runtime-preview__controls p { margin: 0; }.runtime-preview__controls p { color: #64748b; font-size: 12px; line-height: 1.5; }.runtime-preview__canvas { min-height: 0; overflow: auto; border: 1px solid #e2e8f0; background: #e2e8f0; padding: 24px; }.runtime-preview__error, .runtime-preview__error-list { margin: 0; color: #b91c1c; font-size: 12px; }.runtime-preview__error-list { padding-left: 18px; }
@media (max-width: 840px) { .runtime-preview { grid-template-columns: 1fr; }.runtime-preview__canvas { max-height: 52vh; } }
</style>
