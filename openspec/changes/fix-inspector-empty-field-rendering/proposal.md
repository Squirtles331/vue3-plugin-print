# Fix inspector empty-field rendering

## Why

The structured property-panel template renders a field-error node outside its field loop. During a component render, the loop variable is undefined and `fieldErrorKey()` crashes the editor.

## What changes

- Keep field-error rendering in the field loop scope.
- Treat absent field definitions as a no-error condition in error-key helpers.
- Add a regression test for undefined field error lookup.

## Out of scope

- No property-schema, layout, or persistence changes.
