import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { DecoratorMetaDataPayload, retrieveMetadataPayloadsOnMethod } from '##/index.js'

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
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnMethod(Test, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 1)
      assert.deepStrictEqual(data[0], cacheableArgs)
    })

    it('Test2', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnMethod(Test2, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 0)
    })

    it('TestClass', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnMethod(TestClass, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 0)
    })

    it('TestClass2', () => {
      const data: DecoratorMetaDataPayload[] = retrieveMetadataPayloadsOnMethod(TestClass2, METHOD_KEY_Cacheable, methodName)
      assert(Array.isArray(data))
      assert(data.length === 1)
      assert.deepStrictEqual(data[0], { ttl })
    })
  })

})

