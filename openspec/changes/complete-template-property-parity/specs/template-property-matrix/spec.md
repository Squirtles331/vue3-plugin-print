## ADDED Requirements

### Requirement: Canonical page and common element property matrix
The system SHALL define canonical defaults, validation, storage location, editor-preview effect, runtime-preview effect, and print effect for every supported page and common element property.

#### Scenario: Existing document receives additive defaults
- **WHEN** a v1 document omits a newly supported optional property
- **THEN** normalization supplies its canonical default without changing the document's identity or supported authored values

#### Scenario: Invalid property blocks output
- **WHEN** a supported property violates its type, range, enum, or cross-field rule
- **THEN** save, import, preview, and print report a field-level validation error and do not produce a successful output

### Requirement: Safe migration and serialization
The system SHALL preserve unknown non-executable properties, serialize known properties canonically, and strip executable legacy fields with a migration warning.

#### Scenario: Legacy table script is loaded
- **WHEN** an imported document contains a legacy executable table field
- **THEN** normalization removes that field, reports a migration warning, and never executes it

### Requirement: Explicit editor-only hints
The system SHALL store supported authoring hints separately from output properties and the runtime SHALL ignore them.

#### Scenario: Table design row hint is set
- **WHEN** an author changes the table design-row hint
- **THEN** the editor preview changes its placeholder presentation while runtime preview and browser print use resolved runtime rows only
