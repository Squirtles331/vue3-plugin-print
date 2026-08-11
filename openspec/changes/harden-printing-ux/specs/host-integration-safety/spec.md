## ADDED Requirements

### Requirement: Editor geometry uses one declared unit
The system SHALL use millimetres for persisted and displayed template geometry and SHALL not offer a pixel unit selection that does not convert values.

#### Scenario: Open a legacy template marked as pixels
- **WHEN** a legacy template with `meta.unit` set to `px` is loaded
- **THEN** its geometry is treated as millimetres and the emitted canonical document declares `mm`

### Requirement: Host applications can await editor readiness
The public component instance SHALL expose a promise-based readiness method that resolves with the mounted editor instance.

#### Scenario: Call readiness during component setup
- **WHEN** a host obtains the component ref before its mounted event
- **THEN** awaiting `whenReady()` resolves after the editor can accept exposed methods

### Requirement: Public types describe supported integration options
The package declarations SHALL expose structured template, page, element, print-policy, repository, and component-instance types.

#### Scenario: Type a print policy
- **WHEN** a TypeScript host passes a print policy to the component
- **THEN** the compiler recognises `allowIncomplete` and rejects unsupported properties

### Requirement: Repository read failures are observable
The default repository SHALL surface unavailable or corrupt browser storage as errors instead of silently presenting it as an empty template library.

#### Scenario: Corrupt local template JSON
- **WHEN** the local template collection cannot be parsed
- **THEN** listing templates rejects with a descriptive storage error that reaches the component error event
