## ADDED Requirements

### Requirement: New design elements initialize without demo business data
The system SHALL create new design elements with structural defaults only and MUST NOT inject demo business content, generated sample records, example machine-readable payloads, or default binding variables into the saved element model.

#### Scenario: Creating a new text element
- **WHEN** a user inserts a new text element onto the canvas
- **THEN** the element is created with editable size and style defaults
- **AND** the element does not store demo body text as authored content

#### Scenario: Creating a new table element
- **WHEN** a user inserts a new table element onto the canvas
- **THEN** the element may include structural column definitions and design row metadata
- **AND** the element does not store generated `sampleData`, computed footer totals, or fake business rows by default

#### Scenario: Creating a new machine-readable element
- **WHEN** a user inserts a new barcode or QR code element
- **THEN** the element is created without a fake encoded payload in its stored content
- **AND** any later preview cue is derived by presentation logic rather than persisted model data

### Requirement: Unbound canvas preview uses explicit empty-state feedback
The canvas SHALL show unbound elements with empty-state or binding-placeholder feedback that communicates missing data without resembling real runtime content.

#### Scenario: Previewing an unbound text or image element
- **WHEN** a text or image element has no authored content and no resolved binding
- **THEN** the canvas shows an explicit empty or unbound hint
- **AND** the hint does not look like real document data

#### Scenario: Previewing an element with a binding variable but no runtime data
- **WHEN** an element is configured with a binding variable and no runtime data is present
- **THEN** the canvas shows a structural binding placeholder such as the configured token
- **AND** the placeholder is not written back into the element model as real content

### Requirement: Structured elements remain editable without synthetic records
The system SHALL preserve visible editing structure for unbound tables and multi-label layouts while keeping their business data collections empty by default.

#### Scenario: Previewing an empty table
- **WHEN** a table has columns configured but no bound or sample rows
- **THEN** the canvas renders empty design rows based on table design metadata
- **AND** the preview does not invent business row values or summary totals

#### Scenario: Previewing an empty multi-label layout
- **WHEN** a multi-label element has grid dimensions configured and no bound or sample label items
- **THEN** the canvas renders the label grid structure
- **AND** the cells do not display sample item data such as generated names or “示例数据”

### Requirement: Existing explicit template data is preserved
The system SHALL preserve explicit authored content and explicit sample data already stored in existing templates unless a separate migration or cleanup action is requested.

#### Scenario: Opening an existing template with explicit sample rows
- **WHEN** a previously saved template includes explicit table `sampleData` or label sample items
- **THEN** the template continues to load with those stored values intact
- **AND** the initialization cleanup rules apply only to newly created elements and preview fallbacks
