import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  methodHasDecorated,
  DecoratorMetaData,
} from '##/index.js'


describe(fileShortPath(import.meta.url), () => {
  describe(`Should methodHasDecorated() work`, () => {

    it(`empty`, () => {
      const METHOD_KEY_Cacheable = 'cacheable_test'
      const methodName = 'test'

      const ret1 = methodHasDecorated(METHOD_KEY_Cacheable, methodName, [], true)
      assert(! ret1)

      const ret2 = methodHasDecorated(METHOD_KEY_Cacheable, '', [], true)
      assert(! ret2)
    })

    it(`options undefined`, () => {
      const key = 'decorator:method_key_cacheable_test'
      const methodName = '_simple'
      const row: DecoratorMetaData = {
        key,
        metadata: { decoratedType: 'method' },
        propertyName: methodName,
        options: void 0,
      }

      const ret1 = methodHasDecorated(key, methodName, [row])
      assert(ret1)
      const ret2 = methodHasDecorated(key, methodName, [row], true)
      assert(! ret2)
    })

    it(`normal`, () => {
      const key = 'decorator:method_key_cacheable_test'
      const methodName = '_simple'
      const row: DecoratorMetaData = {
        key,
        metadata: { decoratedType: 'method' },
        propertyName: methodName,
        options: {
          impl: true,
        },
      }

      const ret1 = methodHasDecorated(key, methodName, [row])
      assert(ret1)
      const ret2 = methodHasDecorated(key, methodName, [row], true)
      assert(ret2)
      const ret3 = methodHasDecorated(key, methodName, [row], false)
      assert(! ret3)


      assert(typeof row.options === 'object' && row.options)
      row.options.impl = false

      const ret4 = methodHasDecorated(key, methodName, [row])
      assert(ret4)
      const ret5 = methodHasDecorated(key, methodName, [row], true)
      assert(! ret5)
      const ret6 = methodHasDecorated(key, methodName, [row], false)
      assert(ret6)
    })

  })
})

