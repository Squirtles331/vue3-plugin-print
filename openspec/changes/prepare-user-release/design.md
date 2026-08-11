## Context

The project publishes an installable Vue package through a tag-triggered GitHub Actions workflow. Automated verification already builds the library, packs it, and builds a throwaway consumer, but the workflow accepts any `v*` tag and the release documents still describe v0.1.0. The completed print-UX hardening change also introduces user-visible behavior that must be documented before consumers upgrade.

## Goals / Non-Goals

**Goals:**

- Ensure a tag-triggered publication can only publish the version declared by the checked-out package.
- Verify the generated tarball exposes the documented runtime and type entry points from an installed consumer.
- Make v0.2.0 upgrade notes and manual browser acceptance criteria explicit and current.
- Keep automated evidence and checks requiring a maintainer or real printer clearly separate.

**Non-Goals:**

- Publishing to npm, pushing a Git tag, or creating a GitHub Release.
- Guaranteeing paper calibration for every printer and driver.
- Replacing token-based publication with a registry-account configuration change.

## Decisions

### Validate the tag inside the publication workflow

The workflow will run a small Node script before `npm publish` that compares `GITHUB_REF_NAME` with `v${package.json.version}`. This makes the invariant explicit where tags are available and fails before an irreversible registry operation. Checking only the package version in the release notes was rejected because it cannot prevent an incorrect tag from publishing the wrong tarball.

### Reuse the packed-consumer test for public-surface verification

The throwaway consumer already installs the generated tarball and builds with Vite. It will also execute a Node import check against the packed ESM and CommonJS public entry points, and inspect the packaged declarations. This tests the artifact consumers receive rather than source-only exports. Unit tests alone were rejected because they do not catch omissions from `npm pack`.

### Release as v0.2.0

The project remains pre-1.0, and the release introduces new capabilities plus deliberately stricter default preflight behavior. A minor v0.x release communicates that callers must review the documented preflight upgrade notes without asserting an unqualified long-term stable API guarantee.

### Keep physical printer acceptance as an explicit human gate

Browser and printer drivers own the final dialog and physical margins. The repository will provide a concrete checklist and record automation evidence, but will not claim a virtual test proves calibrated output. Treating browser/hardware acceptance as automated would be misleading.

## Risks / Trade-offs

- [Strict preflight blocks old incomplete templates] → Release notes document `printPolicy.allowIncomplete` as an intentional, temporary migration path.
- [The packed artifact check increases verification time] → It runs only in release verification and validates the exact user installation path.
- [The workflow depends on `GITHUB_REF_NAME`] → The guard is scoped to tag-triggered publishing and reports a direct diagnostic when the environment is missing or mismatched.
- [Physical output varies by printer] → The checklist requires Chrome and Edge review plus a representative-device paper calibration before tagging.

## Migration Plan

1. Bump the package and lockfile to v0.2.0 and document the release.
2. Add the release-tag guard and broaden the packed-consumer smoke test.
3. Run the release verifier locally and in CI.
4. Before publication, a maintainer completes browser/printer, ownership, Pages, and secret checks.
5. After those human gates pass, create the matching `v0.2.0` tag so the workflow publishes the verified package.

Rollback is an npm deprecation or corrective patch release; a published version must not be overwritten.

## Open Questions

- None for repository preparation. npm token or Trusted Publisher configuration is an account-level decision for the maintainer.
