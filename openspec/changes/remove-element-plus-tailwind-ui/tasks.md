## 1. Foundation and package setup

- [x] 1.1 Add the Tailwind CSS toolchain and package build wiring needed to compile editor styles into the distributed CSS output.
- [x] 1.2 Create the internal UI foundation folder structure for owned primitives, shared tokens, and the local icon registry.
- [x] 1.3 Add shared style tokens and editor-scoped base styles that can replace Element Plus theme overrides.

## 2. Core owned UI primitives

- [x] 2.1 Implement owned button, input, textarea, select, switch, tabs, dialog, and confirmation primitives.
- [x] 2.2 Implement the internal notification/message surface used by save, delete, print, and validation flows.
- [x] 2.3 Implement the project-owned icon components required by the editor shell and action surfaces.

## 3. Migrate the editor shell first

- [x] 3.1 Replace Element Plus usage in the editor entry points, top bar, side docks, and status surfaces with owned primitives.
- [x] 3.2 Replace Element Plus usage in the template library, starter template, element preset, and runtime preview dialogs.
- [x] 3.3 Update shell styles so the migrated editor surfaces rely on Tailwind-based classes and internal component styles.

## 4. Migrate panels and dense controls

- [x] 4.1 Replace Element Plus usage in the pages, layers, insert, data, view settings, history, page settings, and inspector panels.
- [x] 4.2 Replace Element Plus usage in the element properties, table editor, and other form-heavy editor dialogs.
- [x] 4.3 Remove `@element-plus/icons-vue` imports from all source modules and swap them to the internal icon system.

## 5. Package, tests, and release contract

- [x] 5.1 Remove Element Plus from package metadata, library externals, consumer verification, and release checks.
- [x] 5.2 Update plugin registration, demo bootstrap, and library entrypoints so the package no longer exposes Element Plus setup.
- [x] 5.3 Rewrite tests and mocks that assert Element Plus components, then run lint, unit tests, build, and packed-consumer verification.
