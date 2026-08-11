## 1. Release integrity

- [x] 1.1 Add a tag-to-package-version guard with clear mismatch diagnostics.
- [x] 1.2 Run the guard in the npm publication workflow before publishing.
- [x] 1.3 Extend packed-artifact verification for the declarations and documented export metadata.

## 2. Consumer installation confidence

- [x] 2.1 Extend the isolated packed-consumer check to load ESM and CommonJS public entry points.
- [x] 2.2 Verify the packed declarations expose the documented component, print policy, and readiness APIs.

## 3. Versioned release guidance

- [x] 3.1 Bump package metadata and lockfile to v0.2.0.
- [x] 3.2 Write v0.2.0 release notes including strict-preflight migration guidance.
- [x] 3.3 Replace stale release checklist and validation record with v0.2.0 release gates.
- [x] 3.4 Tighten browser/printer acceptance criteria and link the release decision to the guide.

## 4. Verification

- [x] 4.1 Run lint, unit tests, library build, artifact check, packed-consumer check, and documentation build.
- [x] 4.2 Run the full release verifier and record its result in the validation record.
- [x] 4.3 Confirm the OpenSpec task list is complete and summarize human-only publication gates.
