# Non-reactive palette icons

## ADDED Requirements

### Requirement: Palette icon definitions remain raw

The editor SHALL expose insertion palette icon component definitions without Vue reactive proxies.

#### Scenario: A palette entry is consumed by a reactive UI list

- **WHEN** the insert panel renders a palette entry from a reactive collection
- **THEN** the entry icon remains non-reactive
- **AND** the panel retains the current label and element type.

### Requirement: No behavioural regression

The repair SHALL NOT change the available element types, insertion actions, or visual icon selection.

#### Scenario: The insert panel is rendered after the repair

- **WHEN** a user opens the insert panel
- **THEN** it presents the same element types and icons as before
- **AND** drag and click insertion actions receive the same palette item metadata.
