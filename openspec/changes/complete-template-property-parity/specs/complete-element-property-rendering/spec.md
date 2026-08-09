## ADDED Requirements

### Requirement: Complete static property rendering for existing element types
The system SHALL provide validated inspector controls and matching editor/runtime rendering for all supported static properties of text, image, barcode, QR code, page number, line, rectangle, circle, table, and multi-label elements.

#### Scenario: Static style is authored
- **WHEN** an author changes a supported static property
- **THEN** the editor preview, standalone runtime preview, and browser print use the same persisted value

#### Scenario: Locked element is edited
- **WHEN** an author attempts to edit a locked element other than unlocking it
- **THEN** the mutation is rejected and the field reports that the element is locked

### Requirement: Text, image, and machine-code options are explicit
The system SHALL support the documented typography, image fit/position, barcode text/margin/colour, QR margin/colour, and page-number format options without dynamic style bindings.

#### Scenario: Machine-code colours and margins are configured
- **WHEN** an author configures valid machine-code presentation options
- **THEN** runtime preview and browser print pass those values to the local barcode or QR renderer

#### Scenario: Machine-code input is invalid
- **WHEN** a selected code format cannot encode its resolved value
- **THEN** the runtime displays an explicit error state instead of a substituted example value

### Requirement: Shape and line geometry is deterministic
The system SHALL use persisted geometry, rotation, border, fill, line style, and circle aspect constraints identically in editor preview and output rendering.

#### Scenario: Circle is resized
- **WHEN** an author resizes a circle with aspect lock enabled
- **THEN** its persisted width and height remain equal and the runtime renders a circle
