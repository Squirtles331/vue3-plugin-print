## ADDED Requirements

### Requirement: Templates SHALL be persisted as normalized versioned documents
The system SHALL save print templates as normalized documents with an explicit schema version, stable page definitions, stable element definitions, and metadata required to load the template back into the editor and runtime.

#### Scenario: Save a template document
- **WHEN** a user saves a template
- **THEN** the persisted payload MUST include a schema version and normalized template structure

#### Scenario: Load a saved template
- **WHEN** a user opens an existing template
- **THEN** the system MUST reconstruct the editor state from the persisted template document without requiring mock defaults

### Requirement: Template lifecycle actions SHALL be real product flows
The system SHALL provide real create, open, save, and validation-aware save status flows instead of placeholder interactions.

#### Scenario: Create a new template
- **WHEN** a user creates a new template
- **THEN** the system MUST initialize a valid template document and mark it as unsaved until persisted

#### Scenario: Save status reflects document state
- **WHEN** a user changes template content after the last successful save
- **THEN** the system MUST show the template as having unsaved changes

### Requirement: Templates SHALL expose validation state before runtime use
The system SHALL validate required template fields and structural integrity before allowing preview, print, or export flows to continue as successful operations.

#### Scenario: Block invalid template output
- **WHEN** a template is missing required structural data for runtime rendering
- **THEN** the system MUST report validation errors and MUST NOT report preview, print, or export as successful
