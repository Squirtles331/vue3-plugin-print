## Context

The table element already supports configurable columns, a bound data array, authored sample rows, and authored footer rows. Its default insertion flow, however, creates an empty generic grid; the runtime renderer also applies the element's fixed box border and height around the inner HTML table. This produces an empty rectangle rather than a printable line-item table.

## Goals / Non-Goals

**Goals:**

- Make the default dragged table a five-column line-item example with realistic sample rows and totals.
- Keep the element generic: users can still change columns, bind a different array, or choose a custom empty grid.
- Use the same summary token values in designer, runtime preview, and browser printing.
- Let runtime table content determine its visual height so no-data and short tables do not show a trailing boxed void.

**Non-Goals:**

- Introduce a separate invoice/document element or a full accounting engine.
- Add arbitrary spreadsheet formulas, cell merging, or per-cell style rules.
- Change the existing data binding syntax or table pagination API.

## Decisions

### Use a line-item preset as the default table insertion

The insert dialog will default to the existing sample-data mode, five columns, and 26 rows. The five columns use stable keys `id`, `name`, `qty`, `price`, and `total`, which lets the existing property editor remain generic while presenting the requested layout. Choosing custom mode continues to create an editable empty grid.

### Represent totals as authored footer rows with summary tokens

The preset will add three normal `footerData` rows: page subtotal, grand total, and uppercase amount. The existing `{#pageQty}`, `{#totalQty}`, `{#pageSum}`, `{#totalSum}`, and `{#totalCap}` tokens remain the public authored format. A shared core helper will calculate and replace the values from the active rows so the designer and runtime do not drift.

### Render table content without the generic element box in runtime

For table elements, `RuntimeDocument` will leave height and border ownership to the native table rather than its absolutely positioned wrapper. The persisted height remains the row-capacity input for pagination, but it will not reserve a visibly empty area below the final row.

### Keep empty tables compact

When no data is available, runtime preview will render one compact no-data grid row. It will not draw an additional fixed-height frame. Print mode continues to suppress preview-only placeholder text.

## Risks / Trade-offs

- [Existing tables rely on the wrapper border as a visual frame] → The inner table already draws cell borders; only runtime table elements opt out of the redundant wrapper border.
- [Footer tokens could be authored against non-standard quantity or amount fields] → Preserve the existing `qty` and `total` convention for the supplied preset and leave manually authored footer values unchanged.
- [Large bound arrays exceed the persisted table height] → Retain the existing pagination calculation based on `height`, header height, row height, and footer height.

## Migration Plan

1. Add shared table summary utilities and use them in both canvas and runtime rendering.
2. Change default table columns, sample rows, footer rows, and insertion defaults to the line-item preset.
3. Adjust runtime table wrapper sizing and borders.
4. Add focused tests for preset generation and summary formatting; verify preview and print behavior.

Rollback consists of restoring the previous generic insertion defaults. Existing saved templates remain compatible because their persisted props are not rewritten.
