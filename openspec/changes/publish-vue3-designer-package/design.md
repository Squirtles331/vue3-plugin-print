## Context

The current Vue application globally installs Pinia, Element Plus, icons, and global page styles. Its designer root uses fixed Pinia store ids and viewport-sized layout, so it cannot safely be mounted more than once in a host application or published as a component package.

## Goals / Non-Goals

**Goals:**

- Deliver a scoped Vue 3 package with an isolated editor component and plugin.
- Keep the existing TemplateDocument v1, runtime rendering, browser printing, and repository contracts usable from business applications.
- Produce separate demo and package artifacts and automate tag-based npm publication.

**Non-Goals:**

- Web Components, Vue 2, server rendering, PDF/image export, or additional print channels.
- Publishing to npm as part of this code change; npm account ownership and trusted-publisher setup remain maintainer actions.

## Decisions

- `PrintTemplateStudio` creates and provides one Pinia instance per mounted designer. Existing stores retain their ids but resolve against that local Pinia, isolating state without requiring host Pinia installation.
- The Vue plugin registers Element Plus, icons, and `PrintTemplateStudio`; Vue is a peer dependency while internal UI and rendering dependencies remain normal package dependencies.
- The public component uses `v-model:template`, `v-model:runtime-data`, an optional repository, `storage-key`, and imperative methods for host-driven load/read/print. Incoming and emitted documents are normalized and compared to prevent feedback-loop reloads.
- Default repositories derive template and preset keys from `storage-key`. The compatibility default remains available for one instance; simultaneous instances require distinct keys when local persistence is used.
- Demo CSS keeps page-level selectors. Package CSS is scoped under the component root and exported as `./style.css`.
- Vite library mode emits ESM and CJS package files under `dist`; the demo build emits a separate Pages artifact. Tag workflow publishes public releases with npm OIDC and provenance.

## Risks / Trade-offs

- [Element Plus already installed by host] → Plugin registers only missing globals and documents plugin-first integration.
- [Externally controlled template causes update loops] → Compare serialized normalized documents before loading or emitting.
- [Multiple local instances share persistence by accident] → Document `storage-key` and test isolated template/preset keys.
- [SSR import reaches browser-only features] → Keep DOM work behind mounted/user-triggered paths and document client-only mounting.

## Migration Plan

1. Keep the existing application entrypoint as the GitHub Pages demo.
2. Add library entrypoints and package exports without changing TemplateDocument v1.
3. Update workflows to build the appropriate artifact and publish only version tags.
4. Roll back a package release by deprecating its version; never unpublish a consumed release.
