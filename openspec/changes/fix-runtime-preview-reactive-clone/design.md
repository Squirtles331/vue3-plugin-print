## Context

`onPreview` serializes a valid `TemplateDocument v1` and assigns it to a normal Vue `ref`. Vue deep-reactifies the object, so `RuntimeDocument` receives a proxy. The runtime resolver deliberately clones its input before adding ephemeral runtime data, but browser `structuredClone` rejects Vue proxies and throws before preview rendering begins.

The runtime resolver is also used by print and test integrations, so callers outside the editor may independently pass a reactive document.

## Goals / Non-Goals

**Goals:**

- Open runtime preview with a serialized editor template and runtime JSON without browser or Vue errors.
- Keep runtime resolution non-mutating and compatible with plain or Vue-reactive `TemplateDocument v1` inputs.
- Preserve the existing serialization, binding, pagination, and print contracts.

**Non-Goals:**

- Change the template schema, runtime JSON format, or printing APIs.
- Make arbitrary non-serializable values such as functions valid template inputs.
- Change the editor's regular mutable document store.

## Decisions

1. Store the editor's preview snapshot in `shallowRef` rather than `ref`.
   - The preview document is already a serialized immutable snapshot, so it does not require nested observation.
   - This prevents the normal editor preview path from converting the snapshot into a proxy.
   - Alternative: deep clone at every dialog boundary. This adds redundant work and does not protect other runtime resolver callers.

2. Normalize the resolver input with Vue `toRaw` before cloning.
   - `toRaw` is a no-op for ordinary documents and unwraps a Vue proxy for integrations that pass one.
   - The existing clone remains responsible for producing an independent runtime copy before transient `runtime` properties are added.
   - Alternative: JSON round-trip every input. It loses JSON edge semantics unnecessarily and obscures the existing clone intent.

3. Cover both layers with regression tests.
   - Unit coverage supplies a reactive document directly to `resolveRuntimeTemplate` and verifies it resolves without mutating the source.
   - Browser regression verifies the Preview action produces runtime output without console/page errors.

## Risks / Trade-offs

- [Vue runtime helper in the resolver] → `vue` is already a production dependency and the helper is a no-op outside proxy inputs.
- [A non-serializable external input still fails cloning] → this is intentional; `TemplateDocument v1` is JSON-shaped and scripts remain unsupported.
- [Preview snapshot is shallow] → the snapshot is replaced atomically on each Preview action, which matches its current lifecycle.
