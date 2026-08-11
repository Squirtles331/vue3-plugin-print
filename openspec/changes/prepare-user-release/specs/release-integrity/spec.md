## ADDED Requirements

### Requirement: Tagged releases use the declared package version
The publication workflow SHALL verify that a tag-triggered release name exactly equals `v` followed by the version in the checked-out root `package.json` before it publishes to npm.

#### Scenario: Matching release tag
- **WHEN** the workflow runs for tag `v0.2.0` and `package.json` declares version `0.2.0`
- **THEN** the release version guard succeeds and the publication step can run

#### Scenario: Mismatched release tag
- **WHEN** the workflow runs for a tag that differs from `v${package.json.version}`
- **THEN** the workflow fails before executing `npm publish` and reports both expected and received versions

### Requirement: Packed package public surface is smoke tested
Release verification SHALL install the generated npm tarball into an isolated consumer and validate the documented ESM, CommonJS, stylesheet, and TypeScript declaration entry points.

#### Scenario: Complete packed package
- **WHEN** all declared distribution files and public exports are included in the tarball
- **THEN** the isolated consumer check succeeds

#### Scenario: Missing or malformed public artifact
- **WHEN** a declared public entry point or declaration file is absent or cannot be loaded from the tarball
- **THEN** release verification fails with a diagnostic naming the missing artifact
