## 1. Property contract and migration

- [x] 1.1 Create an independently authored property support matrix covering page, common, and all ten existing element types.
- [x] 1.2 Extend `TemplateDocument v1` normalization and validation with additive canonical defaults, cross-field constraints, explicit editor hints, and non-executable legacy-field warnings.
- [x] 1.3 Extend the capability registry so every persisted supported field has type, bounds/default, editor-only flag, and renderer effect metadata.
- [x] 1.4 Add contract and migration tests for defaults, aliases, warnings, unknown fields, and canonical serialization.

## 2. Shared rendering semantics

- [x] 2.1 Add shared safe helpers for static style, image position, machine-code presentation, table value formatting, and relative record paths.
- [x] 2.2 Update the editor canvas and independent runtime to use the shared semantics and intentionally ignore editor-only hints in output.
- [x] 2.3 Add preview/print parity assertions for common page and element properties.

## 3. Text, image, machine-code, page-number, and shape properties

- [x] 3.1 Complete registry-backed inspector controls and validation for text and image presentation properties.
- [x] 3.2 Complete barcode and QR-code options including colour, margins, human-readable text settings, and explicit invalid-value states.
- [x] 3.3 Complete page-number, line, rectangle, and circle options, including deterministic aspect constraints for circles.
- [x] 3.4 Add focused property, locked-edit, canvas-preview, and runtime tests for these element groups.

## 4. Declarative table properties

- [x] 4.1 Normalize table columns, formatter descriptors, header/footer settings, metrics, pagination settings, and editor hints into the canonical contract.
- [x] 4.2 Complete structured table inspector controls for columns, allowed formatters, metrics, pagination, and preview hints without executable code.
- [x] 4.3 Apply column formatting and persisted table styles consistently in editor preview, pagination, runtime preview, and browser print.
- [x] 4.4 Add table validation, migration, pagination, header/footer-repeat, and safe-transform tests.

## 5. Explicit multi-label mapping

- [x] 5.1 Add canonical multi-label primary/secondary/tertiary field paths and cell presentation defaults with legacy-compatible normalization.
- [x] 5.2 Add validated structured inspector controls for label mappings and grid presentation.
- [x] 5.3 Render explicit mappings and missing-value states in the canvas and independent runtime.
- [x] 5.4 Add multi-label mapping, missing-path, static-layout, and preview/print parity tests.

## 6. Verification and documentation

- [x] 6.1 Run full unit, performance, build, import/export, and source-compliance checks; resolve regressions.
- [x] 6.2 Update the commercial-independence audit, runtime contract, property matrix, and user-facing documentation for this capability.
