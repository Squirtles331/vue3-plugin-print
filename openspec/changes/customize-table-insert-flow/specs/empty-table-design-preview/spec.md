## ADDED Requirements

### Requirement: Empty custom tables SHALL be represented without fake runtime rows
The system SHALL represent custom empty tables with explicit design-time structure metadata rather than by storing unrelated fake sample rows as table data.

#### Scenario: Store empty table structure
- **WHEN** a custom empty table is created
- **THEN** the system MUST persist the selected column structure and design-time row count separately from runtime sample data

### Requirement: Canvas rendering SHALL show empty table structure when no data exists
The system SHALL render an empty table grid when a table has no sample data and no resolved runtime data, using the design-time row count and configured columns.

#### Scenario: Render empty custom table
- **WHEN** a custom table has no sample rows and no bound data
- **THEN** the canvas MUST render the configured number of empty rows and configured columns

#### Scenario: Render data-bound placeholder rows
- **WHEN** a table has configured data bindings but no resolved runtime data
- **THEN** the canvas MUST render binding placeholders instead of fake product rows

### Requirement: Canvas rendering SHALL not fall back to unrelated fake sample rows
The system MUST NOT render hard-coded fake product rows as the default visual fallback for empty tables.

#### Scenario: No fake product fallback
- **WHEN** a table has no sample data and no bound runtime rows
- **THEN** the canvas MUST avoid rendering unrelated built-in product example rows
