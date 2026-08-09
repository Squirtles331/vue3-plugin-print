## ADDED Requirements

### Requirement: Runtime data binding SHALL resolve business data before element rendering
The system SHALL construct a runtime data context that resolves variables, input records, computed values, and pagination state before element renderers consume them.

#### Scenario: Resolve a bound text value
- **WHEN** a text element references a runtime variable
- **THEN** the renderer MUST use the resolved runtime value instead of design-time placeholder content

#### Scenario: Resolve table rows from runtime data
- **WHEN** a table element references a runtime dataset
- **THEN** the renderer MUST build table rows from the runtime dataset instead of mock sample rows

### Requirement: The runtime SHALL support binding for supported printable element types
The system SHALL support runtime binding for text, image, table, page number, barcode, QR code, and multi-label elements using the normalized template contract.

#### Scenario: Resolve image source at runtime
- **WHEN** an image element is bound to runtime data
- **THEN** the renderer MUST use the resolved image source for output

#### Scenario: Resolve repeated labels from runtime data
- **WHEN** a multi-label element is bound to a runtime collection
- **THEN** the renderer MUST generate label cells from the resolved collection according to the configured rows, columns, and order

### Requirement: Data transformation logic SHALL be constrained and observable
The system MUST treat custom transformation logic as a constrained runtime stage with explicit inputs, explicit outputs, validation, and error reporting.

#### Scenario: Report a transformation failure
- **WHEN** a configured transformation step fails to produce valid output
- **THEN** the system MUST surface a runtime error for that template render instead of silently falling back to unrelated mock data

#### Scenario: Accept valid transformed table output
- **WHEN** a transformation step returns valid table data and footer data
- **THEN** the runtime MUST use the transformed result for pagination and rendering
