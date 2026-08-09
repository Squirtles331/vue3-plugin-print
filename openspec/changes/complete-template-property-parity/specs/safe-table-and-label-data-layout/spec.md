## ADDED Requirements

### Requirement: Declarative table presentation
The system SHALL represent table columns, header/footer settings, row and cell metrics, pagination settings, and value formatters as validated declarative data.

#### Scenario: Formatted table column resolves
- **WHEN** a table column has an allowed formatter descriptor and its value path resolves from a runtime row
- **THEN** preview and browser print render the formatted value without evaluating arbitrary code

#### Scenario: Table repeats across pages
- **WHEN** resolved rows exceed the configured printable table capacity
- **THEN** pagination applies the persisted header and footer repeat settings consistently in preview and print

### Requirement: Explicit multi-label field mapping
The system SHALL allow a label grid to select primary, secondary, and tertiary values using explicit binding paths relative to each runtime record.

#### Scenario: Label mapping resolves a record
- **WHEN** the configured field paths exist in a runtime label record
- **THEN** the grid renders those values in the configured positions without guessing property names

#### Scenario: Label mapping is missing
- **WHEN** a configured field path does not exist
- **THEN** the affected label cell shows an explicit missing-value state and does not substitute sample data

### Requirement: Runtime data cannot alter static layout
The system SHALL resolve runtime data only for element content, table rows, and label records; it SHALL NOT allow runtime JSON to change static styles or layout.

#### Scenario: Runtime payload includes style-like fields
- **WHEN** runtime data contains keys that resemble element style or geometry properties
- **THEN** persisted template styles and geometry remain unchanged
