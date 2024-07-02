import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { retrieveMetadataPayloadsOnClass } from '##/index.js'
import type { DecoratorMetaDataPayload } from '##/index.js'

import {
  CacheableArgs,
  cacheableArgs,
  METHOD_KEY_Cacheable,
  Test,
  Test2,
  TestClass,
  TestClass2,
  ttl,
} from './110.helper.js'


describe(fileShortPath(import.meta.url), () => {
  const methodName = '_simple'

  describe('Should retrieveMetadataPayloadsOnMethod() work', () => {
    it('Test', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnClass(Test, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 0)
    })

    it('Test2', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnClass(Test2, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 0)
    })

    it('TestClass', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnClass(TestClass, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 0)
    })

    it('TestClass2', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnClass(TestClass2, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 1)
      assert.deepStrictEqual(data[0], cacheableArgs)
    })
  })

})

