## 1. Table preset and summary model

- [x] 1.1 Add shared helpers for quantity, amount, uppercase-amount, and summary-token formatting.
- [x] 1.2 Make the default sample table an ID/name/quantity/unit-price/total line-item preset with 26 sample rows and three summary footer rows.
- [x] 1.3 Keep custom table insertion empty while preserving its configured column and row counts.

## 2. Renderer implementation

- [x] 2.1 Use shared summary-token formatting in the designer table renderer.
- [x] 2.2 Use shared summary-token formatting in runtime preview and print rendering.
- [x] 2.3 Remove the redundant fixed-height/border wrapper from runtime table elements and retain a compact no-data row.

## 3. Verification

- [x] 3.1 Add focused tests for the line-item preset and summary-token formatting.
- [x] 3.2 Run lint, unit tests, and a production preview check of populated and empty tables.
