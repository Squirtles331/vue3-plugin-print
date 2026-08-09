# Runtime contract and rollout

## Template document

`TemplateDocument v1` is the only persistence and runtime input. It contains `schemaVersion`, `id`, `meta`, `pageSettings`, and `pages[].elements`. Editor-only state such as selection, hover state, zoom, history, thumbnails, and preview caches is stripped before save or runtime use.

Use `createPublishReadyTemplatePayload()` to obtain the minimal validated payload for a service or business application. A document with validation errors must not be previewed or printed as a successful render.

## Runtime data

Pass one JSON object through the exposed `setRuntimeData(data)` API. A binding path accepts `customer.name`, `items[0].sku`, and optional leading `@` syntax.

- `element.variable` resolves text, image URL, barcode, and QR-code values.
- `table.props.dataVariable` and `table.props.footerDataVariable` resolve row arrays. Column keys, widths, alignment, formatter descriptors, and all visual settings remain authored by the template and cannot be overwritten by runtime JSON.
- `multiLabel.props.dataVariable` resolves an array into the configured grid.
- Missing bindings render their token or an explicit missing-data message. Runtime never invents business rows or code values.

## Authoring capabilities

- Starter catalog entries are independently authored sales, dispatch, label-sheet, and blank-page definitions. Creating one always generates new document, page, and element IDs.
- Templates can be exchanged as a versioned `print-template-studio/template` JSON envelope. Imports are size-limited, migrated through the document contract, and assigned a fresh document ID before they can be saved.
- Element presets are stored independently from templates. A preset contains only an element blueprint; inserting it creates a new current-page element.
- The property inspector supports common geometry, visibility, print state, lock state, typography, shape, image, machine-code, table, and multi-label properties. Locking prevents canvas and inspector mutation until the element is unlocked.
- Text supports wrapping, vertical writing, automatic height, complete typography and box styling. Image fit/position is static; a missing bound image remains an explicit placeholder.
- Barcodes and QR codes accept only authored presentation options and a bound content value. Their margin, colour, human-readable text, and error-correction settings are not runtime style inputs.
- Table columns support an explicit safe `valuePath`, a stable display key, alignment, width, and declarative `number`, `currency`, or `date` formatting. Design-row count and omission are `editorHints`, deliberately ignored by preview/print output.
- Multi-label cells use explicit `primaryPath`, `secondaryPath`, and `tertiaryPath` relative to each record. There is no implicit `title`/`name`/`code` fallback at runtime.
- Table transformations are declarative JSON only. Runtime supports constrained `sort` and `filterEquals` transforms; arbitrary JavaScript is removed during canonical serialization and rejected at runtime.
- Select multiple canvas elements with Shift, Ctrl, or Command click. Duplicate, z-order, alignment, and distribution use millimetre document coordinates, are stored as one undoable history transaction, skip locked elements, and clamp to the page unless the editor's overflow mode is enabled.

## Persistence adapters

`TemplateRepository` provides `create`, `list`, `get`, and `save`. The default browser adapter stores versioned documents locally. `createRestTemplateRepository({ baseUrl, getHeaders })` uses conventional `GET /templates`, `GET /templates/:id`, and `PUT /templates/:id`; production callers supply authentication and authorization headers.

## Safety, release, and deferred work

- Arbitrary `customScript` execution is disabled at runtime. Supported declarative table transforms are `sort` and `filterEquals`; invalid transforms surface an error and do not fall back to mock data.
- Preview and browser print share `RuntimeDocument` and the same pagination result. Browser print mounts this renderer in an isolated iframe.
- PDF export, silent printing, cloud delivery, server rendering, and multi-user workflows are deliberately deferred from the first commercial release.
- Release checks: run `npm test`, `npm run test:performance`, `npm run build`, scan dependencies/licenses, and complete legal provenance review described in `commercial-independence-audit.md`.
