// @vitest-environment jsdom

import assert from "node:assert/strict";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { test } from "vitest";
import TableElement from "../src/print-designer/components/elements/TableElement.vue";
import { useEditorDocumentStore } from "../src/print-designer/editor/stores/documentStore.js";
import { useEditorHistoryStore } from "../src/print-designer/editor/stores/historyStore.js";
import { useEditorSelectionStore } from "../src/print-designer/editor/stores/selectionStore.js";
import { buildTableInsertOverrides, TABLE_INSERT_MODES } from "../src/print-designer/core/tableInsertBuilder.js";

function mountTable(object) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return mount(TableElement, { props: { object }, global: { plugins: [pinia] } });
}

function createTableObject(overrides = {}) {
  return {
    id: "table-1",
    ...overrides,
    props: {
      columns: [
        { key: "name", title: "Name", width: 2 },
        { key: "amount", title: "Amount", width: 1, align: "right" },
      ],
      sampleData: [],
      footerData: [],
      showHeader: true,
      showFooter: true,
      ...overrides.props,
    },
    editorHints: {
      omitRows: false,
      rowCount: 1,
      ...overrides.editorHints,
    },
    style: {
      borderWidth: 1,
      borderColor: "#0f172a",
      padding: 0,
      ...overrides.style,
    },
  };
}

test("table element renders semantic columns and preserves merged cell metadata", () => {
  const object = createTableObject({
    props: {
      sampleData: [{
        name: { value: "Merged name", colSpan: 2, style: { backgroundColor: "rgb(255, 0, 0)" } },
        amount: { value: "Hidden", colSpan: 0 },
      }],
      footerData: [{ name: { value: "Total", rowSpan: 2 }, amount: "10" }],
    },
  });
  const wrapper = mountTable(object);

  assert.equal(wrapper.find(".pd-table-element__table").exists(), true);
  assert.equal(wrapper.findAll("col").length, 2);
  assert.equal(wrapper.find("tbody td").attributes("colspan"), "2");
  assert.equal(wrapper.findAll("tbody td").length, 1);
  assert.equal(wrapper.find("tfoot td").attributes("rowspan"), "2");
  assert.equal(wrapper.find("tbody td").element.style.backgroundColor, "rgb(255, 0, 0)");
  wrapper.unmount();
});

test("table element keeps bindings and resolves formatted nested values", () => {
  const object = createTableObject({
    props: {
      columns: [{ key: "amount", valuePath: "invoice.amount", title: "Amount", formatter: { type: "currency", symbol: "$", decimals: 2 } }],
      sampleData: [{ invoice: { amount: 12.5 } }],
      dataVariable: "invoice.items",
      footerDataVariable: "invoice.summary",
    },
  });
  const wrapper = mountTable(object);

  assert.equal(wrapper.find("tbody td").text(), "$12.50");
  assert.deepEqual(wrapper.findAll(".pd-table-element__bindings span").map((token) => token.text()), [
    "数据：{{invoice.items}}",
    "页脚：{{invoice.summary}}",
  ]);
  wrapper.unmount();
});

test("custom blank-table preset renders as a headerless 5 by 10 grid", () => {
  const custom = buildTableInsertOverrides({ mode: TABLE_INSERT_MODES.CUSTOM });
  const object = createTableObject({ props: custom.props, editorHints: custom.editorHints });
  const wrapper = mountTable(object);

  assert.equal(wrapper.find("thead").exists(), false);
  assert.equal(wrapper.find("tfoot").exists(), false);
  assert.equal(wrapper.findAll("tbody tr").length, 10);
  assert.equal(wrapper.findAll("tbody td").length, 50);
  wrapper.unmount();
});

test("selected table edits only design sample data and creates an undoable command", async () => {
  const object = createTableObject({
    props: { dataVariable: "items", sampleData: [{ name: "Draft", amount: "1" }] },
  });
  const pinia = createPinia();
  setActivePinia(pinia);
  const documentStore = useEditorDocumentStore();
  const historyStore = useEditorHistoryStore();
  const selectionStore = useEditorSelectionStore();
  documentStore.addObject(object);
  selectionStore.select(object.id);
  const wrapper = mount(TableElement, { props: { object }, global: { plugins: [pinia] } });

  await wrapper.find("tbody td").trigger("dblclick", { button: 0 });
  await nextTick();
  const editor = wrapper.find("textarea");
  assert.equal(editor.exists(), true);
  await editor.setValue("Edited draft");
  await editor.trigger("keydown", { key: "Enter", shiftKey: false, isComposing: false });
  await nextTick();

  assert.equal(documentStore.objectsById[object.id].props.sampleData[0].name, "Edited draft");
  assert.equal(historyStore.undoStack.length, 1);
  wrapper.unmount();
});
