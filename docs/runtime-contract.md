# Runtime contract and rollout

## Template document

`TemplateDocument v1` is the only persistence and runtime input. It contains `schemaVersion`, `id`, `meta`, `pageSettings`, and `pages[].elements`. Editor-only state such as selection, hover state, zoom, history, thumbnails, and preview caches is stripped before save or runtime use.

Use `createPublishReadyTemplatePayload()` to obtain the minimal validated payload for a service or business application. A document with validation errors must not be previewed or printed as a successful render.

## Runtime data

Pass one JSON object through the exposed `setRuntimeData(data)` API. A binding path accepts `customer.name`, `items[0].sku`, and optional leading `@` syntax.

- `element.variable` resolves text, image URL, barcode, and QR-code values.
- `table.props.dataVariable` resolves an array; `columnsVariable` and `footerDataVariable` resolve optional structural arrays.
- `multiLabel.props.dataVariable` resolves an array into the configured grid.
- Missing bindings render their token or an explicit missing-data message. Runtime never invents business rows or code values.

## Persistence adapters

`TemplateRepository` provides `create`, `list`, `get`, and `save`. The default browser adapter stores versioned documents locally. `createRestTemplateRepository({ baseUrl, getHeaders })` uses conventional `GET /templates`, `GET /templates/:id`, and `PUT /templates/:id`; production callers supply authentication and authorization headers.

## Safety, release, and deferred work

- Arbitrary `customScript` execution is disabled at runtime. Supported declarative table transforms are `sort` and `filterEquals`; invalid transforms surface an error and do not fall back to mock data.
- Preview and browser print share `RuntimeDocument` and the same pagination result. Browser print mounts this renderer in an isolated iframe.
- PDF export, silent printing, cloud delivery, server rendering, and multi-user workflows are deliberately deferred from the first commercial release.
- Release checks: run `npm test`, `npm run test:performance`, `npm run build`, scan dependencies/licenses, and complete legal provenance review described in `commercial-independence-audit.md`.
