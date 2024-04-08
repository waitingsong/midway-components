import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { instanceHasClassDecorator } from '##/index.js'

import { METHOD_KEY_Cacheable, Test, Test2, TestClass } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should instanceHasClassDecorator() work`, () => {
    it(`false`, () => {
      assert(! instanceHasClassDecorator(Test, METHOD_KEY_Cacheable))
      assert(! instanceHasClassDecorator(Test2, METHOD_KEY_Cacheable))
      assert(! instanceHasClassDecorator(Test, METHOD_KEY_Cacheable + Math.random().toString()))
    })

    it(`true`, () => {
      const ret = instanceHasClassDecorator(TestClass, METHOD_KEY_Cacheable)
      assert(ret)
    })
  })

})

