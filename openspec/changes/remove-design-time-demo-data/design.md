## Context

The current designer mixes two different concerns inside element defaults and canvas preview code:

- structural defaults needed to make an element editable on the canvas
- demo content used to make the prototype look populated

This shows up across multiple modules. `elementRegistry.js` creates text, table, barcode, QR code, page number, and multi-label elements with prefilled content or sample data. `PaperCanvas.vue` then adds another layer of preview fallbacks, including mock text, sample label rows, test machine-readable values, and auto-derived table footer totals.

The result is inconsistent with a production product. A user creating a fresh template is shown content that looks real, even when nothing has been bound or configured yet. At the same time, later productization work needs a clean distinction between:

- explicit user-authored content
- explicit binding placeholders
- design-only empty-state hints

This change is cross-cutting because it affects element creation defaults, preview rendering, inspector expectations, and future runtime contract hygiene.

## Goals / Non-Goals

**Goals:**

- Ensure newly created design elements start without demo business data or fake runtime values.
- Preserve structural editing scaffolding so empty elements are still visible and usable on the canvas.
- Standardize unbound preview behavior so placeholders communicate missing data without masquerading as real content.
- Prevent design-time synthetic data from leaking into later save, preview, or runtime productization work.
- Keep behavior deterministic across table, multi-label, text, image, barcode, QR code, and page-number elements.

**Non-Goals:**

- Remove explicit sample data that already exists in previously saved templates.
- Deliver the full runtime data-binding system in this change.
- Finalize all preview wording or visual styling for future runtime validation states.
- Change unrelated editor interaction patterns such as drag, resize, selection, or page layout tooling.

## Decisions

### 1. Separate structural defaults from content defaults

New element defaults will keep only the minimum structure needed for editing:

- size, style, and layout settings
- table columns and configurable design row counts
- empty content fields and empty data collections

They will not include demo records, example URLs, sample codes, or default business text. This keeps creation behavior product-like while preserving editability.

Alternative considered:
- Keep content-heavy defaults and only hide them in preview. Rejected because fake data would still remain in the document model and continue to contaminate save/load and runtime work.

### 2. Render placeholders at preview time instead of storing preview content

Canvas placeholders will be derived in `PaperCanvas.vue` from current element state rather than persisted into the element payload. Unbound elements may still show:

- empty-state hint text
- binding tokens such as `{{variable}}`
- structural rows or cells for tables and labels

But those placeholders must be render-only feedback, not model data.

Alternative considered:
- Write placeholder content into element `content` or `sampleData` on creation. Rejected because it blurs authored data with designer guidance and creates migration debt later.

### 3. Keep product-style table and label scaffolding without synthetic records

Tables and multi-label layouts still need visible structure on the canvas, so this change keeps:

- default table columns
- configurable empty design rows
- multi-label grid dimensions

But removes generated row records, fake totals, sample label items, and default binding variables. This preserves layout editing without implying real business data exists.

Alternative considered:
- Make unbound tables and labels fully blank with no visible structure. Rejected because it would harm usability and make placement/editing harder.

### 4. Preserve existing explicit template data

The change applies to new initialization and preview fallback behavior, not historical cleanup. Existing templates that already contain explicit `sampleData`, `footerData`, or authored element content will continue to render from those stored values until a later migration policy is intentionally defined.

Alternative considered:
- Automatically strip demo data from any loaded template. Rejected because it risks destructive changes to documents that users may still rely on during transition.

### 5. Remove computed business-looking fallbacks from unbound preview

Preview logic must stop inventing content that resembles real runtime output, including:

- fallback text such as generic body copy
- test barcode or QR payloads
- auto-computed table footer totals
- sample label captions like “示例数据”

Where a visual cue is still needed, use an explicit empty or unbound message instead.

Alternative considered:
- Keep business-looking fallbacks for perceived polish. Rejected because the polished appearance is misleading and works against the productization goal.

## Risks / Trade-offs

- [Empty templates may feel less visually rich at first glance] -> Use clear empty-state and unbound placeholders so the canvas remains understandable without fake data.
- [Different element types may drift into inconsistent placeholder language] -> Centralize placeholder rules per element category and review them together during implementation.
- [Some existing editor logic may implicitly assume populated data arrays] -> Audit table and multi-label helpers so empty collections remain a first-class state.
- [Teams may still want demo templates for showcases] -> Keep demo content as optional explicit fixtures or starter templates, not baked into core defaults.

## Migration Plan

1. Update element factory defaults so newly created elements no longer receive demo business content.
2. Update canvas preview helpers so unbound elements render explicit empty-state feedback instead of sample values.
3. Ensure table and multi-label preview helpers operate correctly with empty arrays and absent variables.
4. Adjust inspector behavior, labels, and defaults where current controls assume sample data exists.
5. Verify that existing saved templates with explicit content continue to open without forced cleanup.

Rollback strategy:

- The change is local to design-time defaults and preview fallback logic, so rollback can restore previous element defaults and preview helpers without schema migration.

## Open Questions

- Should page-number preview show a neutral token such as `{page}` or a localized empty-state label when no real pagination context is available?
- Should barcode and QR code placeholders remain stylized previews, or shift to simpler unbound shells until real runtime renderers land?
