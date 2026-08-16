import assert from 'node:assert/strict'
import { it } from 'vitest'
import { fieldErrorKey, getFieldError } from '../src/print-designer/editor/panels/fieldErrorState.js'

it('field error helpers treat an absent field as an empty error state', () => {
  assert.equal(fieldErrorKey(undefined), '')
  assert.equal(getFieldError({ 'props:format': 'invalid format' }, undefined), '')
  assert.equal(getFieldError({ 'props:format': 'invalid format' }, { source: 'props', key: 'format' }), 'invalid format')
})
