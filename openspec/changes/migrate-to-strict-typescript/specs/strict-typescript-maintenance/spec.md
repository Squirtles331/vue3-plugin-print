## ADDED Requirements

### Requirement: Strict repository type checking
The repository SHALL type-check all executable product source, Vue SFC scripts, tests, Node automation, and runtime configuration with strict TypeScript and strict Vue template checking. The checked codebase MUST not rely on JavaScript source files, implicit `any`, or TypeScript suppression directives.

#### Scenario: Type verification
- **WHEN** a contributor runs the type-check command
- **THEN** every covered source, test, script, and configuration file is checked successfully with the configured strict compiler options.

### Requirement: Typed external boundaries
The template designer SHALL treat JSON documents, browser storage values, network payloads, and DOM-derived data as untrusted values and MUST narrow them before use in typed domain logic.

#### Scenario: Invalid external value
- **WHEN** an external value does not match the expected runtime shape
- **THEN** the existing normalization or validation behavior handles it without relying on an unchecked TypeScript cast.

### Requirement: Source-derived package declarations
The package SHALL generate its published TypeScript declarations from the library source during the library build. The published declaration tree MUST describe the existing public plugin, component, template, repository, and runtime interfaces.

#### Scenario: TypeScript packed consumer
- **WHEN** a consumer installs the packed package and compiles an application importing the documented public API
- **THEN** TypeScript resolves the package declarations without errors while the existing ESM and CommonJS runtime entries remain available.

### Requirement: Type-safe release verification
The continuous-integration and release verification workflows SHALL run strict type checking before accepting a build or release artifact.

#### Scenario: Release verification
- **WHEN** the release verification command runs
- **THEN** it executes type checking together with the existing lint, test, build, package, and consumer checks.
