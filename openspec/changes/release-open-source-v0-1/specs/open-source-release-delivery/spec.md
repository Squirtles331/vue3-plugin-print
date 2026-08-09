## ADDED Requirements

### Requirement: The standalone demo deploys on GitHub Pages
The project SHALL build with correct asset paths both for local/root hosting and for a GitHub Pages project site. A GitHub Actions workflow SHALL deploy the production `dist` artifact from `main` and permit manual redeployment.

#### Scenario: Build for a GitHub Pages project site
- **WHEN** the build runs in GitHub Actions for an owner/repository project site
- **THEN** generated HTML asset references SHALL use that repository's Pages base path

### Requirement: The repository has an open-source release baseline
The repository SHALL include an MIT license, accurate repository metadata, third-party license inventory, current usage documentation, contribution guidance, security reporting guidance, issue and pull-request templates, a changelog, and v0.1.0 release notes.

#### Scenario: A new evaluator opens the repository
- **WHEN** a developer reads the repository landing documentation
- **THEN** they can install and run the demo, understand local persistence and browser-printing limits, find runtime-data and template-interchange examples, and identify deferred features

### Requirement: Continuous integration checks every source change
GitHub Actions SHALL run deterministic install, lint, unit tests, performance tests, production build, and dependency audit for pull requests and pushes to `main`.

#### Scenario: A pull request changes source code
- **WHEN** the pull request workflow executes
- **THEN** the change is blocked by any failed install, lint, test, performance, build, or audit command
