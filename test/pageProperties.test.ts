import assert from 'node:assert/strict'
import { it } from 'vitest'
import { createRuntimePageStyle, hasRuntimePrintMarks } from '../src/print-designer/runtime/pageStyle.js'
import { createBlankTemplateDocument, serializeTemplateDocument, validateTemplateDocument } from '../src/print-designer/template/templateDocument.js'

it('serializes canonical four-side page settings and print marks', () => {
  const document = createBlankTemplateDocument({
    pageSettings: {
      paper: { preset: 'custom', widthMm: 120, heightMm: 80 },
      margin: { top: 4, right: 5, bottom: 6, left: 7 },
      background: '#fff7ed',
      printMarks: { visible: true },
    },
  })
  const result = serializeTemplateDocument(document)
  const style = createRuntimePageStyle(result.document)
  assert.equal(result.valid, true)
  assert.deepEqual(result.document.pageSettings.margin, { top: 4, right: 5, bottom: 6, left: 7 })
  assert.equal(style.width, '120mm')
  assert.equal(style.minHeight, '80mm')
  assert.equal(style.background, '#fff7ed')
  assert.equal(hasRuntimePrintMarks(result.document), true)
})
it('rejects margins with no printable area while retaining canonical settings', () => {
  const document = createBlankTemplateDocument()
  document.pageSettings.margin = { top: 150, right: 110, bottom: 150, left: 110 }
  const result = validateTemplateDocument(document)
  assert.equal(result.valid, false)
  assert.ok(result.issues.some(issue => issue.path === 'pageSettings.margin'))
})
