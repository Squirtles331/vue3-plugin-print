## Why

The designer can create templates, but its current output path can silently print unresolved values, ignore configured paper margins, and paginate contrary to the visible repeat setting. Business users also cannot discover runtime fields from the data they supply, making correct first-time setup unnecessarily difficult.

## What Changes

- Make browser output honour template paper geometry and printable margins, while retaining a clear device-calibration warning.
- Add strict, configurable print preflight that blocks unresolved required content and failed printable assets by default.
- Make pagination honour `repeatPerPage`, suppress empty trailing table fragments, and report incompatible multi-table layouts.
- Derive a selectable binding-field tree from runtime JSON and allow preview issues to focus the affected element.
- Remove the non-functional pixel unit choice and improve public TypeScript, readiness, and repository-failure feedback.

## Capabilities

### New Capabilities

- `print-output-integrity`: Deterministic paper, preflight, resource-readiness, and pagination behaviour for browser printing.
- `runtime-binding-workflow`: Discoverable runtime fields and actionable binding validation for template authors.
- `host-integration-safety`: Clear readiness, types, units, and persistence failures for host applications.

### Modified Capabilities

- None; the repository has no baseline OpenSpec capability specifications.

## Impact

The change affects the runtime renderer and print iframe, preview and editor stores/panels, public type declarations, local/REST repositories, documentation, and regression tests. It introduces opt-out configuration for intentionally incomplete prints but no new runtime dependency.
