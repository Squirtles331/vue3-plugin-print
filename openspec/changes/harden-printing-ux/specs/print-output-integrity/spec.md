## ADDED Requirements

### Requirement: Browser output uses authored sheet geometry
The system SHALL render browser output with the template's global paper width and height through print CSS and SHALL preserve the runtime page's full-sheet coordinate system.

#### Scenario: Print an A4 template
- **WHEN** a template with a 210 mm by 297 mm paper setting is printed
- **THEN** the print iframe contains an `@page` rule with that size and zero CSS page margin

### Requirement: Printable safe area is enforced
The system SHALL treat the template margins as a printable safe area and SHALL report printable elements extending outside it during strict preflight.

#### Scenario: Element crosses a configured margin
- **WHEN** a printable element extends beyond a non-zero margin boundary
- **THEN** strict preflight prevents printing and identifies that element

### Requirement: Strict preflight prevents incomplete output by default
The system SHALL block printing by default when a printable bound value, table/label collection, required machine-readable value, or printable asset is unavailable. Hosts SHALL be able to opt in to incomplete output through a print policy.

#### Scenario: Missing bound order number
- **WHEN** a printable text element binds to `order.number` and runtime data has no such value
- **THEN** default preflight prevents printing and reports the binding and element

#### Scenario: Host explicitly allows incomplete output
- **WHEN** the host sets `allowIncomplete` to true
- **THEN** unresolved-content findings are warnings and the print action remains available

### Requirement: Print resources are ready before the native dialog
The system SHALL wait for runtime machine codes, copied stylesheets, fonts, and images before opening the browser print dialog, and SHALL fail the action if an image cannot load or a configured timeout elapses.

#### Scenario: Image request fails
- **WHEN** a printable runtime image emits an error
- **THEN** the print action rejects with an asset error and cleans up the iframe

### Requirement: Pagination honours repeated-page intent
The system SHALL render all source-page elements on the first table fragment and SHALL render only the table fragment plus elements marked `repeatPerPage` on generated fragments. It SHALL omit tables without rows for that fragment.

#### Scenario: Long table with a non-repeating note
- **WHEN** a paginated table produces a second page and a text note has `repeatPerPage` set to false
- **THEN** the note appears only on the first page

#### Scenario: Short second table on a long-table page
- **WHEN** one paginated table has fewer fragments than another table on the same source page
- **THEN** the shorter table is omitted rather than rendered as an empty placeholder on later fragments
