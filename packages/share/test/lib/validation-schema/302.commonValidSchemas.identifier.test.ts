import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { commonValidSchemas } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {
  describe('commonValidSchemas.identifier', () => {
    it('valid 1', () => {
      const value = 'a'
      const ret = commonValidSchemas.identifier.validate(value)
      assert(! ret.error, ret.error)
      assert(ret.value === value)
    })

    it('valid 2', () => {
      const value = 'aA0_'
      const ret = commonValidSchemas.identifier.validate(value)
      assert(! ret.error, ret.error)
      assert(ret.value === value)
    })

    it('invalid 1', () => {
      const ret = commonValidSchemas.identifier.validate('-a')
      assert(ret.error, 'should throw error')
    })

    it('invalid 2', () => {
      const ret = commonValidSchemas.identifier.validate('_a')
      assert(ret.error, 'should throw error')
    })

    it('invalid 3', () => {
      const ret = commonValidSchemas.identifier.validate('1a')
      assert(ret.error, 'should throw error')
    })

    it('invalid 4', () => {
      const value = 'a-'
      const ret = commonValidSchemas.identifier.validate(value)
      assert(ret.error, 'should throw error')
    })

    it('invalid 5', () => {
      const value = 'a.'
      const ret = commonValidSchemas.identifier.validate(value)
      assert(ret.error, 'should throw error')
    })
  })
})

