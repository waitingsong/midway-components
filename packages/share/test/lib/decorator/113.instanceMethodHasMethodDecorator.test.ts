import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { instanceMethodHasMethodDecorator } from '##/index.js'

import { METHOD_KEY_Cacheable, Test, Test2, TestClass } from './110.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should instanceMethodHasMethodDecorator() work`, () => {
    it(`normal`, () => {
      const methodName = '_simple'
      const ret = instanceMethodHasMethodDecorator(Test, METHOD_KEY_Cacheable, methodName)
      assert(ret)
    })

    it(`normal2 `, () => {
      const methodName = '_simple'
      const ret = instanceMethodHasMethodDecorator(TestClass, METHOD_KEY_Cacheable, methodName)
      assert(! ret)
    })

    it(`not decorated`, () => {
      const methodName = '_simple'
      const ret = instanceMethodHasMethodDecorator(Test2, METHOD_KEY_Cacheable, methodName)
      assert(! ret)
    })

    it(`invalid key`, () => {
      const methodName = '_simple'
      const ret = instanceMethodHasMethodDecorator(Test, METHOD_KEY_Cacheable + Math.random().toString(), methodName)
      assert(! ret)
    })

    it(`invalid method`, () => {
      const methodName = '_simple2'
      const ret = instanceMethodHasMethodDecorator(Test, METHOD_KEY_Cacheable, methodName)
      assert(! ret)
    })

  })
})

