## Why

The print designer still initializes several elements with demo content, mock rows, and example machine-readable values, which makes the canvas feel like a prototype instead of a real product. We need to remove design-time fake data now so that template authors start from empty structure, explicit placeholders, and real binding intent rather than inheriting misleading sample content.

## What Changes

- Remove default demo business data from newly created design elements, especially tables, multi-label layouts, text, barcode, QR code, and page-number content.
- Replace content-shaped preview fallbacks with product-style empty states and binding placeholders that show structure without pretending real data exists.
- Keep design-time layout scaffolding where needed, such as table columns, configurable empty rows, and unbound element placeholders, but stop generating sample records, totals, example labels, and hard-coded runtime values.
- Align element initialization, canvas preview behavior, and inspector expectations so every new canvas starts from a clean, data-free baseline.

## Capabilities

### New Capabilities
- `designer-empty-initialization`: Define how new design elements and canvas previews behave when no business data has been provided, including empty defaults, structural placeholders, and unbound-state feedback.

### Modified Capabilities

None.

## Impact

- Affected code: `src/print-designer/core/elementRegistry.js`, `src/print-designer/components/layout/PaperCanvas.vue`, related inspector panels, and element creation helpers.
- Affected UX: new element insertion, empty canvas preview behavior, and unbound element messaging throughout the designer.
- Affected runtime boundary: reduces leakage of design-time fake data into later save, preview, and runtime rendering work.
