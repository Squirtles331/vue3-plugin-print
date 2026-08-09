## ADDED Requirements

### Requirement: Runtime preview presents Chinese-first controls
The runtime preview dialog SHALL display Chinese copy for its title, runtime JSON heading, JSON guidance, and browser-print action. The control bindings and print action MUST remain unchanged.

#### Scenario: User opens runtime preview
- **WHEN** a user opens the runtime preview dialog
- **THEN** its left-side title, JSON guidance, and print button SHALL be displayed in Chinese.

#### Scenario: User prints from runtime preview
- **WHEN** a user selects the Chinese browser-print action with valid runtime JSON
- **THEN** the dialog SHALL invoke the existing browser-print workflow.
