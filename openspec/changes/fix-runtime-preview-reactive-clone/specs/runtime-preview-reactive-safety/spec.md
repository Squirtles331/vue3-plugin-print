## ADDED Requirements

### Requirement: Runtime preview accepts reactive template snapshots
The system SHALL render runtime preview from a valid `TemplateDocument v1` whether the caller supplies a plain object or a Vue reactive proxy. Runtime resolution MUST create its own document copy and MUST NOT mutate the caller's template.

#### Scenario: Editor opens preview from a serialized template
- **WHEN** a user selects Preview for a valid editor template
- **THEN** the runtime document SHALL render without a `DataCloneError` or Vue render error.

#### Scenario: Integration passes a Vue reactive template to the resolver
- **WHEN** `resolveRuntimeTemplate` receives a reactive `TemplateDocument v1`
- **THEN** it SHALL resolve bindings and return a separate runtime document without throwing.

#### Scenario: Runtime resolution adds ephemeral values
- **WHEN** a runtime template is resolved from either supported input form
- **THEN** runtime-only values SHALL exist only in the returned document and not in the caller's template.
