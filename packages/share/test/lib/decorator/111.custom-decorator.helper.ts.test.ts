import assert from 'node:assert/strict'

import { INJECT_CUSTOM_METHOD, saveClassMetadata } from '@midwayjs/core'
import { fileShortPath } from '@waiting/shared-core'

import {
  DecoratorMetaData,
  customDecoratorFactory,
  isMethodDecoratedWith,
  methodHasDecorated,
} from '##/index.js'


const METHOD_KEY_Cacheable = 'decorator:method_key_cacheable_test'

class Test {

  @Cacheable({
    cacheName: 'test',
    ttl: 10,
  })
  _simple() {
    return 'simple'
  }

}

describe(fileShortPath(import.meta.url), () => {

  describe(`Should methodHasDecorated() work`, () => {
    it(`empty`, () => {
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


function Cacheable(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory<CacheableArgs>({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable,
    enableClassDecorator: true,
  })
}


interface CacheableArgs {
  cacheName: string | undefined
  ttl: number | undefined
}
