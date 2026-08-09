# Inspector field render safety

## ADDED Requirements

### Requirement: Field error rendering has a field scope

The property inspector SHALL render each field error within the corresponding field-loop scope.

#### Scenario: A structured section renders fields

- **WHEN** the inspector renders a property section
- **THEN** every field error is evaluated with that field definition
- **AND** an absent field definition does not crash the panel.

### Requirement: Error lookups tolerate absent fields

The field-error helpers SHALL return no error for an absent field definition.

#### Scenario: A schema changes during a reactive render

- **WHEN** an error lookup is requested without a field definition
- **THEN** it returns an empty error state
- **AND** it does not write an invalid key into the error store.
