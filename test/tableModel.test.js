import assert from "node:assert/strict";
import { test } from "vitest";
import {
  applyTableCellStyle,
  insertTableColumn,
  insertTableRow,
  mergeTableCells,
  removeTableColumn,
  removeTableRow,
  renameTableColumn,
  splitTableCell,
  tableCellDisplayValue,
} from "../src/print-designer/core/tableModel.js";

const columns = [
  { key: "name", title: "Name", width: 1 },
  { key: "amount", title: "Amount", width: 1 },
];

test("table model merges, splits and styles descriptor cells without mutating source rows", () => {
  const rows = [{ name: "A", amount: 3 }, { name: "B", amount: 4 }];
  const merged = mergeTableCells(rows, columns, [
    { rowIndex: 0, colField: "name" },
    { rowIndex: 0, colField: "amount" },
  ]);

  assert.equal(merged.changed, true);
  assert.deepEqual(rows, [{ name: "A", amount: 3 }, { name: "B", amount: 4 }]);
  assert.equal(merged.rows[0].name.colSpan, 2);
  assert.equal(merged.rows[0].amount.colSpan, 0);

  const styled = applyTableCellStyle(merged.rows, columns, [{ rowIndex: 0, colField: "amount" }], { backgroundColor: "#ffffff", fontWeight: "bold", unknown: "x" });
  assert.deepEqual(styled.rows[0].name.style, { backgroundColor: "#ffffff", fontWeight: "bold" });

  const split = splitTableCell(styled.rows, columns, 0, "amount");
  assert.equal(split.changed, true);
  assert.equal(split.rows[0].name.value, "A");
  assert.deepEqual(split.rows[0].name.style, { backgroundColor: "#ffffff", fontWeight: "bold" });
  assert.equal(split.rows[0].amount, 3);
});

test("table model keeps data, spans and row-height indexes aligned through structural edits", () => {
  const data = [{ name: { value: "A", rowSpan: 2 }, amount: 1 }, { name: { value: "", rowSpan: 0, colSpan: 0 }, amount: 2 }];
  const insertedRow = insertTableRow(data, columns, 1, { body: { 1: 9 }, footer: {} });
  assert.equal(insertedRow.rows.length, 3);
  assert.equal(insertedRow.rows[0].name.rowSpan, 3);
  assert.deepEqual(insertedRow.rowHeights.body, { 2: 9 });

  const removedRow = removeTableRow(insertedRow.rows, columns, 1, insertedRow.rowHeights);
  assert.equal(removedRow.rows.length, 2);
  assert.equal(removedRow.rows[0].name.rowSpan, 2);

  const insertedColumn = insertTableColumn(columns, removedRow.rows, [{ name: "Total", amount: { value: "", field: "amount" } }], 1);
  assert.equal(insertedColumn.columns.length, 3);
  assert.equal(insertedColumn.sampleData[0].name.colSpan, 2);

  const removedColumn = removeTableColumn(insertedColumn.columns, insertedColumn.sampleData, insertedColumn.footerData, 1);
  assert.equal(removedColumn.columns.length, 2);
  assert.equal(removedColumn.sampleData[0].name.colSpan, undefined);
});

test("renaming a column follows cell values and safe footer summaries", () => {
  const renamed = renameTableColumn(
    columns,
    [{ name: "A", amount: 5 }],
    [{ name: "Total", amount: { value: "Σ ", field: "amount" } }],
    1,
    "price",
    "Price",
  );

  assert.equal(renamed.columns[1].key, "price");
  assert.equal(renamed.sampleData[0].price, 5);
  assert.equal(renamed.footerData[0].price.field, "price");
  assert.equal(tableCellDisplayValue(renamed.footerData[0].price, renamed.sampleData), "Σ 5");
});
