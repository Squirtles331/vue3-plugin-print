## ADDED Requirements

### Requirement: Canonical common element properties
The system SHALL provide type-aware editing and validation for each supported element's name, position, size, rotation, visibility, lock state, print state, z-index, opacity, background, border, and applicable typography/alignment settings. All accepted values MUST be normalized into `TemplateDocument v1` and must not retain inspector-only control state.

#### Scenario: Edit common properties
- **WHEN** a user changes supported common properties for a selected unlocked element
- **THEN** the editor updates the element, marks the document dirty, and serializes the canonical values for preview and browser print

#### Scenario: Attempt to edit a locked element
- **WHEN** a user invokes a property mutation for a locked element
- **THEN** the system preserves the element value and communicates that the element is locked

### Requirement: Complete element-specific property controls
The system SHALL expose validated property groups for all currently supported element types: text; image; table; barcode; QR code; page number; line; rectangle; circle; and multi-label. Controls MUST only be shown when they apply to the selected type and MUST have a documented runtime effect or be rejected as unsupported.

#### Scenario: Configure a type-specific property
- **WHEN** a user changes a valid type-specific property such as image fit, barcode format, QR correction level, table column configuration, page-number format, or multi-label grid layout
- **THEN** the property is normalized, persisted, and reflected by the runtime renderer

#### Scenario: Enter an invalid type-specific property
- **WHEN** a user provides an invalid enum, range, image source, table column definition, or binding path
- **THEN** the system shows a clear validation error and does not send an invalid value to preview or browser print

### Requirement: Structured properties use safe dedicated editors
The system SHALL provide structured editors for image source, table columns/headers/footers/pagination, and multi-label grid/binding data. The editors MUST validate before committing, preserve valid in-progress user data on failure, and not execute arbitrary source code.

#### Scenario: Edit a table column definition
- **WHEN** a user adds, removes, reorders, or changes a valid table column
- **THEN** the table configuration remains structurally valid and runtime table rendering uses the resulting column order and bindings

#### Scenario: Use unsupported custom transformation code
- **WHEN** a user provides arbitrary transformation code in a property editor
- **THEN** the system marks it unsupported or invalid and does not execute it in the editor, preview, or print runtime

### Requirement: Binding values have explicit resolution feedback
The system SHALL validate binding paths for data-aware elements and display an unresolved-value state without substituting design-time business data. Runtime data remains the only source used to resolve text, image, barcode, QR, table, and multi-label values.

#### Scenario: Preview with a missing binding value
- **WHEN** a configured binding path is absent from runtime data
- **THEN** the preview displays the defined unresolved state and identifies the binding path without injecting sample business data

