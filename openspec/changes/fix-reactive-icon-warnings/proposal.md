# Fix reactive icon warnings

## Why

The insertion panel passes Vue icon component definitions through a reactive collection. Vue warns that these component objects are being proxied, creating avoidable reactive overhead while the editor opens.

## What changes

- Keep palette icon component definitions raw at their source boundary.
- Preserve the current insertion-panel labels, order, and available element types.
- Add a regression test for raw icon definitions without adding dependencies.

## Out of scope

- No visual redesign, element changes, or dependency changes.
