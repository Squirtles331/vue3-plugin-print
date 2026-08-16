## Context

The Vue 3 print-template designer currently contains JavaScript source, JavaScript tests and automation, and Vue SFCs without TypeScript scripts. `src/library/index.d.ts` is manually maintained and copied into the published package, so it can diverge from implementation. The package already supports ESM and CommonJS, browser-native printing, and persisted TemplateDocument v2 documents; those runtime contracts must remain stable.

## Goals / Non-Goals

**Goals:**

- Make every executable repository-owned file TypeScript while keeping styles and documentation prose unchanged.
- Make invalid internal interactions and untrusted external values visible through strict compile-time checks and runtime narrowing.
- Derive the package declaration files from the source entry and validate them in an installed consumer.
- Make type checking a required local and CI verification step.

**Non-Goals:**

- Changing the runtime public API, ESM/CJS package exports, persisted template schema, or browser support matrix.
- Rewriting business behavior while adding types.
- Converting documentation snippets intended for JavaScript users to TypeScript.

## Decisions

- Use TypeScript with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`, and strict Vue templates. This finds nullability and indexed-access mistakes that `strict` alone misses. JavaScript sources, explicit `any`, and suppression directives are disallowed; dynamic boundaries use `unknown` plus validators instead.
- Use a root no-emit configuration for repository checks and a declaration-only source configuration for the library package. `vue-tsc` emits declaration files after Vite builds JavaScript into `dist`; this replaces the hand-maintained declaration copy. A root `src/index.ts` library entry keeps emitted declaration import paths valid without post-processing.
- Retain `.js` import specifiers between TypeScript source modules. Vite and TypeScript resolve them to source files during development and emit standards-compliant ESM references for any preserved imports.
- Centralize template, element, repository, runtime, and editor public contracts in TypeScript modules. Model external JSON and mutable browser inputs as `unknown`; preserve the current normalizers and validators as the runtime source of truth.
- Run Node-side TypeScript with `tsx`; let Vite, Vitest, and VitePress process their native TypeScript configuration. Use TypeScript-aware ESLint syntax rules while leaving semantic type analysis to `vue-tsc` for a single authoritative type check.
- Preserve the plugin's public runtime exports exactly. Generated declarations expose the existing public type names and runtime APIs; JavaScript users remain unaffected.

## Risks / Trade-offs

- [Strict optional and indexed-access checks expose a large number of latent assumptions] → Introduce shared narrowing helpers first, then migrate feature modules in dependency order and keep behavior covered by existing tests.
- [Generated Vue declarations can include transitive SFC types] → Emit the complete declaration tree into `dist` and compile a packed TypeScript consumer, rather than checking only `dist/index.d.ts` text.
- [Node 20 cannot execute TypeScript directly] → Route all repository-owned automation scripts through `tsx` and update nested npm invocations accordingly.
- [A mechanical rename can alter import resolution] → Retain ESM `.js` specifiers and validate demo builds, library builds, ESM import, and CommonJS require from an installed tarball.
- [A broad conversion can conceal unsound contracts behind explicit `any`] → Rebuild shared domain unions and type guards first, remove inferred and annotation-level `any` in dependency order, and enforce the result through ESLint in every checked executable file.

## Migration Plan

1. Add dependencies, TypeScript configuration, lint configuration, and typecheck scripts.
2. Create shared domain and public API types, then migrate source modules and SFCs in dependency order.
3. Migrate tests and automation/configuration files, remove manual declarations, and generate declarations from `src/index.ts`.
4. Extend artifact and packed-consumer checks; run the full verification suite.

The migration is source-only and is shipped as a normal package release. If a defect is found, revert the migration commit and publish the prior compatible JavaScript package; no data migration or consumer code change is required.

## Open Questions

None.
