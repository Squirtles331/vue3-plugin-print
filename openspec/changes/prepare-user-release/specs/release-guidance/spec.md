## ADDED Requirements

### Requirement: Release notes describe user-visible print changes
Each release candidate SHALL include a changelog entry that identifies user-visible print behavior changes and a migration path for callers affected by stricter validation.

#### Scenario: Consumer upgrades to v0.2.0
- **WHEN** a consumer reads the v0.2.0 changelog entry
- **THEN** the entry explains the strict preflight default, safe print margin behavior, data-binding assistance, and the `allowIncomplete` migration option

### Requirement: Release checklist separates automated and human gates
The repository SHALL provide a current release checklist that distinguishes automated verification from ownership, browser, printer, registry, and release-publication checks that a maintainer must complete.

#### Scenario: Maintainer prepares a release
- **WHEN** a maintainer follows the release checklist
- **THEN** the checklist directs them to run automated verification and to record remaining browser/printer and publication actions before creating a tag

### Requirement: Browser acceptance has clear success criteria
The browser-print acceptance guide SHALL state the supported test browsers, representative output cases, physical calibration requirement, and the condition for passing the manual gate.

#### Scenario: Browser or printer output deviates
- **WHEN** a manual acceptance case has incorrect paper geometry, missing assets, incorrect page repetition, or unreadable barcode/QR output
- **THEN** the guide directs the maintainer to treat the release as blocked and record the environment and reproduction data
