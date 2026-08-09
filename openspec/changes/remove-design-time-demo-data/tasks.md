## 1. Element Defaults

- [x] 1.1 Remove demo content, fake payloads, and generated sample collections from new element defaults in `src/print-designer/core/elementRegistry.js`.
- [x] 1.2 Keep structural defaults needed for editing, including table columns, design row metadata, and multi-label grid configuration, while leaving bound-data fields empty by default.
- [x] 1.3 Review element creation helpers and insert-time table setup so new element creation paths all follow the same data-free initialization rules.

## 2. Canvas Preview Behavior

- [x] 2.1 Replace text, page number, barcode, QR code, and image preview fallbacks in `src/print-designer/components/layout/PaperCanvas.vue` with explicit empty-state or unbound placeholders.
- [x] 2.2 Remove synthetic table body and footer preview data while preserving empty-row scaffolding and binding placeholder rendering for unbound tables.
- [x] 2.3 Remove synthetic multi-label sample content from preview helpers while preserving visible grid structure for empty layouts.

## 3. Editor Consistency

- [x] 3.1 Update inspector defaults, labels, and related editor assumptions so empty collections and empty content remain first-class editable states.
- [x] 3.2 Ensure preview placeholders are render-only feedback and are not written back into element `content`, `sampleData`, `footerData`, or binding fields.

## 4. Compatibility Verification

- [x] 4.1 Verify that existing templates with explicit authored content or sample data still load and preview without forced cleanup.
- [x] 4.2 Add or update focused tests covering new element initialization, empty table preview, empty multi-label preview, and unbound machine-readable elements.
