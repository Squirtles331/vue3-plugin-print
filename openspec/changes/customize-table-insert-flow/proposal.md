## Why

The current table insert experience immediately creates a table with built-in fake data after drag-and-drop. That behavior makes the designer feel like a demo rather than a production tool, and it conflicts with the expected workflow of confirming table structure first and then seeing an empty layout on the canvas.

This change improves the table insertion experience now so the editor behaves like a real design product: the user configures the table at insert time, and the canvas reflects an intentional empty structure instead of unrelated sample rows.

## What Changes

- Add a table creation confirmation flow that appears when a table is dropped onto the canvas.
- Support two insertion modes: a sample-data table for demonstration and a custom empty table for real layout work.
- Introduce explicit design-time empty-table structure so row count is represented without polluting runtime data fields.
- Remove the canvas fallback that renders fake product rows when no table data exists.
- Keep non-table drag-and-drop behavior unchanged.

## Capabilities

### New Capabilities
- `table-insert-confirmation`: Configure table insertion through an explicit confirmation dialog before the table object is added to the document.
- `empty-table-design-preview`: Represent and render empty table structures on the canvas without relying on fake sample data rows.

### Modified Capabilities

None.

## Impact

- Affected code: `src/print-designer/editor/workspace/WorkspaceRoot.vue`, `src/print-designer/components/layout/PaperCanvas.vue`, `src/print-designer/core/elementRegistry.js`, and `src/print-designer/editor/panels/ElementPropertiesPanel.vue`.
- New UI surface: a dedicated table creation dialog component in the editor layer.
- Data model impact: table props will gain explicit design-time structure metadata for empty-row rendering.
- User-facing behavior impact: dropping a table will no longer immediately create a fake-data table by default.
