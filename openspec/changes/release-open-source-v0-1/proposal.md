## Why

The standalone designer now provides the intended v0.1 authoring and browser-printing workflow, but it cannot yet be responsibly published as a self-service open-source project. Users need safe local template lifecycle controls, a deployable demo, clear usage and license information, and repeatable release checks before they can evaluate or contribute to it.

## What Changes

- Add deletion and full reset controls to the browser-local template library.
- Make the application deploy correctly as a GitHub Pages project site and add GitHub Actions for CI and Pages deployment.
- Establish the MIT open-source release baseline: repository metadata, dependency and license inventory, contributor and security guidance, and v0.1 release notes.
- Replace the outdated README with current installation, data-binding, template interchange, browser-printing, scope, and support guidance.
- Upgrade the audited indirect dependencies and add automated plus manual release verification for the supported Chromium browsers.

## Capabilities

### New Capabilities

- `local-template-lifecycle`: Manage saved browser-local templates, including deliberate deletion and complete local-library reset.
- `open-source-release-delivery`: Publish a documented, MIT-licensed standalone demo through GitHub Pages with repeatable CI and release artifacts.
- `browser-print-release-assurance`: Verify the v0.1 browser-print workflow and document its supported browser scope and manual acceptance process.

### Modified Capabilities

- None.

## Impact

- Affects the template repository and template-library dialog, Vite deployment configuration, package metadata and lockfile, GitHub workflow files, release documentation, and automated tests.
- Adds development tooling for linting and browser regression coverage; no runtime product dependency, backend service, npm package, Web Component, PDF export, silent printing, or cloud-print integration is introduced.
