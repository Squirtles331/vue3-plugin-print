## Why

The draggable table element currently renders a detached header and an oversized empty body when its row binding is absent or unresolved. Its runtime preview cannot present the compact, line-item and total-row layout needed for invoices, orders, and delivery documents.

## What Changes

- Rework the generic table element so its body height follows the rendered row count instead of reserving a large empty area.
- Render configured sample rows in the designer and bound array rows in runtime preview and printing, with one cell per configured column.
- Add an optional in-table summary area for page subtotal, grand total, and uppercase amount rows.
- Provide a practical line-item preset matching the requested ID, name, quantity, unit price, and total layout without turning it into a separate document type.
- Replace the no-data table placeholder with a compact empty-state row that preserves the table grid.

## Capabilities

### New Capabilities

- `table-line-item-layout`: Render the generic table element as a compact line-item grid with optional calculated summary rows.

### Modified Capabilities

None.

## Impact

- Affected code: table element defaults and property helpers, the designer canvas renderer, and the runtime document renderer.
- Data model impact: table props gain explicit display and summary configuration while preserving existing `columns`, `sampleData`, and data-binding fields.
- Print behavior impact: printed tables will use the same row and summary layout as runtime preview.
