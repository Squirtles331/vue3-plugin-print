## ADDED Requirements

### Requirement: Saved templates can be deleted deliberately
The browser-local template repository SHALL provide an asynchronous `delete(id)` operation. The template library SHALL require explicit user confirmation before requesting deletion and SHALL refresh its list after a successful deletion without changing the currently open in-memory document.

#### Scenario: Delete a saved template
- **WHEN** a user confirms deletion of a template listed in the local library
- **THEN** that template is absent from subsequent library lists and the current editor document remains unchanged

#### Scenario: Delete a missing template
- **WHEN** the repository deletes an identifier that is not stored
- **THEN** it SHALL resolve without removing any other saved template

### Requirement: Browser-local template storage can be reset
The browser-local template repository SHALL provide an asynchronous `clear()` operation that clears only its configured template collection. The template library SHALL require explicit user confirmation before reset and SHALL refresh to an empty list afterwards.

#### Scenario: Reset saved templates
- **WHEN** a user confirms resetting the local template library
- **THEN** all templates in that configured collection are removed, other browser storage is preserved, and the current editor document remains unchanged
