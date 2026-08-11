## Context

`TemplateDocument v1` stores one global paper size, safe margins, absolute element positions, runtime bindings, and table pagination settings. The editor displays margins only as a safe-area guide; the print iframe does not apply the paper size. Runtime issues are mostly warnings, and pagination duplicates every element on each table fragment. Runtime data is held by the preview store but is not exposed to the editor's field panel.

## Goals / Non-Goals

**Goals:**

- Produce browser output with the authored paper size and guard the authored printable area.
- Block incomplete business output by default without printing placeholder text.
- Make repeated-page behaviour explicit and testable.
- Let authors discover and apply paths from their current runtime JSON, then locate preflight failures.
- Remove misleading unit controls and make integration failures observable and typed.

**Non-Goals:**

- Guarantee a physical printer's non-printable margins, control native-dialog selections, or report whether a user completed a print job.
- Add PDF, silent/cloud, SSR, collaboration, dynamic column schemas, or arbitrary template scripts.
- Change the persisted schema version or require an external dependency.

## Decisions

### Treat page margins as an authored printable safe area

The iframe will emit `@page { size: <width>mm <height>mm; margin: 0 }` so the runtime page remains the authored full-sheet coordinate system. A strict preflight will block printable elements outside the configured safe area. This matches the existing canvas guide and avoids shifting all absolute coordinates by a CSS page margin. Using `@page margin` was rejected because it would make a 210 mm runtime sheet overflow an A4 content box and break existing coordinates.

### Use strict preflight by default with an explicit escape hatch

`printPolicy.allowIncomplete` defaults to `false`. Missing bound values, missing table/label arrays, empty printable machine codes, and safe-area violations are errors in strict mode; the same conditions remain warnings when incomplete output is explicitly allowed. Print-mode renderers output blank content rather than human-readable placeholder strings. This keeps authoring feedback while preventing accidental publication of it.

### Wait for all printable resources before opening the dialog

The print iframe will wait for copied stylesheet links, iframe fonts, machine-code rendering, and image decoding. Any failed image rejects printing with a specific error. A bounded timeout remains to avoid a stuck print action; inaccessible cross-origin styles or fonts can still affect final typography and are documented as a calibration risk.

### Define pagination as a base page plus generated table fragments

The source page is always rendered for fragment one. Generated fragments render the table being fragmented and only elements with `repeatPerPage: true`; tables without a row fragment are omitted. This gives the existing repeat control a real effect and prevents empty-table placeholders on later pages. Different table lengths share the maximum fragment count, so the UI will report a non-blocking layout warning when more than one paginated table participates.

### Derive bounded field paths at the editor boundary

`setRuntimeData` will derive safe dotted/indexed paths from the supplied JSON with depth and item limits, then write them to the document store. The existing data panel will emit a selected path; for one selected compatible element, the editor converts it to the appropriate binding property through an undoable command. This is deliberately a flat searchable list for the first release; a schema editor is not required.

### Keep public integration additive

The component gains `printPolicy` and `whenReady()` without changing existing template fields. The public declaration becomes structural enough for normal authoring. The misleading pixel option is removed, and legacy metadata is normalised to `mm` because all persisted geometry has always been interpreted as millimetres.

## Risks / Trade-offs

- [Strict mode can block intentionally incomplete stationery] → `allowIncomplete` gives hosts an explicit audited opt-out.
- [CSS page size is not honoured by every printer driver] → preserve the native-dialog calibration guidance and test in supported Chrome/Edge devices.
- [Changing pagination affects existing long-table templates] → preserve the first page and add focused regression tests for repeated elements and table fragments.
- [Enumerating very large runtime data can hurt the editor] → bound recursion depth, collection samples, and total paths.
- [Normalising legacy `px` metadata can surprise consumers] → geometry was already rendered in mm; document this compatibility correction in the release notes.
