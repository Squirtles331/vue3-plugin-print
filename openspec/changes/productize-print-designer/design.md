## Context

### First-release scope amendment

This implementation delivers the template contract, runtime preview, and browser print. PDF export, silent printing, and cloud delivery are deferred by the approved commercial first-release plan. Future output targets must consume the same normalized runtime contract.

The repository already contains a strong editing shell: page settings, drag-and-resize interactions, inspector schemas, template serialization, and several printable element types. The current gap is not the editor chrome itself, but the absence of a production runtime around it.

Today, the system can assemble a template-shaped document model, but key product flows remain placeholders:

- save/open does not persist templates
- preview does not render a production document
- print and PDF export do not execute a real output pipeline
- variables and pages still rely heavily on mock or design-time fallback data
- advanced table scripting has no clearly defined runtime safety boundary

This change needs design coverage because it crosses multiple modules and introduces new contracts that later implementation will depend on.

## Goals / Non-Goals

**Goals:**

- Establish a stable template contract with schema versioning and validation hooks.
- Separate design-time editor concerns from runtime print rendering concerns.
- Define one rendering pipeline that can drive preview, print, and PDF export consistently.
- Define how runtime data is resolved for text, images, tables, page numbers, barcodes, QR codes, and multi-label layouts.
- Define a safe path for custom table transformations without allowing uncontrolled arbitrary execution.
- Break implementation into staged tasks that can be shipped incrementally.

**Non-Goals:**

- Deliver collaboration, multi-user editing, or workflow approvals in this change.
- Introduce a full backend service implementation in the spec itself.
- Solve every future reporting use case; this change focuses on making the current designer usable for real print-template scenarios.
- Replace the current editor interaction model unless required for runtime parity or schema stability.

## Decisions

### 1. Separate the product into three layers

The system will be treated as three explicit layers:

1. `editor layer`: interactive design-time state and tooling
2. `template contract layer`: normalized, versioned template document
3. `runtime layer`: preview, print, PDF, and data resolution

This avoids mixing design-only convenience logic with production output logic. It also lets the runtime be tested independently from pointer-based editor interactions.

Alternative considered:
- Keep extending the current canvas component to serve both editing and output. Rejected because the current component contains design-time placeholders, fallback values, selection chrome, and editing affordances that are not safe to treat as runtime truth.

### 2. Add explicit schema versioning and validation

The template payload will include a schema version and a validation result surface. Saving must normalize the document into a stable runtime payload rather than persisting ad hoc editor internals.

This decision protects future compatibility and gives the team a clear place to implement migrations when template structure evolves.

Alternative considered:
- Persist the current computed template model as-is. Rejected because it lacks an explicit compatibility story and makes migration behavior implicit.

### 3. Use one rendering contract for preview, print, and PDF

Preview, browser print, and PDF export must be different output targets of the same runtime rendering contract, not three separate interpretations of the template.

This ensures pagination, visibility rules, data binding, and machine-readable element output stay aligned. It also reduces the risk that preview looks correct while PDF or print diverges.

Alternative considered:
- Implement preview first using existing canvas logic and defer print/PDF parity. Rejected because it would create product debt immediately and make later parity harder to recover.

### 4. Resolve all business data before element rendering

The runtime will first build a resolved render context:

- template metadata
- page settings
- global variables
- runtime input data
- computed table datasets
- pagination state

Elements will render from this resolved context rather than fetching or interpreting raw business data independently. This makes rendering deterministic and easier to test.

Alternative considered:
- Let each element type directly interpret incoming data. Rejected because table, page numbering, and multi-label pagination would diverge quickly and become difficult to validate.

### 5. Treat custom transformation scripts as a constrained extension point

The existing table custom script feature will not be treated as unrestricted arbitrary code execution. This change defines it as a constrained transformation stage with:

- explicit input/output shape
- validation and error reporting
- a restricted execution strategy or future sandbox boundary

Implementation may start with a narrowed feature set if a safe sandbox is not yet ready. Productization requires safety and observability ahead of feature breadth.

Alternative considered:
- Execute arbitrary script content directly in the main runtime. Rejected because it creates security, stability, and debugging risks that are unacceptable for real usage.

### 6. Ship in vertical slices

Implementation should ship in slices:

1. template contract + persistence adapter
2. runtime preview parity
3. print/PDF parity
4. runtime data binding
5. hardening and test coverage

This preserves momentum while still converging on a production architecture.

## Risks / Trade-offs

- [Runtime parity is harder than editor polish] -> Build a dedicated runtime renderer and add snapshot-style tests for preview, print, and PDF outputs.
- [Schema changes can break stored templates] -> Add schema versioning, migration hooks, and validation before save/load.
- [Custom scripting can become a security hole] -> Constrain inputs/outputs and gate execution behind a safe strategy with clear fallback behavior.
- [Real barcode/QR output may differ from preview expectations] -> Replace preview-only generators with production libraries and add verification scenarios for scannability.
- [Large templates may create performance regressions] -> Separate editor-only state from runtime payloads and measure rendering/pagination costs on representative documents.
- [Broad scope can delay usable delivery] -> Implement by capability slices and define done criteria for each stage in tasks.

## Migration Plan

1. Introduce the normalized template schema and schema version field.
2. Add a persistence adapter interface so save/load can initially target local or mock storage without blocking future API integration.
3. Build the runtime renderer beside the editor rather than inside existing interaction-heavy canvas logic.
4. Route preview through the runtime renderer first and verify parity with template snapshots.
5. Add browser print and PDF export on top of the same runtime pipeline.
6. Move variables, tables, and labels from mock/fallback data to resolved runtime binding.
7. Add validation, error states, metrics/logging hooks, and test coverage before declaring the feature production-ready.

Rollback strategy:

- Keep the current editor available while runtime features land incrementally.
- Guard new persistence/runtime flows behind feature flags or adapter boundaries so the team can temporarily fall back to editor-only mode if needed.

## Open Questions

- What is the first real business template to use as the acceptance benchmark: invoice, shipping note, product label, or another document?
- Should published templates support draft/published states immediately, or is version metadata without publishing enough for the first release?
- Will PDF generation run fully in-browser, or should the architecture leave room for a server-side renderer later?
- What level of custom transformation scripting is truly required in v1, and can some of it be replaced by structured configuration?
