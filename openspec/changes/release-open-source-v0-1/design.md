## Context

The application is a Vue/Vite standalone desktop-oriented print-template designer. It already uses `TemplateDocument v1`, browser `localStorage`, a shared preview/print runtime, and an isolated iframe for native browser printing. The project has no GitHub workflows, no open-source license or community files, and a Vite configuration that assumes root hosting. The selected first release is source plus a GitHub Pages demo, under MIT, for latest desktop Chrome and Edge only.

## Goals / Non-Goals

**Goals:**

- Make saved browser-local templates removable and resettable without affecting the current in-memory document.
- Produce an independently deployable GitHub Pages build and enforce repeatable release checks.
- Publish accurate source, license, contribution, security, release, runtime-data, and browser-print guidance.
- Exercise the print iframe boundary automatically and record the real-browser validation that automation cannot cover.

**Non-Goals:**

- No npm package, Web Component, backend, account sync, PDF/image export, silent print, cloud print, printer selection, mobile support, collaboration, or language expansion.
- No upstream code, templates, UI copy, branding, screenshots, or assets are incorporated.

## Decisions

- The local repository SHALL expose asynchronous `delete(id)` and `clear()` methods in addition to its existing CRUD-like methods. `delete` resolves `false` for a missing template; `clear` replaces only its configured collection with an empty collection. This keeps the UI deterministic and avoids direct localStorage access in components. The generic REST adapter gains `delete(id)` but does not implement bulk clear, because remote deletion authorization and retention policy are service decisions.
- The template-library dialog owns destructive confirmations and emits intent events. The editor root calls the repository, refreshes the displayed list, and leaves the currently open document unchanged. This avoids losing unsaved canvas work merely because a library entry is removed.
- GitHub Pages deployment uses a Vite base derived from `GITHUB_ACTIONS`: `/${GITHUB_REPOSITORY#*/}/` for project Pages and `/` outside Actions. This avoids hard-coding an owner while preserving local development and conventional hosting. A Pages workflow builds once, uploads `dist`, and deploys only from `main` or manual dispatch; a separate CI workflow validates pull requests and pushes.
- Release checks use `npm ci`, unit tests, the pagination performance test, production build, ESLint, npm audit, and a jsdom print-isolation test. The test verifies only DOM behavior under application control; physical printer options and paper calibration are documented as manual Chrome/Edge acceptance steps.
- The project remains `private: true` because it is not an npm package. Package metadata identifies its GitHub source using a placeholder-free relative convention only where a concrete repository URL is available; the README tells maintainers to set the final GitHub URL at transfer time.
- Documentation is Chinese-first with a concise English quick-start, uses self-authored examples only, and explicitly declares browser-local persistence and the deferred feature boundary.

## Risks / Trade-offs

- [MIT applied to code with unverified provenance] → retain the audit record and require maintainer/legal review before creating the public tag.
- [GitHub Pages assets fail under a repository path] → build under an Actions-like environment and assert generated asset URLs include the repository base.
- [Native print dialogs cannot be reliably automated] → test the iframe content in jsdom and require a short manual Chrome/Edge checklist before release.
- [Dependency updates change the toolchain] → update only audited indirect packages through the lockfile, then run lint, unit, performance, browser-isolation, and production-build checks.
- [Local reset surprises users] → reset is explicitly labeled as browser-local, has destructive confirmation, and does not erase an already-open document.

## Migration Plan

1. Add lifecycle APIs and UI actions without changing existing saved-document JSON.
2. Add release files, workflows, metadata, dependency updates, and automated checks.
3. Publish the repository to GitHub, enable Pages with GitHub Actions as its source, and confirm the generated project-site URL.
4. Run the manual Chrome and Edge validation list, complete provenance review, create the `v0.1.0` tag, then publish GitHub Release notes.

Rollback consists of disabling the Pages workflow or reverting the release commit. Existing local templates remain versioned `TemplateDocument v1` records; resetting them is never performed by deployment or migration.

## Open Questions

- None for the source release. The final GitHub owner/repository URL is supplied when the current Gitee repository is mirrored or transferred; workflow paths derive from GitHub-provided environment variables.
