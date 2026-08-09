## ADDED Requirements

### Requirement: Save a selected element as a reusable preset
The system SHALL allow a user to save a selected supported element as a named local preset. A preset record MUST contain its own ID, name, element type, timestamps, and a normalized element blueprint without the original element ID, page ID, selection state, history state, or runtime data.

#### Scenario: Save an element preset
- **WHEN** a user selects an element and confirms a unique preset name
- **THEN** the preset appears in the preset library and the source element remains unchanged

#### Scenario: Reject invalid preset input
- **WHEN** a selected element or preset name fails validation
- **THEN** the system does not write a preset and displays a field-level error

### Requirement: Insert isolated preset copies
The system SHALL allow a user to insert a preset into the current editable page. Each insertion MUST receive a fresh element ID, page ID, position, and z-index while retaining the preset's normalized type, properties, and styles.

#### Scenario: Insert the same preset twice
- **WHEN** a user inserts one preset twice
- **THEN** two separately editable elements are created and editing either element does not change the preset or the other inserted element

### Requirement: Manage local preset records safely
The system SHALL list, rename, and delete local presets independently from templates. Storage failures MUST preserve the current editor document and surface a recoverable error.

#### Scenario: Delete a preset
- **WHEN** a user deletes a preset after confirmation
- **THEN** the preset is removed from the library while all documents and already inserted copies remain unchanged

