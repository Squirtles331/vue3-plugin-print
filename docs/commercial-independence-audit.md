# Commercial independence audit

Status: remediation in progress. This record documents engineering controls; it is not legal advice or a legal clearance.

## Reference boundary

- Reference product: `0ldFive/Vue-Print-Designer`.
- Reference license observed on 2026-08-09: AGPL-3.0-only.
- This repository must not ship copied source, branding, logos, screenshots, product copy, or other protected assets from that project without a separate written license.
- The product is implemented as an independent Vue application. Similarity is limited to generic print-designer capabilities and user workflows.

## Audit actions completed

- Scanned `src/` for upstream product names, domains, AGPL text, and branding identifiers: no matches remain.
- Replaced the element registry defaults with a new data-free model; removed embedded demo datasets and the default table script.
- New runtime rendering, persistence, validation, data resolution, print isolation, and tests are local implementation work.
- No upstream images or logo assets are included in the repository.

## Release gate

Before a commercial release, an authorized reviewer must inspect commit provenance and perform a legal comparison of the repository history against any reference source. Any module with material copying risk must be rewritten from product requirements and re-reviewed before release.
