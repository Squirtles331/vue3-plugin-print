## ADDED Requirements

### Requirement: Canonical printable page properties
The system SHALL persist canonical page settings for paper preset, width, height, orientation, four margins, background colour, and page metadata. It MUST retain documented header/footer/corner guide settings as editor-facing metadata and MUST explicitly distinguish them from printable marks in the normalized contract.

#### Scenario: Configure a custom page
- **WHEN** a user changes page dimensions, margins, orientation, or background
- **THEN** the normalized document contains canonical page settings and preview and browser print use the printable settings consistently

#### Scenario: Load a legacy page alias
- **WHEN** a loaded or imported document uses a documented legacy page-property alias
- **THEN** the system maps it to the canonical property, reports a migration warning, and emits only the canonical property on the next save/export

### Requirement: Validate page geometry and printable area
The system SHALL validate paper dimensions, margin ranges, orientation consistency, and printable-area constraints before save, preview, browser print, or export. It MUST show the affected page setting when validation fails.

#### Scenario: Margins remove the printable area
- **WHEN** a user sets margins that leave no printable area
- **THEN** the system blocks output and identifies the invalid margins without discarding the user's entered values

### Requirement: Page property changes are isolated to the intended scope
The system SHALL make the scope of a page-property change explicit: document-default settings apply to all pages, while a future page override may apply only to the selected page. In this change, unsupported page overrides MUST NOT be silently serialized as document defaults.

#### Scenario: Change document-default page settings
- **WHEN** a user edits the supported page settings in the page panel
- **THEN** all pages and runtime output use the updated document-default settings

