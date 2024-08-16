import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { commonValidSchemas } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {
  describe('commonValidSchemas.bigint', () => {
    it('valid', () => {
      const value = '123456789012345678901234567890'
      const ret = commonValidSchemas.bigintString.validate(value)
      assert(! ret.error, ret.error)
      assert(ret.value === value)
    })

    it('invalid', () => {
      const ret = commonValidSchemas.bigintString.validate('1n')
      assert(ret.error, 'should throw error')
    })

    it('invalid2', () => {
      const ret = commonValidSchemas.bigintString.validate('a1n')
      assert(ret.error, 'should throw error')
    })
  })
})

