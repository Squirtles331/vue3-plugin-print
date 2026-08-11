## ADDED Requirements

### Requirement: Runtime data produces discoverable binding paths
The system SHALL derive bounded, safe binding paths from the current runtime JSON and display them in the editor's data panels.

#### Scenario: Nested object and collection data
- **WHEN** runtime data includes `customer.name` and an `items` array with an object record
- **THEN** the data panel lists `customer.name`, `items`, and sampled indexed item paths

### Requirement: A path can bind the selected compatible element
The system SHALL allow an author to select a discovered path and bind it to one selected compatible element through an undoable editor action.

#### Scenario: Bind a selected text element
- **WHEN** the author selects one text element and chooses `customer.name`
- **THEN** the element's runtime binding becomes `customer.name` and undo restores its previous binding

### Requirement: Preflight findings are actionable
The system SHALL expose a focus action for a preflight finding that has an element identifier and SHALL select the affected element in the editor.

#### Scenario: Locate a missing table binding
- **WHEN** preview reports a missing table data binding
- **THEN** the author can focus the table element from that finding
