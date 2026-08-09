## Context

`README.md` already documents the v0.1 feature set, local persistence, runtime JSON, browser-printing limits, and contribution process. Its opening is primarily a feature list, so first-time visitors do not immediately see a concise project position, the demo, or the intended evaluation path.

The README is Chinese-first and has a short English quick start. The project is a standalone Vue 3 application, not an npm component package, and v0.1 supports browser-native printing only.

## Goals / Non-Goals

**Goals:**

- Establish a short, accurate introduction and a visible link set at the beginning of the README.
- Help visitors navigate to the live demo, quick start, usage flow, printing constraints, release limits, and contribution guidance.
- Keep existing technical details intact and use only project-owned wording and links.

**Non-Goals:**

- Adding product screenshots, third-party badges, package-install instructions, or new product capabilities.
- Changing the actual demo-hosting, repository, license, or package metadata.
- Reproducing the structure, copy, images, or branded visual treatment of other projects.

## Decisions

- Add a project-positioning block and a plain-text link row below the title. This gives the landing section a clear hierarchy without relying on external badge services or unverified social metrics.
- Add a compact `阅读导航` section that points to existing in-document headings. This makes the long Chinese documentation scannable while preserving its content rather than duplicating it.
- Retain the current demo URL and all explicit scope limitations. Documentation must describe the checked-in metadata and current application behavior, not infer a new hosting or distribution channel.

## Risks / Trade-offs

- [Internal Markdown anchors can drift if headings are renamed] → Use direct anchors only for stable, existing headings and verify the rendered link targets after the edit.
- [A marketing-oriented introduction could overpromise] → State the v0.1 browser-printing boundary in the opening scope summary and leave detailed limits in their existing section.
- [External project descriptions could influence the text too closely] → Write original, project-specific copy and avoid their images, badges, installation snippets, and feature claims.
