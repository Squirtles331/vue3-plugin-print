## 1. Print-output integrity

- [x] 1.1 Add print-policy normalization and strict preflight findings for incomplete bound content, machine codes, and printable safe-area violations.
- [x] 1.2 Emit authored paper size in the print iframe and wait for stylesheets, fonts, and valid image assets before opening the browser dialog.
- [x] 1.3 Implement fragment-aware pagination that honours `repeatPerPage` and suppresses empty table fragments.
- [x] 1.4 Ensure print-mode renderers never print authoring placeholders when incomplete output is explicitly allowed.

## 2. Binding authoring workflow

- [x] 2.1 Derive bounded binding paths from runtime JSON and synchronize them into the editor data panels.
- [x] 2.2 Bind a discovered path to one selected compatible element through an undoable command.
- [x] 2.3 Add preview actions that focus the element associated with a preflight finding.

## 3. Host integration safety

- [x] 3.1 Standardize geometry metadata and controls on millimetres, including legacy-template normalization.
- [x] 3.2 Add structured public template and print-policy types plus promise-based component readiness.
- [x] 3.3 Surface unavailable or corrupt local storage and descriptive REST repository failures.

## 4. Documentation and verification

- [x] 4.1 Update runtime, API, quick-start, and browser-acceptance documentation for the new policy and printer calibration contract.
- [x] 4.2 Add regression tests for strict/opt-out preflight, paper CSS/resource failures, pagination, data binding workflow, units, readiness, and storage errors.
- [x] 4.3 Run lint, test, package verification, and update this task checklist with the verified results.
