## 1. Template Contract

- [x] 1.1 Introduce a normalized template schema with explicit `schemaVersion`, stable page/element payloads, and validation surfaces.
- [x] 1.2 Refactor editor serialization so saved templates exclude design-only interaction state and preview placeholders.
- [x] 1.3 Add load/save adapter interfaces and wire the editor header actions to real template lifecycle flows.

## 2. Runtime Rendering

- [x] 2.1 Create a dedicated runtime renderer that consumes the normalized template schema without editor-only UI state.
- [x] 2.2 Route preview through the runtime renderer and remove placeholder-only preview behavior.
- [x] 2.3 Implement browser print on top of the same runtime rendering contract; defer PDF export to the next scoped change.
- [x] 2.4 Replace preview-only barcode and QR generation with real renderers suitable for production output.

## 3. Runtime Data Binding

- [x] 3.1 Define the runtime data context contract for variables, page state, tables, and multi-label elements.
- [x] 3.2 Implement deterministic data resolution for text, image, table, page number, barcode, QR code, and multi-label elements.
- [x] 3.3 Define and implement a constrained execution path for table transformation logic with validation and error reporting.

## 4. Product Flows

- [x] 4.1 Implement template create, open, save, and save-status UX backed by the persistence adapter.
- [x] 4.2 Add validation errors and missing-data feedback for templates before preview, print, or export.
- [x] 4.3 Define a publish-ready template payload and the minimum metadata needed for runtime consumption.

## 5. Hardening

- [x] 5.1 Add automated tests for schema serialization, runtime rendering parity, pagination behavior, and data-binding scenarios.
- [x] 5.2 Add performance checks for large documents and split heavy client bundles where runtime or editor size becomes a risk.
- [x] 5.3 Document implementation constraints, rollout order, and fallback strategy for incremental release.
