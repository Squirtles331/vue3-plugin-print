import assert from 'node:assert/strict'
import { it } from 'vitest'
import { paginateRuntimeDocument } from '../src/print-designer/runtime/pagination.js'
import { createBlankTemplateDocument } from '../src/print-designer/template/templateDocument.js'

it('paginates 2,000 table rows within the local performance budget', () => {
  const rows = Array.from({ length: 2000 }, (_, index) => ({ id: index + 1, name: `Item ${index + 1}` }))
  const document = createBlankTemplateDocument({
    pages: [{ id: 'page-1', title: 'Page 1', elements: [{ id: 'items', type: 'table', x: 0, y: 0, width: 80, height: 80, props: { headerHeight: 8, rowHeight: 8, autoPaginate: true }, runtime: { table: { rows, footerRows: [] } }, style: {} }] }],
  })
  const startedAt = performance.now()
  const result = paginateRuntimeDocument(document)
  const elapsedMs = performance.now() - startedAt
  assert.ok(result.pageCount > 1)
  assert.ok(elapsedMs < 1000, `Pagination took ${elapsedMs.toFixed(1)}ms`)
})
