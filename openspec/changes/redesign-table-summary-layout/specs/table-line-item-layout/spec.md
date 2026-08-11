## ADDED Requirements

### Requirement: Default dragged table uses a line-item preset
The system SHALL default a newly confirmed sample-data table insertion to a five-column line-item grid with ID, name, quantity, unit price, and total columns. The preset SHALL include representative line-item rows and three footer rows for page subtotal, grand total, and uppercase total amount.

#### Scenario: Insert the default sample table
- **WHEN** a user drops a table onto the canvas and confirms the dialog without changing its defaults
- **THEN** the canvas SHALL show the five line-item columns, populated sample rows, and the three-row totals area

#### Scenario: Insert a custom empty table
- **WHEN** a user selects custom mode while creating a table
- **THEN** the system SHALL retain the selected column and row count without injecting line-item sample or totals rows

### Requirement: Table summary tokens are consistent across renderers
The system SHALL calculate the built-in table summary tokens from the active table rows and SHALL render their resolved values in the designer, runtime preview, and print document.

#### Scenario: Render a bound line-item table
- **WHEN** a table is bound to rows containing `qty` and `total` fields and its footer contains summary tokens
- **THEN** each renderer SHALL display the same quantity totals, amount totals, and uppercase amount text

### Requirement: Runtime tables do not reserve an empty wrapper area
The system SHALL render runtime table height from its table content rather than from the generic element wrapper's fixed height. Preview-only empty-state content SHALL occupy a single compact table row.

#### Scenario: Preview a table without rows
- **WHEN** runtime preview renders a table with no resolved rows
- **THEN** it SHALL show a compact no-data row without an additional empty bordered rectangle beneath the table

#### Scenario: Print a table with rows
- **WHEN** browser printing renders a table with resolved rows
- **THEN** the table SHALL include its header, rows, and configured footer without a redundant outer border
