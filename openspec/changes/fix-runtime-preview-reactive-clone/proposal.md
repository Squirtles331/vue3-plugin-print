## Why

Opening the runtime preview currently crashes because the preview snapshot becomes a Vue reactive proxy before the runtime resolver clones it. This blocks JSON preview and preview-initiated browser printing, both of which are required in the v0.1 workflow.

## What Changes

- Preserve preview template snapshots as non-reactive document values when passing them from the editor shell to the runtime preview dialog.
- Make runtime document resolution safely accept Vue proxy inputs without changing the `TemplateDocument v1` contract or executing user-supplied code.
- Add regressions for reactive preview input and the editor preview action.

## Capabilities

### New Capabilities

- `runtime-preview-reactive-safety`: Runtime preview and rendering safely resolve a serialized template document even when an integration passes it through Vue reactivity.

### Modified Capabilities

- None.

## Impact

- Affects editor preview state in `src/print-designer/editor/EditorRoot.vue`.
- Affects runtime template resolution in `src/print-designer/runtime/dataResolver.js`.
- Adds focused unit and browser-facing regression coverage; no public API, document schema, dependency, or template data changes.
