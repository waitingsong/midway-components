import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { commonValidSchemas } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {
  describe('commonValidSchemas.snowflakeIdValidator', () => {
    it('valid 0', () => {
      const value = '0'
      const ret = commonValidSchemas.snowflakeString.validate(value)
      assert(! ret.error, ret.error)
      assert(ret.value === value)
    })

    it('valid max', () => {
      const value = '9223372036854775807'
      const ret = commonValidSchemas.snowflakeString.validate(value)
      assert(! ret.error, ret.error)
      assert(ret.value === value)
    })

    it('invalid -1', () => {
      const ret = commonValidSchemas.snowflakeString.validate('-1')
      assert(ret.error, 'should throw error')
    })

    it('invalid string', () => {
      const ret = commonValidSchemas.snowflakeString.validate('1n')
      assert(ret.error, 'should throw error')
    })

    it('invalid max+1', () => {
      const value = '9223372036854775808'
      const ret = commonValidSchemas.snowflakeString.validate(value)
      assert(ret.error, 'should throw error')
    })
  })
})

