<template>
  <PdDialog
    :model-value="visible"
    title="打印预览与预检"
    width="min(1200px, 94vw)"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="runtime-preview">
      <aside class="runtime-preview__controls">
        <section class="runtime-preview__section">
          <header class="runtime-preview__section-head">
            <div>
              <h3>打印前检查</h3>
              <p>先确认模板结构、运行数据、字段绑定和浏览器打印规则。</p>
            </div>
            <span class="runtime-preview__summary" :class="`is-${preflightTone}`">{{ preflightSummary }}</span>
          </header>

          <div class="runtime-preview__checks">
            <div v-for="item in preflightItems" :key="item.key" class="runtime-preview__check" :class="`is-${item.tone}`">
              <span class="runtime-preview__check-dot"></span>
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.description }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="runtime-preview__section runtime-preview__section--data">
          <header class="runtime-preview__section-head">
            <div>
              <h3>运行数据 JSON</h3>
              <p>设计器的数据面板负责编辑；这里使用同一份 JSON 进行预检和输出。</p>
            </div>
            <span class="runtime-preview__field-count">{{ runtimeDataFieldCount }} 字段</span>
          </header>

          <pre class="runtime-preview__data">{{ runtimeDataText }}</pre>

          <ul v-if="issueList.length" class="runtime-preview__issue-list">
            <li v-for="issue in issueList" :key="issue.key" :class="`is-${issue.tone}`">
              <strong>{{ issue.scope }}</strong>
              <span>{{ issue.message }}</span>
              <PdButton v-if="issue.elementId" size="small" native-type="button" @click="emit('focus-issue', issue)">定位元素</PdButton>
            </li>
          </ul>
        </section>

        <footer class="runtime-preview__actions">
          <span>{{ printHint }}</span>
          <PdButton type="primary" :disabled="!canPrint" @click="print">浏览器打印</PdButton>
        </footer>
      </aside>

      <main class="runtime-preview__canvas">
        <div class="runtime-preview__canvas-head">
          <strong>{{ canvasTitle }}</strong>
          <span>{{ canvasDescription }}</span>
        </div>
        <RuntimeDocument v-if="previewReady" :document="validatedDocument" :runtime-data="runtimeData" />
        <div v-else class="runtime-preview__canvas-empty">
          <strong>{{ previewEmptyTitle }}</strong>
          <span>{{ previewEmptyDescription }}</span>
        </div>
      </main>
    </div>
  </PdDialog>
</template>

<script setup>
import { computed } from "vue";
import PdButton from "../ui/primitives/PdButton.vue";
import PdDialog from "../ui/primitives/PdDialog.vue";
import { validatePrintRuntime } from "./preflight.js";
import { printRuntimeDocument } from "./print.js";
import RuntimeDocument from "./RuntimeDocument.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  document: {
    type: Object,
    default: null,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  printPolicy: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["update:visible", "print-error", "focus-issue"]);
const runtimeData = computed(() => props.initialData && typeof props.initialData === "object" && !Array.isArray(props.initialData) ? props.initialData : {});
const runtimeDataText = computed(() => JSON.stringify(runtimeData.value, null, 2));
const parseError = computed(() => "");
const preflight = computed(() => {
  return validatePrintRuntime(props.document, runtimeData.value, props.printPolicy);
});
const documentValid = computed(() => preflight.value.templateIssues.every((issue) => issue.severity !== "error"));
const validatedDocument = computed(() => preflight.value.document);
const validationIssues = computed(() => preflight.value.templateIssues || []);
const resolvedRuntime = computed(() => ({ document: preflight.value.runtimeDocument, issues: preflight.value.runtimeIssues }));
const runtimeIssues = computed(() => resolvedRuntime.value.issues || []);
const runtimeErrors = computed(() => runtimeIssues.value.filter((issue) => issue.severity === "error"));
const bindingStats = computed(() => collectBindingStats(resolvedRuntime.value.document));
const runtimeDataFieldCount = computed(() => Object.keys(runtimeData.value || {}).length);
const previewReady = computed(() => documentValid.value && !parseError.value);
const canPrint = computed(() => previewReady.value && !runtimeErrors.value.length);
const preflightTone = computed(() => {
  if (!documentValid.value || parseError.value || runtimeErrors.value.length) {
    return "danger";
  }

  if (bindingStats.value.missing || runtimeIssues.value.length) {
    return "warning";
  }

  return "ok";
});
const preflightSummary = computed(() => {
  if (preflightTone.value === "danger") {
    return "需处理";
  }

  if (preflightTone.value === "warning") {
    return "可预览";
  }

  return "可打印";
});
const preflightItems = computed(() => [
  {
    key: "template",
    label: "模板结构",
    tone: documentValid.value ? "ok" : "danger",
    description: documentValid.value ? `结构通过，共 ${validatedDocument.value?.pages?.length || 0} 页。` : `${validationIssues.value.length || 1} 项模板问题需要处理。`,
  },
  {
    key: "runtime-data",
    label: "运行数据",
    tone: parseError.value ? "danger" : "ok",
    description: parseError.value || "JSON 格式正确，可用于字段解析。",
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
    label: "运行规则",
    tone: runtimeErrors.value.length ? "danger" : runtimeIssues.value.length ? "warning" : "ok",
    description: runtimeIssues.value.length ? `${runtimeIssues.value.length} 个运行时提示，打印前建议确认。` : "未发现运行时规则问题。",
  },
  {
    key: "print",
    label: "浏览器打印",
    tone: "info",
    description: "打印对话框建议选择 100% / 实际大小，并关闭页眉页脚。",
  },
]);
const issueList = computed(() => [
  ...validationIssues.value.map((issue, index) => ({
    key: `validation-${index}-${issue.path || ""}`,
    scope: "模板",
    tone: issue.severity === "error" ? "danger" : "warning",
    message: issue.message,
    elementId: issue.elementId,
  })),
  ...runtimeIssues.value.map((issue, index) => ({
    key: `runtime-${index}-${issue.path || ""}`,
    scope: "运行",
    tone: issue.severity === "error" ? "danger" : "warning",
    message: issue.message,
    elementId: issue.elementId,
  })),
]);
const printHint = computed(() => (canPrint.value ? "预检已通过，可以打开浏览器打印。" : "修复阻断项后即可打印。"));
const canvasTitle = computed(() => (previewReady.value ? "打印版面预览" : "预览暂不可用"));
const canvasDescription = computed(() => (previewReady.value ? "此处展示运行数据填充后的浏览器打印结果。" : "左侧预检会标出需要先处理的项目。"));
const previewEmptyTitle = computed(() => (parseError.value ? "运行数据 JSON 有误" : "模板结构未通过"));
const previewEmptyDescription = computed(() => (parseError.value ? "修复 JSON 格式后即可恢复预览。" : "修复模板结构问题后即可恢复预览。"));

async function print() {
  try {
    await printRuntimeDocument({ document: validatedDocument.value, runtimeData: runtimeData.value });
  } catch (error) {
    emit("print-error", error);
  }
}

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
.runtime-preview {
  display: grid;
  min-height: 68vh;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
}

.runtime-preview__controls {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
}

.runtime-preview__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.runtime-preview__section--data {
  min-height: 0;
}

.runtime-preview__section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.runtime-preview__section h3,
.runtime-preview__section p {
  margin: 0;
}

.runtime-preview__section h3 {
  color: #0f172a;
  font-size: 14px;
}

.runtime-preview__section p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.runtime-preview__summary,
.runtime-preview__field-count {
  display: inline-flex;
  height: 24px;
  align-items: center;
  padding: 0 8px;
  border: 1px solid #d9dee8;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.runtime-preview__summary.is-ok {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.runtime-preview__summary.is-warning {
  border-color: #fde68a;
  background: #fffbeb;
  color: #b45309;
}

.runtime-preview__summary.is-danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.runtime-preview__checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-preview__check {
  display: flex;
  gap: 8px;
  padding: 9px 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.runtime-preview__check-dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 999px;
  background: #94a3b8;
}

.runtime-preview__check strong,
.runtime-preview__check span {
  display: block;
}

.runtime-preview__check strong {
  color: #0f172a;
  font-size: 12px;
}

.runtime-preview__check span {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.runtime-preview__check.is-ok .runtime-preview__check-dot {
  background: #16a34a;
}

.runtime-preview__check.is-warning .runtime-preview__check-dot {
  background: #d97706;
}

.runtime-preview__check.is-danger .runtime-preview__check-dot {
  background: #dc2626;
}

.runtime-preview__check.is-info .runtime-preview__check-dot {
  background: #2563eb;
}

.runtime-preview__error,
.runtime-preview__issue-list {
  margin: 0;
  color: #b91c1c;
  font-size: 12px;
}

.runtime-preview__data {
  min-height: 180px;
  max-height: 280px;
  margin: 0;
  padding: 10px;
  overflow: auto;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
  color: #334155;
  font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.runtime-preview__issue-list {
  display: flex;
  max-height: 132px;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  overflow: auto;
  list-style: none;
}

.runtime-preview__issue-list li {
  display: flex;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.runtime-preview__issue-list li.is-danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.runtime-preview__issue-list strong {
  flex: 0 0 auto;
}

.runtime-preview__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.runtime-preview__actions span {
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.runtime-preview__canvas {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: auto;
  border: 1px solid #dbe4ef;
  background: #e2e8f0;
}

.runtime-preview__canvas-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #dbe4ef;
  background: #ffffff;
}

.runtime-preview__canvas-head strong {
  color: #0f172a;
  font-size: 13px;
}

.runtime-preview__canvas-head span {
  color: #64748b;
  font-size: 12px;
}

.runtime-preview__canvas :deep(.runtime-document) {
  padding: 24px;
}

.runtime-preview__canvas-empty {
  display: flex;
  min-height: 220px;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.runtime-preview__canvas-empty strong {
  color: #0f172a;
  font-size: 16px;
}

@media (max-width: 840px) {
  .runtime-preview {
    grid-template-columns: 1fr;
  }

  .runtime-preview__canvas {
    max-height: 52vh;
  }
}
</style>
