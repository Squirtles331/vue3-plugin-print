## Why

The commercial runtime is now usable, but starting a document still means configuring a blank canvas and the property panel exposes only part of the editing controls expected from a production print designer.  This leaves common documents such as delivery notes, invoices, packing slips, and product labels slow to create and makes existing element capabilities hard to discover.

This change establishes an independently designed template catalog and completes the property-editing contract for the existing printable element set.  It provides a focused, verifiable next parity milestone without reusing upstream templates, copy, assets, or implementation.

## What Changes

- Add a first-party starter-template catalog with independently authored layouts for common document and label workflows; users can preview a template, create a new editable document from it, and keep the saved document independent from its starter definition.
- Add template import and export for `TemplateDocument v1`, including validation, migration, clear errors, and an explicit policy for invalid or unsupported input.
- Implement reusable element presets: users can save a selected element as a local preset and insert an isolated copy later; the existing no-op “save as template element” action becomes a working product flow.
- Complete the page property surface for paper size, orientation, margins, background, print marks, and page-level metadata, with the same normalized document state used by preview and browser print.
- Complete the common geometry, visibility, locking, layer, print, style, and data-binding property surface for the existing text, image, table, barcode, QR code, page number, shape, and multi-label elements.
- Add missing element-specific property controls and validation, including barcode/QR options, image loading and crop behavior, table column/header/footer/pagination configuration, and multi-label layout/binding configuration.
- Add layout editing commands for duplicate, precise ordering, alignment, and distribution so property changes and multi-selection use a predictable, serializable document model.
- **BREAKING**: Normalize legacy page and element property aliases during load/import; the runtime persists only canonical `TemplateDocument v1` property names after the document is next saved.

## Capabilities

### New Capabilities

- `starter-template-catalog`: Independently authored starter templates that can be browsed, previewed, and instantiated as editable documents.
- `template-interchange`: Safe import and export of normalized `TemplateDocument v1` files.
- `element-preset-library`: Local reusable element presets with isolated insertion and lifecycle management.
- `page-property-editing`: Normalized, validated page-level print and presentation properties shared by editor, preview, and browser print.
- `element-property-editing`: Complete, type-aware editing and validation of common and element-specific properties for the supported element set.
- `layout-editing-commands`: Deterministic duplicate, order, alignment, and distribution commands for selected printable elements.

### Modified Capabilities

None.

## Impact

- Affected code: `src/print-designer/template/**`, `src/print-designer/editor/**`, `src/print-designer/core/**`, `src/print-designer/runtime/**`, and inspector/palette/layout components.
- Affected data: `TemplateDocument v1` migrations, page models, element `props` and `style` payloads, plus separately stored local element-preset records.
- Affected UX: new-template flow, template library, toolbar/inspector panels, selection commands, and validation feedback.
- Tests required: template catalog isolation, import/export round trips and invalid-input errors, page/element property serialization, runtime parity, and layout-command behavior.
