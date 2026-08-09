## ADDED Requirements

### Requirement: Public npm package artifacts
The package SHALL publish as `@squirtles331/vue3-plugin-print` with ESM, CJS, type declarations, and a `./style.css` export. Only Vue SHALL be a peer dependency.

#### Scenario: Consumer installs the packed artifact
- **WHEN** a Vue 3 project installs the generated tarball
- **THEN** it resolves the default plugin, named component, public utilities, declarations, and stylesheet subpath

### Requirement: Non-invasive package styles
The package stylesheet SHALL not set global `html`, `body`, or host `#app` layout styles.

#### Scenario: Consumer imports the stylesheet
- **WHEN** a host imports `@squirtles331/vue3-plugin-print/style.css`
- **THEN** the host page dimensions and overflow settings remain unchanged outside the designer root

### Requirement: Separate demo and release delivery
GitHub Pages SHALL build the demo application from `master`, while a `vX.Y.Z` tag SHALL run verification and publish the package using npm trusted publishing with provenance.

#### Scenario: Maintainer pushes a release tag
- **WHEN** a tag matching `vX.Y.Z` is pushed after npm trusted-publisher configuration
- **THEN** CI verifies the project and publishes the versioned public package without a stored npm token
