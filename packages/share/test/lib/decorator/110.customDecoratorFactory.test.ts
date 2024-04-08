import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { customDecoratorFactory } from '##/index.js'

import { CacheableArgs } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {
  describe(`Should customDecoratorFactory() work`, () => {

    it(`normal`, () => {
      const options = {
        cacheName: 'test',
        ttl: 10,
      }
      const METHOD_KEY_Cacheable = 'cacheable_test'

      const decoratorFactory = customDecoratorFactory<CacheableArgs>({
        decoratorArgs: options,
        decoratorKey: METHOD_KEY_Cacheable,
        enableClassDecorator: true,
      })
      assert(decoratorFactory)
      assert(decoratorFactory.name === 'DecoratorFactory')
    })

  })
})


