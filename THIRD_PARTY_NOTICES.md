# Third-party notices

The following dependencies were added for the independent runtime and test implementation:

| Package | Version | License | Purpose |
| --- | --- | --- | --- |
| jsbarcode | 3.11.6 | MIT | Browser barcode SVG generation |
| qrcode | 1.5.4 | MIT | Browser QR-code generation |
| vitest | 3.2.7 | MIT | Automated unit tests |
| CodeMirror 6 packages | See `package-lock.json` | MIT | JSON-only structured table-transform editor |
| ESLint, @eslint/js, eslint-plugin-vue, globals | See `package-lock.json` | MIT | Static source and Vue correctness checks |
| jsdom and @vue/test-utils | See `package-lock.json` | MIT | Browser-DOM and component interaction regression tests |
| nanoid and postcss | 3.3.18 / 8.5.26 | MIT | Audited indirect dependencies used by the build toolchain |

All third-party packages remain subject to their own license texts distributed in `node_modules` and package registries. This file is an inventory aid, not a substitute for a release-time dependency license scan. `npm audit --omit=dev --audit-level=high` is part of the release and CI checks.
