# Commercial edition capabilities

This project is a standalone Vue 3 print-template designer. The first commercial-release scope is browser-based template authoring, local or REST-backed persistence, business-JSON preview, and browser-native printing.

## Template workflow

- Start from independently authored sales, dispatch, label-sheet, or blank-page templates.
- Save and reopen versioned `TemplateDocument v1` documents.
- Import and export a validated versioned JSON interchange envelope.
- Save reusable element presets locally and insert isolated copies into the current page.

## Page, element, and data features

- Configure paper preset/custom dimensions, orientation, four margins, page background, and optional print marks.
- Design text, image, barcode, QR code, page number, line, rectangle, circle, table, and multi-label elements.
- Bind values from one runtime JSON object using dot and array-index paths such as `customer.name` and `items[0].sku`.
- Missing values remain explicit in preview/print output; the runtime never fills in sample business data.
- Tables and label grids accept array bindings. Table transforms use constrained declarative JSON, never arbitrary JavaScript.
- Runtime JSON cannot replace template layout, colour, typography, column definitions, pagination settings, or other static presentation choices.
- Table columns use a stable key plus an optional safe nested `valuePath`; labels use explicit primary, secondary, and tertiary paths.
- Automatic text height, image fit/position, barcode/QR presentation, page numbering, line/shape styling, table pagination, and label-grid spacing are all stored in `TemplateDocument v1` and reflected by the standalone output renderer.

## Layout workflow

Use Shift/Ctrl/Command click to form a multi-selection. The layout toolbar can duplicate, move to front/back, align, and distribute selected editable elements. Commands are measured in document millimetres and each action has a single undo/redo entry. Locked elements cannot be changed by these commands. Elements stay within the page unless overflow mode is intentionally enabled in the editor.

## Output and non-goals

Preview and browser print share the same standalone runtime renderer, page geometry, and pagination. Editor selection frames, guides, and controls are excluded from print output.

PDF generation, silent printing, cloud printing, server rendering, and collaborative editing are out of scope for this first release.
