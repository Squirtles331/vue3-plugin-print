## 1. Template and property contract foundation

- [x] 1.1 Extend `TemplateDocument v1` normalization with canonical page and common/type-specific element property defaults, documented legacy aliases, and bounded validation errors.
- [x] 1.2 Add a field-capability registry that maps each supported element type to its editable property groups, types, ranges, enums, runtime effects, and cross-field validators.
- [x] 1.3 Add template-contract fixtures and tests for legacy normalization, invalid property rejection, canonical serialization, and exclusion of editor-only state.

## 2. Starter-template catalog

- [x] 2.1 Create independently authored declarative starter definitions for a sales document, delivery or packing document, product-label sheet, and blank custom page, each with original metadata and asset-free thumbnail data.
- [x] 2.2 Add catalog filtering, template-detail preview, and create-from-starter UI to the new-template flow without changing the active document before confirmation.
- [x] 2.3 Implement starter instantiation with fresh document/page/element identifiers, dirty-state handling, and isolation from catalog definitions and saved records.
- [x] 2.4 Record starter-template provenance and add automated compliance scans for catalog text, fixtures, and assets.

## 3. Template interchange and element presets

- [x] 3.1 Implement `TemplateDocument v1` JSON interchange envelopes and export action with format/version metadata and normalized-data-only payloads.
- [x] 3.2 Implement file import parsing, size and schema limits, migration warnings, fresh imported document IDs, and non-destructive error handling.
- [x] 3.3 Add a local element-preset repository with create, list, rename, and delete operations isolated from template storage.
- [x] 3.4 Replace the inspector’s save-as-template placeholder with validated preset creation and add a preset-library insertion UI that creates isolated current-page elements.
- [x] 3.5 Test import/export round trips, malformed/unsupported input, ID-collision behavior, preset isolation, and browser-storage failures.

## 4. Page property editing and runtime parity

- [x] 4.1 Refactor the page-settings store and panel to edit canonical paper, orientation, four-margin, background, metadata, and guide/print-mark properties with clear scope labels.
- [x] 4.2 Add page-geometry and printable-area validation that blocks save, preview, print, export, and catalog instantiation only when output would be invalid.
- [x] 4.3 Update runtime preview and browser print styles to consume canonical printable page properties and to intentionally ignore editor-only guide settings.
- [x] 4.4 Add page-property serialization and preview/print parity tests, including legacy aliases and invalid printable areas.

## 5. Complete element property editing

- [x] 5.1 Render the common property groups from the capability registry, enforce lock/visibility/print-state behavior, and give field-level validation feedback without discarding valid in-progress input.
- [x] 5.2 Complete text, image, barcode, QR code, page-number, line, rectangle, and circle inspectors with validated controls and matching runtime render behavior.
- [x] 5.3 Complete table structured editors for columns, headers, footers, pagination, bindings, and supported safe transformations; reject arbitrary executable code.
- [x] 5.4 Complete multi-label structured editors for grid direction, gaps, binding paths, and preview data while keeping runtime data authoritative.
- [x] 5.5 Add unresolved-binding states and tests for text, image, barcode, QR, table, and multi-label runtime data paths.
- [x] 5.6 Add focused unit and integration tests covering property normalization, validation, editor mutation, serialization, preview, and browser-print parity for every supported element type.

## 6. Layout editing commands

- [x] 6.1 Add document-coordinate selection-bound utilities and a single-transaction command boundary for duplicate, order, align, and distribute operations.
- [x] 6.2 Implement duplicate, z-order, horizontal/vertical alignment, and horizontal/vertical distribution commands with locked-element exclusion and documented overflow behavior.
- [x] 6.3 Add discoverable toolbar/context controls and disabled/feedback states for ineligible selections.
- [x] 6.4 Test command geometry at multiple zoom levels, multi-selection history undo/redo, locked elements, page bounds, and serialization without viewport state.

## 7. Verification and release hardening

- [x] 7.1 Run the full unit, build, performance, catalog-compliance, import/export, and runtime-parity suites; resolve regressions.
- [x] 7.2 Update commercial-independence audit, runtime contract, third-party notices, and user-facing documentation for catalog, interchange, presets, property support, and non-goals.
