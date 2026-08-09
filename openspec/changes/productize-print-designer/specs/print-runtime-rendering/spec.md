## ADDED Requirements

### Requirement: Preview, print, and PDF SHALL use one runtime rendering contract
The system SHALL render templates for preview, browser print, and PDF export from the same runtime template interpretation so page layout, visibility, and pagination rules remain consistent across outputs.

#### Scenario: Preview and print parity
- **WHEN** a template is rendered in preview and then rendered for print
- **THEN** the same pages, elements, and pagination results MUST be produced except for output-target specific container styling

#### Scenario: Preview and PDF parity
- **WHEN** a template is exported to PDF
- **THEN** the PDF output MUST reflect the same runtime layout decisions used in preview

### Requirement: Runtime output SHALL use printable element renderers
The system SHALL render barcodes, QR codes, tables, page numbers, and other printable elements using runtime renderers suitable for actual output rather than design-only placeholder shapes.

#### Scenario: Render a machine-readable barcode
- **WHEN** a template contains a barcode element with runtime data
- **THEN** the runtime MUST generate a barcode output based on the configured format and value

#### Scenario: Render a machine-readable QR code
- **WHEN** a template contains a QR code element with runtime data
- **THEN** the runtime MUST generate a QR code output based on the configured value and error-correction settings

### Requirement: Runtime pagination SHALL be deterministic
The system SHALL paginate runtime content deterministically for multi-page tables, repeated labels, and page numbering.

#### Scenario: Paginate a multi-page table
- **WHEN** table data exceeds the available space of one page
- **THEN** the runtime MUST paginate rows according to the template rules and preserve header/footer behavior configured for that table

#### Scenario: Number paginated pages
- **WHEN** a document spans multiple runtime pages
- **THEN** page number elements MUST reflect the actual runtime page sequence and total page count
