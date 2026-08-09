## 1. Embeddable designer foundation

- [x] 1.1 Add the public library entrypoint, plugin, local Pinia provider, scoped component container, and public type declarations.
- [x] 1.2 Make editor repositories configurable, namespace local template/preset persistence, and expose print plus error callbacks.
- [x] 1.3 Synchronize controlled template and runtime-data bindings without feedback loops and preserve existing standalone demo behavior.

## 2. Library delivery

- [x] 2.1 Split demo-only global styles from package styles and create ESM/CJS/CSS library build configuration.
- [x] 2.2 Update package metadata, exports, dependency boundaries, Pages build, CI, and tag-driven npm trusted-publishing workflow.
- [x] 2.3 Document package installation, plugin registration, component bindings, repositories, multi-instance storage, methods, and browser limits.

## 3. Verification

- [x] 3.1 Add component and package-artifact tests for plugin registration, binding sync, instance isolation, repository failures, exports, and stylesheet isolation.
- [x] 3.2 Run lint, all tests, demo and library builds, pack inspection, and a packed-tarball consumer build.
