## Context

`TemplateDocument v1` already separates persisted data from editor interaction state and an independent runtime consumes the normalized document for preview and browser print. The current property panel has a capability registry plus focused table editors, but some element defaults are not represented by the registry and some stored fields do not have a runtime effect. This change completes the existing model without importing any reference implementation or interchange format.

## Goals / Non-Goals

**Goals:**

- Give every persisted supported property a canonical default, validation rule, inspector control, editor-preview behavior, and runtime-preview/print behavior.
- Keep visual/layout attributes static at design time and restrict runtime data to content, rows, and label records.
- Preserve existing documents through additive v1 defaults and clear migration warnings for removed executable fields.
- Make table and multi-label data presentation explicit, declarative, and safe.

**Non-Goals:**

- New element types, rich text, charts, arbitrary expressions, PDF/image export, silent/cloud print, or print-printer configuration.
- Compatibility with any external template JSON shape or visual reproduction of another product.

## Decisions

### 1. The capability registry is the single property contract

Each page and element property will be represented by registry metadata: source, type, default, bounds/enum, editor-only flag, and renderer effect. The normalizer and inspector will consume this metadata or shared typed helpers; runtime tests will assert every non-editor-only registered field has a render effect.

Alternative: retain independent inspector schemas and runtime defaults. Rejected because it allowed orphaned attributes and inconsistent validation.

### 2. Keep `TemplateDocument v1` additive and canonical

New fields are optional on input, receive defaults during normalization, and serialize in canonical form. Unknown non-executable `props` fields remain intact for forward compatibility. Known script fields are stripped and added to migration warnings; they are never evaluated.

Alternative: create v2. Rejected because all additions are optional and a migration version bump would add risk without a structural benefit.

### 3. Split editor hints from output properties

Design-time table row limits and other editor hints live in an explicit `editorHints` branch. They may persist for authoring continuity but are ignored by the standalone runtime and browser-print renderer. Page guides and selection state continue to be non-persistent.

Alternative: keep hints next to print properties. Rejected because it obscures whether a field affects output.

### 4. Use declarative presentation, not expressions

Table columns will define value path, display label, width, alignment, and a constrained formatter descriptor. Label grids will define explicit primary/secondary/tertiary paths. Only allowlisted JSON transforms and formatter descriptors are interpreted at runtime.

Alternative: JavaScript callbacks or template expressions. Rejected for commercial security, portability, and deterministic print output.

### 5. Render editor preview and runtime from shared semantic helpers

Reusable style, machine-code option, table-cell, and label-field helpers will normalize display values. The canvas may use lightweight placeholders, but it must honor the same dimensions, mappings, colors, spacing, and visibility as the runtime renderer.

Alternative: duplicate presentation logic per Vue component. Rejected because preview/print drift is the primary risk of this change.

## Risks / Trade-offs

- [Expanded property surface creates invalid combinations] → Validate cross-field constraints at edit, save, import, preview, and print boundaries.
- [Legacy templates include unsupported script fields] → Strip only executable keys, retain other unknown values, and return a visible migration warning.
- [Table formatting increases pagination complexity] → Keep layout metrics explicit in millimetres and test header/footer/repeat cases.
- [Machine-code option changes affect readability] → Bound margins, text size, and colours; surface renderer errors instead of silently producing invalid output.
- [Large schemas make inspector hard to navigate] → Group fields by content, data, layout, style, and output behavior with concise help text.

## Migration Plan

1. Add the matrix, canonical defaults, aliases, editor hints, and validation while preserving v1 input compatibility.
2. Wire each registered property through the inspector, editor canvas, runtime renderer, and pagination helpers.
3. Migrate legacy table hints and strip executable fields with warnings during load/import.
4. Verify all existing fixtures round-trip and use feature tests to block regressions.

Rollback consists of hiding a new inspector group while the normalizer continues reading its optional fields; existing documents remain valid because all newly introduced fields are optional on input.
