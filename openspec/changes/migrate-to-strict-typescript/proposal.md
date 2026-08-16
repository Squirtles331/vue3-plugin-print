## Why

The project is implemented primarily in JavaScript while its published declaration file is maintained separately. This allows internal and public contracts to drift, makes refactoring risky, and delays feedback for invalid data or component interactions.

Migrating the repository to strict TypeScript makes domain contracts explicit and verifies them continuously without changing the package's runtime behavior.

## What Changes

- Migrate application source, Vue SFC scripts, tests, Node automation scripts, and runtime configuration files from JavaScript to TypeScript.
- Add strict TypeScript and Vue template type checking, plus TypeScript-aware linting and execution support for Node automation.
- Define reusable template-designer domain types and validate untrusted JSON, storage, network, and DOM inputs at typed boundaries.
- Generate the published declaration files from the library source instead of copying a hand-maintained declaration file.
- Add type checking and a packed TypeScript-consumer check to the verification workflow.

## Capabilities

### New Capabilities

- `strict-typescript-maintenance`: The repository provides strict, source-derived TypeScript contracts and verifies them across development, release, and packed-consumer workflows.

### Modified Capabilities

- None.

## Impact

- Affects all executable source, tests, build tooling, lint configuration, and npm scripts.
- Adds TypeScript-related development dependencies and generated declaration files to the package artifact.
- Preserves the existing ESM/CJS exports, public runtime API, JavaScript consumption, and TemplateDocument v2 format.
