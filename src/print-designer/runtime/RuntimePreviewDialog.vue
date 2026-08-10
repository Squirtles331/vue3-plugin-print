<template>
  <el-dialog :model-value="visible" title="打印预览与预检" width="min(1200px, 94vw)" top="4vh" @update:model-value="emit('update:visible', $event)">
    <div class="runtime-preview">
      <aside class="runtime-preview__controls">
        <section class="runtime-preview__section">
          <h3>打印前预检</h3>
          <div class="runtime-preview__checks">
            <div v-for="item in preflightItems" :key="item.key" class="runtime-preview__check" :class="`is-${item.tone}`">
              <strong>{{ item.label }}</strong>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </section>

        <section class="runtime-preview__section">
          <h3>运行时 JSON</h3>
          <p>输入一个 JSON 对象。变量、表格和标签网格会按字段路径解析。</p>
          <el-input v-model="runtimeDataText" type="textarea" :rows="14" spellcheck="false" />
          <p v-if="parseError" class="runtime-preview__error">{{ parseError }}</p>
          <ul v-if="validationIssues.length" class="runtime-preview__error-list">
            <li v-for="issue in validationIssues" :key="`${issue.path}-${issue.message}`">{{ issue.message }}</li>
          </ul>
        </section>

        <el-button type="primary" :disabled="!canPrint" @click="print">浏览器打印</el-button>
      </aside>
      <div class="runtime-preview__canvas">
        <RuntimeDocument v-if="documentValid && !parseError" :document="document" :runtime-data="runtimeData" />
        <div v-else class="runtime-preview__canvas-empty">修复预检问题后可查看打印预览。</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { validateTemplateDocument } from "../template/templateDocument.js";
import { resolveRuntimeTemplate } from "./dataResolver.js";
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
const resolvedRuntime = computed(() => {
  if (!documentValid.value || parseError.value) {
    return { document: null, issues: [] };
  }

  return resolveRuntimeTemplate(validation.value.document, runtimeData.value);
});
const runtimeIssues = computed(() => resolvedRuntime.value.issues || []);
const bindingStats = computed(() => collectBindingStats(resolvedRuntime.value.document));
const canPrint = computed(() => documentValid.value && !parseError.value && !runtimeIssues.value.some((issue) => issue.severity === "error"));
const preflightItems = computed(() => [
  {
    key: "template",
    label: "模板结构",
    tone: documentValid.value ? "ok" : "danger",
    description: documentValid.value ? "模板校验通过。" : `${validationIssues.value.length || 1} 个模板问题需要处理。`,
  },
  {
    key: "runtime-data",
    label: "运行数据",
    tone: parseError.value ? "danger" : "ok",
    description: parseError.value || "JSON 数据格式正确。",
  },
  {
    key: "bindings",
    label: "字段绑定",
    tone: bindingStats.value.missing ? "warning" : "ok",
    description: bindingStats.value.total
      ? `${bindingStats.value.total - bindingStats.value.missing}/${bindingStats.value.total} 个绑定已解析。`
      : "当前模板没有运行时字段绑定。",
  },
  {
    key: "runtime",
    label: "运行时规则",
    tone: runtimeIssues.value.length ? "warning" : "ok",
    description: runtimeIssues.value.length ? `${runtimeIssues.value.length} 个运行时提示，建议打印前确认。` : "未发现运行时规则问题。",
  },
  {
    key: "print",
    label: "浏览器打印",
    tone: "info",
    description: "打印对话框中建议选择 100% / 实际大小，并关闭页眉页脚。",
  },
]);

watch(runtimeData, (value) => emit("update:runtimeData", value), { deep: true });

async function print() { try { await printRuntimeDocument({ document: validation.value.document, runtimeData: runtimeData.value }); } catch (error) { emit("print-error", error); } }

function collectBindingStats(document) {
  const stats = { total: 0, missing: 0 };

  (document?.pages || []).forEach((page) => {
    (page.elements || []).forEach((element) => {
      if (element.runtime?.value?.path) {
        stats.total += 1;
        if (element.runtime.value.status === "missing") {
          stats.missing += 1;
        }
      }

      const table = element.runtime?.table;
      if (table?.path || element.props?.dataVariable) {
        stats.total += 1;
        if (table?.dataStatus === "missing") {
          stats.missing += 1;
        }
      }

      if (table?.footerPath || element.props?.footerDataVariable) {
        stats.total += 1;
        if (table?.footerStatus === "missing") {
          stats.missing += 1;
        }
      }

      const multiLabel = element.runtime?.multiLabel;
      if (multiLabel?.path || element.props?.dataVariable) {
        stats.total += 1;
        if (multiLabel?.status === "missing") {
          stats.missing += 1;
        }
      }
    });
  });

  return stats;
}
</script>

<style scoped>
.runtime-preview { display: grid; min-height: 68vh; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; }.runtime-preview__controls { display: flex; min-height: 0; flex-direction: column; gap: 14px; }.runtime-preview__section { display: flex; flex-direction: column; gap: 10px; }.runtime-preview__controls h3, .runtime-preview__controls p { margin: 0; }.runtime-preview__controls h3 { color: #0f172a; font-size: 14px; }.runtime-preview__controls p { color: #64748b; font-size: 12px; line-height: 1.5; }.runtime-preview__checks { display: flex; flex-direction: column; gap: 8px; }.runtime-preview__check { display: flex; flex-direction: column; gap: 3px; padding: 9px 10px; border: 1px solid #e2e8f0; background: #f8fafc; }.runtime-preview__check strong { color: #0f172a; font-size: 12px; }.runtime-preview__check span { color: #64748b; font-size: 12px; line-height: 1.45; }.runtime-preview__check.is-ok { border-color: #bbf7d0; background: #f0fdf4; }.runtime-preview__check.is-warning { border-color: #fde68a; background: #fffbeb; }.runtime-preview__check.is-danger { border-color: #fecaca; background: #fef2f2; }.runtime-preview__check.is-info { border-color: #bfdbfe; background: #eff6ff; }.runtime-preview__canvas { display: flex; min-height: 0; overflow: auto; border: 1px solid #e2e8f0; background: #e2e8f0; padding: 24px; }.runtime-preview__canvas-empty { display: grid; min-height: 220px; flex: 1; place-items: center; color: #64748b; font-size: 13px; }.runtime-preview__error, .runtime-preview__error-list { margin: 0; color: #b91c1c; font-size: 12px; }.runtime-preview__error-list { padding-left: 18px; }
@media (max-width: 840px) { .runtime-preview { grid-template-columns: 1fr; }.runtime-preview__canvas { max-height: 52vh; } }
</style>
