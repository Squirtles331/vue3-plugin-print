## Why

The independent editor already supports its target page and element types, but several persisted attributes are only partially validated, absent from the inspector capability contract, or do not have a matching preview/print effect. This makes template behavior difficult to discover and risks runtime divergence as templates become more detailed.

## What Changes

- Establish a complete, independently authored property support matrix for page settings and the ten existing element types.
- Extend `TemplateDocument v1` with canonical optional property defaults, validation, legacy migration, and migration warnings for stripped executable fields.
- Complete static property editing and runtime rendering for text, images, barcodes, QR codes, page numbers, lines, rectangles, circles, tables, and multi-label grids.
- Make table fields, column formatting, pagination, header/footer behavior, and editor-only preview hints explicit and safe; arbitrary code remains unsupported.
- Add explicit multi-label field mappings so runtime output no longer guesses object property names.
- Add preview/print parity, migration, validation, and independence-audit tests and documentation.

## Capabilities

### New Capabilities

- `template-property-matrix`: Canonical, testable property support matrix for the existing page and element model.
- `complete-element-property-rendering`: Type-specific static property editing and matching independent runtime rendering.
- `safe-table-and-label-data-layout`: Declarative table formatting and multi-label mapping with no executable expressions.

### Modified Capabilities

None.

## Impact

- Affects `TemplateDocument v1`, the property-capability registry, element defaults, inspector UI, editor canvas previews, runtime preview/print rendering, pagination, and test fixtures.
- No new printable element types, print/export channels, remote APIs, or third-party dependencies are introduced.
- Existing documents remain loadable; supported legacy aliases normalize on load, while executable table fields are removed with a warning.
