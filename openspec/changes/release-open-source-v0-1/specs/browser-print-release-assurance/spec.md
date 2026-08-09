## ADDED Requirements

### Requirement: Print output remains isolated from editor controls
The browser-print renderer SHALL mount the normalized runtime document in an isolated iframe and SHALL not include editor selection frames, guides, panels, or controls in that iframe output.

#### Scenario: Programmatic print preparation
- **WHEN** a valid template is prepared for browser printing
- **THEN** the print iframe contains runtime output and contains no editor-only controls or selection UI

### Requirement: Supported-browser print acceptance is documented
The v0.1 documentation SHALL define latest desktop Chrome and Edge as supported browser targets and SHALL provide a manual validation checklist for template persistence, bindings, pagination, barcode/QR code output, import/export, and native printing.

#### Scenario: Maintainer prepares a v0.1 release
- **WHEN** the maintainer follows the release documentation
- **THEN** they can execute the supported-browser validation checklist before tagging the release
