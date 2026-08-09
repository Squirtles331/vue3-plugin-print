## Why

The runtime preview dialog is shown in a Chinese-first designer, but its left-side labels, help text, and print action remain English. This makes the primary runtime-data workflow inconsistent with the rest of the editor.

## What Changes

- Translate the runtime preview dialog title, left-side JSON heading, explanatory text, and browser-print action into Chinese.
- Keep runtime JSON behavior, validation semantics, and browser-print behavior unchanged.

## Capabilities

### New Capabilities

- `runtime-preview-chinese-copy`: Chinese-first copy for runtime preview controls and guidance.

### Modified Capabilities

- None.

## Impact

- Affects visible copy in `src/print-designer/runtime/RuntimePreviewDialog.vue` only.
- No data model, API, dependency, or rendering behavior changes.
