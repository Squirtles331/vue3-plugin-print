## ADDED Requirements

### Requirement: Clear open-source README entry point
The project README SHALL begin with an original project identity, a concise Chinese description of the standalone Vue 3 browser-printing application, and the project’s v0.1 browser support boundary.

#### Scenario: Visitor opens the repository landing page
- **WHEN** a visitor reads the opening of the README
- **THEN** the visitor can identify the application purpose and that v0.1 targets current desktop Chrome and Edge for browser-native printing

### Requirement: Discoverable release resources
The project README SHALL provide a visible navigation area linking to the existing demo, quick start, usage flow, browser-printing guidance, release limits, and contribution/security sections without claiming unsupported distribution or printing capabilities.

#### Scenario: Visitor evaluates the application
- **WHEN** a visitor uses the opening navigation links
- **THEN** each link directs to the matching existing README section or the configured project demo URL

### Requirement: Independent documentation presentation
The project README MUST use project-owned wording and links and MUST NOT embed third-party print-designer images, badges, branding, copied descriptions, or installation instructions.

#### Scenario: README source is reviewed
- **WHEN** the README changes are inspected
- **THEN** the opening presentation contains only this project’s identity, original descriptive text, and project-controlled links
