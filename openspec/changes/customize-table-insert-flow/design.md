## Context

Today, dropping a table onto the canvas immediately creates a table element through the generic palette-drop path in `WorkspaceRoot.vue`. The created table inherits default registry values that include sample rows and footer data. Even if those values are removed, `PaperCanvas.vue` still falls back to rendering fake product rows when no data is present.

This creates two product problems:

- users cannot define the intended row and column structure before insertion
- empty tables are not represented as first-class design-time structures

The requested experience is closer to a production print designer:

1. drag table onto the canvas
2. confirm creation settings in a dialog
3. insert the table only after confirmation
4. render an empty table grid when the user chooses a custom table

## Goals / Non-Goals

**Goals:**

- Intercept table drops and route them through a confirmation flow.
- Let users choose between a sample-data table and a custom empty table.
- Represent custom empty tables without storing fake runtime rows.
- Render empty table grids deterministically on the canvas.
- Keep undo/redo clean by only creating a command after the user confirms insertion.

**Non-Goals:**

- Rework insertion behavior for non-table elements.
- Build a fully general table wizard with advanced formatting or binding options.
- Change runtime data binding or final print output in this change beyond removing fake design-time fallback rows.
- Replace the existing table property editor architecture.

## Decisions

### 1. Handle table confirmation inside the workspace drop flow

The table confirmation dialog will be owned by `WorkspaceRoot.vue`, because that component already receives the drop event, resolves the insertion coordinates, and decides whether an element is added.

Why this over a global modal store:

- the pending insert location is local to the workspace
- cancellation should simply discard local pending state
- this is a one-shot insert flow, not a reusable floating shell panel

### 2. Only create the table object after confirmation

The system will not create a temporary table element before the dialog completes. A pending insert payload will be stored locally, and the add-object command will only run on confirm.

Why this over creating then editing:

- canceling the dialog should not require an undo entry
- the history stack remains intuitive: one confirm equals one added object
- selection state stays simple because there is no transient object

### 3. Add explicit design-time row metadata for empty tables

Custom empty tables will use a dedicated prop such as `designRowCount` rather than encoding blank rows into `sampleData`.

Why this over filling `sampleData` with empty objects:

- it separates layout structure from runtime/sample data
- column edits do not need to keep a fake row array in sync just to draw blank lines
- the designer can distinguish between a sample-data preview and a true empty table layout

### 4. Keep column count derived from `columns`

The dialog will ask for a column count, but the persisted table structure will still express columns through `props.columns`. No extra `cols` prop will be added for tables.

Why:

- table columns already have a mature structure with keys, titles, widths, and alignment
- adding a second source of truth for column count would increase synchronization cost

### 5. Remove fake-data fallback from canvas rendering

`PaperCanvas.vue` will stop rendering hard-coded fake product rows when no data exists. Instead, rendering priority will be:

1. actual sample or bound data
2. binding placeholders when variables are configured
3. empty rows derived from design-time row metadata

Why:

- fake product rows are the main reason the current behavior feels non-productized
- empty-grid rendering is the desired visual state for custom tables

## Risks / Trade-offs

- [Adding design-only table props may blur runtime/editor boundaries] -> Limit the new prop to editor-facing rendering behavior and keep runtime data fields separate.
- [Dialog flow may feel slower for users who want quick demo tables] -> Keep a sample-data option in the dialog so the fast path still exists.
- [Removing fake fallback rows may expose edge cases in footer/header rendering] -> Define empty-table rendering behavior explicitly and disable footer display for custom empty tables by default.
- [Column edits after insertion may desync empty-table preview] -> Make empty-row rendering depend on `columns` plus `designRowCount`, not on stored blank row data.

## Migration Plan

1. Add a dedicated table creation dialog component and local pending insert state in the workspace.
2. Split table insertion into two strategies: sample-data table and custom empty table.
3. Add design-time row metadata to table props and ensure new custom tables use it.
4. Remove fake row fallback from canvas rendering and replace it with empty-row rendering.
5. Expose design-time row count in the table properties panel so inserted tables remain editable.

Rollback strategy:

- If the new flow causes issues, the workspace can temporarily fall back to direct table insertion by bypassing the dialog branch while keeping the rest of the editor unchanged.

## Open Questions

- Should the dialog default to `custom empty table` or remember the user’s last choice?
- Should custom empty tables default to `showFooter = false` and `designOmitRows = false`, or should those values remain configurable from the dialog itself?
- Does the team want row and column titles to be localized or generated with stable technical keys only?
