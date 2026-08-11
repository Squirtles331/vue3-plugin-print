// @vitest-environment jsdom

import assert from "node:assert/strict";
import { mount } from "@vue/test-utils";
import { test } from "vitest";
import { calculateTableSummary, formatTableSummaryCell } from "../src/print-designer/core/tableSummary.js";
import RuntimeDocument from "../src/print-designer/runtime/RuntimeDocument.vue";
import { createBlankTemplateDocument } from "../src/print-designer/template/templateDocument.js";

function createTableDocument(props) {
  return createBlankTemplateDocument({
    pages: [{
      id: "page-1",
      title: "Page 1",
      elements: [{
        id: "items",
        type: "table",
        x: 10,
        y: 10,
        width: 80,
        height: 32,
        props,
        style: {},
      }],
    }],
  });
}

test("summary tokens format page and document totals from shared table helpers", () => {
  const pageRows = [{ qty: "1", total: "10" }, { qty: "2", total: "20" }];
  const totalRows = [...pageRows, { qty: "3", total: "30" }];

  assert.deepEqual(calculateTableSummary(totalRows), { totalQty: 6, totalAmount: 60 });
  assert.equal(
    formatTableSummaryCell("{#pageQty}/{#totalQty}/{#pageSum}/{#totalSum}", { pageRows, totalRows }),
    "3/6/30.00/60.00",
  );
  assert.doesNotMatch(formatTableSummaryCell("{#totalCap}", { pageRows, totalRows }), /\{#/);
});

test("runtime table summaries use fragment rows for page totals and all rows for grand totals", () => {
  const sampleData = [
    { name: "A", qty: "1", total: "10" },
    { name: "B", qty: "2", total: "20" },
    { name: "C", qty: "3", total: "30" },
  ];
  const footerData = [{ name: "Summary", qty: "{#pageQty}", total: "{#totalSum}" }];
  const document = createTableDocument(
    {
      columns: [{ key: "name" }, { key: "qty" }, { key: "total" }],
      sampleData,
      footerData,
      showFooter: true,
      headerHeight: 8,
      rowHeight: 8,
      footerHeight: 8,
      autoPaginate: true,
    },
  );
  const wrapper = mount(RuntimeDocument, { props: { document, runtimeData: {}, mode: "preview" } });
  const pages = wrapper.findAll(".runtime-page");

  assert.equal(pages.length, 2);
  assert.deepEqual(pages[0].findAll("tfoot td").map((cell) => cell.text()), ["Summary", "3", "60.00"]);
  assert.deepEqual(pages[1].findAll("tfoot td").map((cell) => cell.text()), ["Summary", "3", "60.00"]);
  wrapper.unmount();
});

test("runtime table uses a single preview placeholder row and omits it when printing", () => {
  const document = createTableDocument(
    { columns: [{ key: "name" }], sampleData: [], footerData: [], showFooter: false, autoPaginate: true },
  );
  const preview = mount(RuntimeDocument, { props: { document, runtimeData: {}, mode: "preview" } });
  const printed = mount(RuntimeDocument, { props: { document, runtimeData: {}, mode: "print" } });

  assert.equal(preview.findAll(".runtime-table tbody tr").length, 1);
  assert.equal(preview.find(".runtime-table__empty").text(), "No data");
  assert.equal(preview.find(".runtime-element--table").element.style.height, "auto");
  assert.equal(printed.findAll(".runtime-table tbody tr").length, 0);
  preview.unmount();
  printed.unmount();
});
