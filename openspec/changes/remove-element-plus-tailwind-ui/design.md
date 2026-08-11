## Context

The current print designer uses Element Plus and `@element-plus/icons-vue` across the editor shell, dialogs, panels, and tests. That makes the public package heavier than it needs to be and keeps the product coupled to a third-party UI contract for controls that belong to the editor itself.

This change affects multiple layers at once:

- the component implementation layer, where buttons, inputs, dialogs, tabs, selects, switches, and notices are rendered
- the package layer, where peer dependencies, externals, and consumer verification currently assume Element Plus
- the styling layer, where many components rely on `el-*` structure and deep selectors
- the testing layer, where UI stubs and package checks encode the old dependency contract

The goal is not to redesign the product language. The goal is to make the editor self-contained, smaller to consume, and easier to evolve without a third-party widget system sitting in the middle of the experience.

## Goals / Non-Goals

**Goals:**

- Replace Element Plus with project-owned UI primitives for the editor experience.
- Use Tailwind CSS as the styling foundation for the editor shell and internal primitives.
- Replace the icon package with project-owned icon components or SVG assets.
- Remove Element Plus from the published package dependency contract and consumer checks.
- Keep existing editor workflows, template operations, preview, and print behavior intact.

**Non-Goals:**

- Rework the template data model, runtime renderer, or print pipeline in this change.
- Add a design system for external consumption beyond this editor package.
- Introduce a consumer requirement to install or configure Tailwind in host applications.
- Redesign product information architecture, only the implementation of the current surfaces.

## Decisions

### 1. Build internal UI primitives instead of wrapping Element Plus

The editor will migrate to a small owned primitive layer: button, input, textarea, select, switch, tabs, dialog, popconfirm/confirm, message, badge, and icon button patterns. These primitives will be focused on the current editor workflows rather than generalized as a public UI kit.

Alternative considered:
- Keep Element Plus behind a local wrapper layer. Rejected because the package would still carry the dependency and the wrappers would inherit the same release and bundle cost.

### 2. Use Tailwind CSS as the styling system for the editor shell

Tailwind will be used as the project styling foundation for the editor UI and primitives, with compiled package CSS shipped to consumers. The host application will not need its own Tailwind setup to render the package.

Alternative considered:
- Require consumers to install and configure Tailwind. Rejected because it increases integration cost and undermines the package goal of being easy to embed.

### 3. Implement project-owned icons as small SVG components

Icons used by the editor shell and actions will be converted into local SVG components or a tiny internal registry. This keeps the package independent from a third-party icon set and avoids exposing icon dependency churn to consumers.

Alternative considered:
- Swap to another icon package. Rejected because the request is to remove third-party UI dependency, not replace it with a different one.

### 4. Migrate from the top-level editor outward

The safest migration order is:

1. shell and header actions
2. dialogs and notification surfaces
3. sidebar and inspector controls
4. dense property panels
5. test and verification cleanup

This keeps the most visible workflows working while reducing the chance of a broad breakage burst.

Alternative considered:
- Rewrite every component at once. Rejected because the UI surface is too wide and the regression risk is unnecessary.

### 5. Treat package metadata and release checks as part of the product contract

The published package must reflect the new dependency story in `package.json`, library externals, package artifact checks, and packed consumer verification. The migration is not complete until the release path no longer assumes Element Plus.

Alternative considered:
- Change the source code only. Rejected because the published artifact would still misrepresent the actual consumer experience.

## Risks / Trade-offs

- [Regression risk in dense editor surfaces] -> Migrate in slices and add targeted tests around dialogs, panel controls, and destructive actions.
- [Tailwind utility sprawl can hurt consistency] -> Standardize tokens and shared primitive classes before porting the heavy panels.
- [Owned controls may miss accessibility details] -> Require keyboard, focus, and confirmation behavior parity in primitive-level tests.
- [Package CSS may grow during migration] -> Keep utilities scoped to the editor package and avoid shipping unused global styles.
- [Removal of Element Plus may slow initial development] -> Use a narrow primitive surface and migrate the highest-traffic workflows first.

## Migration Plan

1. Add the internal primitive layer and icon registry beside the existing editor components.
2. Port the shell, dialogs, and high-frequency controls first so the editor remains usable during the migration.
3. Replace `element-plus` and `@element-plus/icons-vue` imports across the source tree.
4. Switch library build configuration, package metadata, and verification scripts to the new dependency contract.
5. Update tests to assert owned UI behavior instead of third-party component presence.
6. Remove the temporary compatibility layer after the last Element Plus reference disappears.

Rollback strategy:

- Keep the old UI adapter layer until the new primitives cover all editor workflows.
- If a release regression appears, revert to the previous tag and re-enable the compatibility layer for one more iteration rather than restoring Element Plus globally.

## Open Questions

- Should the internal icon set be plain inline SVG components or a single icon registry with generated wrappers?
- Should the Tailwind setup live only in the library build, or also power the demo app with the same config?
- Which UI primitive deserves the first shared test matrix: dialog, select, or input?
