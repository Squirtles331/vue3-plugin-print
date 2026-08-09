## ADDED Requirements

### Requirement: Independently authored starter catalog
The system SHALL provide a first-party starter-template catalog containing at least one independently authored template for each supported initial category: sales document, delivery or packing document, product label sheet, and blank custom page. Catalog definitions MUST use this product's own IDs, names, text, geometry, colours, and asset-free thumbnails, and MUST NOT include upstream source, template payloads, branding, copied text, or copied visual assets.

#### Scenario: Browse starter categories
- **WHEN** a user opens the new-template flow
- **THEN** the system displays the available catalog categories and independently authored starter templates without requiring a saved template to exist

#### Scenario: Audit catalog provenance
- **WHEN** a release audit scans catalog definitions and their fixtures
- **THEN** each catalog item has an independent-design record and no prohibited upstream identifier, brand asset, or copied template payload is present

### Requirement: Preview and instantiate a starter template
The system SHALL allow a user to inspect a starter template's metadata and preview before creating a document from it. Instantiation MUST create a new editable `TemplateDocument v1` with fresh document, page, and element IDs and MUST NOT persist it until the user explicitly saves it.

#### Scenario: Create from a starter template
- **WHEN** a user confirms a starter-template selection
- **THEN** the editor opens a new dirty document whose content matches the selected definition and whose IDs are distinct from the catalog definition and every prior instantiation

#### Scenario: Cancel starter-template selection
- **WHEN** a user exits the starter-template flow without confirmation
- **THEN** the active document and saved-template repository remain unchanged

### Requirement: Catalog definitions remain isolated from user edits
The system SHALL treat catalog definitions as immutable factories. Changes to an instantiated document or its later saved record MUST NOT alter the starter definition or another instantiated document.

#### Scenario: Edit an instantiated document
- **WHEN** a user changes text or properties in a document created from a starter
- **THEN** a second instantiation of the same starter retains its original catalog values

