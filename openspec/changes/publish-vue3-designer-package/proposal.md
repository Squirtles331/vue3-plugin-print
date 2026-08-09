## Why

The print designer can currently run only as a full-page application. Publishing an independently scoped Vue 3 package lets business applications install, embed, persist, and print with the designer without copying source files or recreating its runtime integration.

## What Changes

- Publish the reusable Vue 3 designer as public package `@squirtles331/vue3-plugin-print`.
- Add an embeddable component, Vue plugin, public template/repository utilities, types, scoped styles, and isolated multi-instance state.
- Split demo and library builds, package metadata, CI, tag-driven npm publishing, and user documentation.
- **BREAKING** The default production build becomes the npm library build; GitHub Pages uses a dedicated demo build.

## Capabilities

### New Capabilities

- `embeddable-vue-print-designer`: Vue 3 component and plugin API for isolated editable print-template instances.
- `npm-library-delivery`: Build, package metadata, release automation, and documentation required to consume the package from npm.

### Modified Capabilities

None.

## Impact

- Affects package entrypoints, editor composition, repository configuration, styles, Vite configuration, workflows, tests, and README.
- Vue is the only peer dependency; other UI and print-rendering dependencies are installed with the package.
