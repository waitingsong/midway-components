import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { PageOrderByRule, PagingDTO } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('PageOrderByRule', () => {
    it('normal', () => {
      const inst = new PageOrderByRule()
      assert(Object.prototype.hasOwnProperty.call(inst, 'column'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'order'))
    })
  })


  describe('PagingDTO ', () => {
    it('normal', () => {
      const inst = new PagingDTO()
      assert(Object.prototype.hasOwnProperty.call(inst, 'page'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'pageSize'))
      assert(Object.prototype.hasOwnProperty.call(inst, 'orderBy'))
    })
  })
})

