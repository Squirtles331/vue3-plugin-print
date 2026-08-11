## Why

The plugin has completed its printing-UX hardening work, but the release path still allows a Git tag and the package version to diverge and its maintainer guidance describes only the old v0.1 release. A user-facing release needs a repeatable, versioned handoff so that consumers can install the exact package that release notes and support instructions describe.

## What Changes

- Add a release guard that rejects publishing when the Git tag, `package.json` version, and npm package contents are inconsistent.
- Prepare a v0.2.0 release record with clear upgrade notes for strict print preflight, print-safe margins, data binding, and browser verification.
- Replace the stale release checklist and validation record with a release-ready checklist that separates automated evidence from maintainer-only browser, ownership, and publication checks.
- Add a smoke test for a packed package's documented public entry points and exported TypeScript declarations.

## Capabilities

### New Capabilities

- `release-integrity`: Guard tagged package publication against version mismatch and incomplete package artifacts.
- `release-guidance`: Provide versioned upgrade, verification, and human-release guidance to consumers and maintainers.

### Modified Capabilities

- None.

## Impact

- Affected code: release verification scripts, npm publication workflow, package metadata, and package smoke tests.
- Affected documentation: changelog, release checklist, validation record, and browser-print acceptance guidance.
- No runtime API is added; v0.2.0 documents the stricter printing behavior introduced by the preceding hardening change.
