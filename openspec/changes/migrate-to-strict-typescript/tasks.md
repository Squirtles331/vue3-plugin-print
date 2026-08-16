## 1. TypeScript Toolchain

- [x] 1.1 Add the TypeScript, Vue checker, lint, Node, and third-party type dependencies.
- [x] 1.2 Add strict repository and declaration-build TypeScript configurations.
- [x] 1.3 Migrate lint, Vite, VitePress, Tailwind, PostCSS, and npm command configuration to TypeScript-aware tooling.

## 2. Typed Library Source

- [x] 2.1 Add shared domain, public API, and external-boundary types and guards.
- [x] 2.2 Migrate print-designer core, editor, runtime, templates, stores, UI, and Vue SFC scripts to strict TypeScript.
- [x] 2.3 Replace the manual library declaration entry with `src/index.ts` and source-generated declarations.

## 3. Verification Tooling

- [x] 3.1 Migrate tests and Node automation scripts to TypeScript and preserve existing behavioral coverage.
- [x] 3.2 Add type checking to CI and release verification and extend artifact checks for generated declarations.
- [x] 3.3 Add a packed TypeScript-consumer compile check while retaining ESM and CommonJS runtime checks.

## 4. Validation

- [x] 4.1 Run strict type checking, linting, all tests, performance checks, builds, package checks, and packed-consumer checks.
