## 1. Table Insert Flow

- [x] 1.1 Add a dedicated table creation dialog component for insert-time configuration.
- [x] 1.2 Update workspace drop handling so table drops open the dialog instead of inserting immediately.
- [x] 1.3 Create the table object only after confirmation and keep cancel behavior free of history entries.

## 2. Table Data Model

- [x] 2.1 Add explicit design-time row metadata for empty custom tables.
- [x] 2.2 Implement helper logic that builds table props for sample-data and custom-empty insertion modes.
- [x] 2.3 Adjust default table initialization so custom empty tables do not rely on fake sample or footer data.

## 3. Canvas Rendering

- [x] 3.1 Remove the hard-coded fake table-row fallback from the canvas renderer.
- [x] 3.2 Render binding placeholders when table variables are configured but no data is present.
- [x] 3.3 Render empty rows based on design-time row count when the table is intentionally empty.

## 4. Post-Insert Editing

- [x] 4.1 Expose design-time row count in the table properties panel for later adjustment.
- [x] 4.2 Ensure column edits continue to work correctly with empty-table preview behavior.
- [x] 4.3 Verify that default header/footer behavior matches the selected insert mode.
