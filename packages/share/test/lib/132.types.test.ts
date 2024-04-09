import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { PagingResult } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('PagingResult', () => {
    it('normal', () => {
      const inst = new PagingResult()
      assert(Object.prototype.hasOwnProperty.call(inst, 'total'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'page'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'pageSize'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'rows'))
    })
  })

})

