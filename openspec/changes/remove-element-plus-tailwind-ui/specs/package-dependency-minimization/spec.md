## ADDED Requirements

### Requirement: reduced runtime dependency contract
The published package SHALL not require `element-plus` or `@element-plus/icons-vue` as runtime or peer dependencies.

#### Scenario: consumer install
- **WHEN** a consumer installs the package in a clean project
- **THEN** the consumer SHALL only need the supported core runtime dependencies to use the editor

#### Scenario: package metadata
- **WHEN** the package metadata is inspected
- **THEN** the runtime dependency contract SHALL not list Element Plus packages

### Requirement: build and pack output exclude Element Plus
The library build and packaged artifact SHALL not externalize or reference Element Plus modules.

#### Scenario: packed consumer build
- **WHEN** the package is packed and consumed by a fresh application
- **THEN** the application build SHALL succeed without installing Element Plus packages

#### Scenario: library externals
- **WHEN** the library build is generated
- **THEN** the external list SHALL not include Element Plus or its icon package

### Requirement: release verification matches the new contract
Release verification SHALL enforce the reduced dependency contract and fail if Element Plus remains in metadata, build configuration, or consumer checks.

#### Scenario: verification run
- **WHEN** the release verification script runs
- **THEN** it SHALL validate the new self-contained UI contract instead of Element Plus installation

#### Scenario: stale dependency detection
- **WHEN** a stale Element Plus reference remains in the release path
- **THEN** verification SHALL fail before publish

### Requirement: shipped styles remain consumable
The published stylesheet SHALL be enough for the editor UI to render without requiring the consumer to configure Tailwind in the host project.

#### Scenario: host imports stylesheet
- **WHEN** a host application imports the package stylesheet
- **THEN** the editor UI SHALL render with its expected presentation

#### Scenario: no host build coupling
- **WHEN** the host application uses a different build stack
- **THEN** the package stylesheet SHALL still work without host-specific Tailwind setup
