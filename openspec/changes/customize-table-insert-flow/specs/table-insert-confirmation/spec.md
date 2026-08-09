## ADDED Requirements

### Requirement: Table insertion SHALL require explicit confirmation
The system SHALL show a table creation confirmation dialog when a table element is dropped onto the canvas, and it SHALL defer table creation until the user confirms the dialog.

#### Scenario: Confirm table creation after drop
- **WHEN** a user drops a table element onto a valid page area
- **THEN** the system MUST open a table creation dialog instead of inserting the table immediately

#### Scenario: Insert table after confirmation
- **WHEN** the user confirms the table creation dialog
- **THEN** the system MUST insert exactly one table object at the dropped location using the selected configuration

#### Scenario: Cancel table creation
- **WHEN** the user cancels the table creation dialog
- **THEN** the system MUST discard the pending insert and MUST NOT add a table object to the document

### Requirement: Table creation SHALL support multiple insert strategies
The system SHALL allow the user to create either a sample-data table or a custom empty table from the insert dialog.

#### Scenario: Create sample-data table
- **WHEN** the user selects the sample-data option and confirms
- **THEN** the inserted table MUST include the configured demonstration data strategy for design-time preview

#### Scenario: Create custom empty table
- **WHEN** the user selects the custom table option and confirms
- **THEN** the inserted table MUST use the configured row and column counts without injecting unrelated fake sample rows
