## Why

The editor UI currently depends on Element Plus and its icon package for most interactive controls. That makes the package heavier to consume, forces downstream users to install and bundle UI code they do not own, and keeps the design system tied to a third-party component contract. This change moves the product toward a self-contained UI foundation built on Tailwind CSS and internal base components.

## What Changes

- Replace Element Plus used by the print designer with internal base UI components for buttons, inputs, dialogs, selects, switches, tabs, and notifications.
- Introduce Tailwind CSS as the styling foundation for the editor shell and shared UI primitives.
- Replace `@element-plus/icons-vue` with an internal icon set or icon abstraction owned by the project.
- Remove Element Plus from package runtime expectations, build externals, and release verification assumptions. **BREAKING**
- Keep the current editor workflows, template operations, preview, and print flows intact while lowering the dependency footprint.
- Update tests and consumer verification to validate the new self-contained UI stack.

## Capabilities

### New Capabilities

- `internal-ui-foundation`: Provide a self-contained set of editor UI primitives and Tailwind-based styles that replace third-party widget usage in the designer experience.
- `package-dependency-minimization`: Publish the package without Element Plus or its icon package as required runtime dependencies, so consumers only need the supported core runtime dependencies.

### Modified Capabilities

None.

## Impact

- Affected code: `src/print-designer/ui/**`, editor shell, sidebar, panels, dialogs, runtime preview controls, and any component that currently imports Element Plus or its icons.
- Affected APIs/systems: package metadata, library build externals, package verification scripts, consumer verification, and existing UI tests.
- Affected dependencies: remove `element-plus` and `@element-plus/icons-vue` from the user-facing runtime contract; add Tailwind CSS tooling and any internal UI support code required by the editor.
- Product impact: smaller install footprint, fewer third-party UI constraints, and a more controlled editor experience that matches the project's own product language.
