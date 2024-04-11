import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { DecoratorMetaData, isMethodDecoratedWith } from '##/index.js'

import { METHOD_KEY_Cacheable, Test } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should isMethodDecoratedWith() work`, () => {
    it(`empty`, () => {
      const key = 'decorator:method_key_cacheable_test'
      const methodName = '_simple'

      const target = {}
      const map = isMethodDecoratedWith(target, methodName, [key])
      assert(map.size === 0)
    })

    it(`method`, () => {
      const methodName = '_simple'
      const row: DecoratorMetaData = {
        key: METHOD_KEY_Cacheable,
        metadata: { decoratedType: 'method' },
        propertyName: methodName,
        options: {
          impl: true,
        },
      }

      const map = isMethodDecoratedWith(Test, methodName, [METHOD_KEY_Cacheable])
      assert(map.size)
      let find = false
      for (const key of map) {
        if (key === METHOD_KEY_Cacheable) {
          find = true
          break
        }
      }
      assert(find)
    })

  })

})
