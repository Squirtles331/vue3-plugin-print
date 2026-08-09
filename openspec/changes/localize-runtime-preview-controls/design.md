## Context

The editor is Chinese-first, while the runtime preview dialog exposes English copy in its left control column. The dialog is a single Vue component and the requested localization is presentation-only.

## Goals / Non-Goals

**Goals:**

- Present the runtime preview title, JSON input label, guidance, and browser-print action in clear Chinese.
- Preserve all existing model bindings and printing behavior.

**Non-Goals:**

- Introduce a general i18n framework or translate runtime error messages in this change.
- Change the runtime data schema or print implementation.

## Decisions

1. Replace the four visible English strings in `RuntimePreviewDialog.vue` directly with concise Chinese copy.
   - The project does not currently use a localization framework, and the requested scope is one dialog.
   - A future i18n system can extract these strings without altering the component's behavior.

## Risks / Trade-offs

- [Mixed-language validation messages remain] → this is intentionally out of scope; only the left-side controls shown in the requested UI are localized.
