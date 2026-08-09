## 1. Local template lifecycle

- [x] 1.1 Add local-template `delete` and `clear` operations and REST-template deletion support.
- [x] 1.2 Add confirmed delete and browser-local reset actions to the template library dialog.
- [x] 1.3 Wire lifecycle actions through the editor root without altering the active in-memory document.
- [x] 1.4 Add repository and component-state tests for deletion, missing entries, reset isolation, and refreshed library state.

## 2. Release build and automation

- [x] 2.1 Configure Vite's GitHub Pages project-site base path and validate the emitted asset paths.
- [x] 2.2 Add GitHub Actions CI and GitHub Pages deployment workflows.
- [x] 2.3 Add lint and jsdom test tooling, remediate audited indirect dependencies, and update the dependency notice inventory.

## 3. Open-source release materials

- [x] 3.1 Add the MIT license and complete package metadata for the source release.
- [x] 3.2 Replace the README with current Chinese-first documentation and concise English quick-start.
- [x] 3.3 Add contribution, security, issue/PR, changelog, browser acceptance, provenance, and v0.1.0 release-note materials.

## 4. Print assurance and validation

- [x] 4.1 Add a jsdom regression test that verifies isolated print output contains runtime content but no editor controls.
- [x] 4.2 Run lint, unit, performance, GitHub-Pages build, production build, audit, and source-provenance checks; record the release result.
