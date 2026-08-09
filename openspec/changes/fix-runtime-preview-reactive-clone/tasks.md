## 1. Preview Snapshot and Runtime Normalization

- [x] 1.1 Store the editor preview document as a shallow, immutable snapshot before it is passed to the preview dialog.
- [x] 1.2 Unwrap Vue reactive template inputs before the runtime resolver clones and annotates them.

## 2. Regression Coverage

- [x] 2.1 Add a unit regression proving reactive template input resolves without mutation or clone failure.
- [x] 2.2 Verify Preview in Chrome renders runtime output without console errors, Vue warnings, or page errors.
