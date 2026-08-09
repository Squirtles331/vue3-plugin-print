## ADDED Requirements

### Requirement: Export normalized template documents
The system SHALL export a valid template as a JSON interchange envelope containing a stable format identifier, supported interchange version, export timestamp, and normalized `TemplateDocument v1`. The export MUST exclude editor interaction state, runtime preview data, history, selection, zoom, and local repository implementation details.

#### Scenario: Export a saved or unsaved valid document
- **WHEN** a user exports a valid document
- **THEN** the system downloads or returns a JSON envelope that can be imported by the same supported version and contains only normalized template data

#### Scenario: Reject invalid document export
- **WHEN** a document fails template validation
- **THEN** the system does not create an interchange file and presents the validation error

### Requirement: Validate before importing
The system SHALL parse only JSON interchange input, enforce supported format and schema versions, normalize documented legacy aliases, and validate size, page, element, numeric, and string limits before loading the imported document. Validation failures MUST identify the problematic field or format condition.

#### Scenario: Import valid interchange JSON
- **WHEN** a user selects a valid supported interchange file
- **THEN** the system loads the normalized document as an unsaved editable document and reports any non-blocking migration warnings

#### Scenario: Reject malformed or unsupported input
- **WHEN** a user selects malformed JSON, an unsupported format/version, or a document outside configured limits
- **THEN** the system preserves the active document and shows a clear import error without writing to the template repository

### Requirement: Imported documents are detached copies
The system SHALL assign a fresh document ID to an imported template unless the user explicitly chooses a future replace flow. The initial import flow MUST preserve imported element/page relationships while preventing accidental overwrites of an existing local template.

#### Scenario: Import a file matching an existing template ID
- **WHEN** a valid import contains an ID that already exists locally
- **THEN** the loaded document receives a distinct ID and no existing saved template is overwritten

