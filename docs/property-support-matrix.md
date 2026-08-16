# Property support matrix

This is the independently authored support matrix for `TemplateDocument v2`. The executable source of truth is `src/print-designer/core/propertyCapabilities.js`; it supplies the field type, bounds, default, editor-only marker, and renderer effect. `src/print-designer/core/elementRegistry.js` supplies element-specific defaults. The matrix is intentionally capability-oriented and does not reproduce any external product's labels, stored format, or visual design.

| Scope | Persisted fields (canonical storage) | Defaults and validation | Editor / output effect | Editor-only |
| --- | --- | --- | --- | --- |
| Template | `meta.name`, `schemaVersion`, pages | v2; required page/element identifiers are normalized and validated | repository, preview, print input | no |
| Page | `pageSettings.paper`, `margin`, `background`, `printMarks` | A4 portrait 210 × 297 mm; four 8 mm margins; bounded numeric dimensions | shared runtime page geometry and print marks | no |
| Page guides | `cornerMarks`, `headerLine`, `footerLine` | off unless authored | canvas guide only | yes |
| All elements | root `x`, `y`, `width`, `height`, `rotation`, `zIndex`, `visible`, `printable`, `locked`, `repeatPerPage`, `variable` | bounded mm/degree/layer values; visible and printable default true | geometry, stacking, data binding, pagination and print filtering | `locked` affects editing only |
| All elements | `style.opacity`, background, border width/style/colour/radius, padding | opacity 1; bounded numeric values; safe colour and enum validation | canvas and runtime box presentation | no |
| Text | root `content`; `props.autoHeight`, `whiteSpace`, `writingMode`; typography style | empty content; pre-wrap horizontal writing; bounded font/spacing/line-height | canvas and runtime text layout, including automatic height | no |
| Image | `props.src`, `placeholder`, `keepAspectRatio`; `style.objectFit`, `objectPosition` | empty source; contain at 50% 50%; safe static source | image placement; explicit missing-image state at runtime | aspect lock is editor interaction only |
| Barcode | root `content`; format/display-value/margin/text-margin/text-font-size; foreground/background | CODE128, text shown, bounded safe machine-code options | local barcode renderer and browser print | no |
| QR code | root `content`; error correction and margin; foreground/background | M correction, zero margin; bounded values | local QR renderer and browser print | no |
| Page number | format plus common typography | `1` format | pagination result in preview and print | no |
| Line | common geometry and border style | 40 mm, 1 mm high, solid border | line stroke in canvas/runtime | no |
| Rectangle | common geometry and box style | transparent fill, solid border | shape fill, border and corner radius | no |
| Circle | common geometry and box style | 20 mm square, transparent fill | circle fill and border; canonicalization enforces equal width/height | no |
| Table | `columns[key,valuePath,title,width,align,formatter]`, header/footer flags and data, row/header/footer metrics, pagination, style, transform | widths 1–240; safe paths; formatters only `number`, `currency`, `date`; declarative `sort` / `filterEquals` transform | shared table rows, widths, styles and pagination | `editorHints.omitRows,rowCount` |
| Multi-label | grid rows/columns/direction/gaps, data path, `primaryPath`, `secondaryPath`, `tertiaryPath`, cell padding, style | 5 × 3 row flow, 12 mm gaps, 2 mm cell padding | explicit relative-field mapping and missing-value tokens in canvas/runtime | no |

Only the canonical v2 fields are accepted. Templates containing a different schema version or removed field aliases are rejected; no migration or compatibility normalization is performed. Browser print uses the standalone runtime and excludes `editorHints`, selection handles, guides, and other canvas-only UI.
