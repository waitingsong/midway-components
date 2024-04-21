/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'
import { fileShortPath } from '@waiting/shared-core'

import { setImplToFalseIfDecoratedWithBothClassAndMethod } from '##/index.js'
import { DecoratorMetaData } from '##/lib/decorator/custom-decorator.types.js'

import { METHOD_KEY_Cacheable, ttl, Test, Test2, TestClass, TestClass2 } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should setImplToFalseIfDecoratedWithBothClassAndMethod() work`, () => {
    it(`normal`, () => {
      setImplToFalseIfDecoratedWithBothClassAndMethod(TestClass2, METHOD_KEY_Cacheable, [METHOD_KEY_Cacheable])
      const arr = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, TestClass2)
      /*
      const expect = [
        {
          key: 'decorator:method_key_cacheable_test',
          metadata: { ttl, decoratedType: 'method' },
          propertyName: '_simple',
          options: { impl: true },
        },
        {
          key: 'decorator:method_key_cacheable_test',
          metadata: { decoratedType: 'class' },
          propertyName: '_simple',
          options: { impl: false },
        },
      ] */
      arr.forEach((row) => {
        assert(row)
        const { metadata, options } = row
        if (metadata.decoratedType === 'method') {
          assert(options?.impl === true)
        }
        else if (metadata.decoratedType === 'class') {
          assert(options?.impl === false)
        }
      })
    })

    it(`normal 2`, () => {
      const arr = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, TestClass2)
      arr.forEach((row) => {
        assert(row)
        const { metadata, options } = row
        if (metadata.decoratedType === 'class') {
          assert(options?.impl === false)
          row.options = {
            impl: true,
          }
        }
      })
      setImplToFalseIfDecoratedWithBothClassAndMethod(TestClass2, METHOD_KEY_Cacheable, [METHOD_KEY_Cacheable])

      const arr2 = getClassMetadata<DecoratorMetaData[]>(INJECT_CUSTOM_METHOD, TestClass2)
      arr2.forEach((row) => {
        assert(row)
        const { metadata, options } = row
        if (metadata.decoratedType === 'method') {
          assert(options?.impl === true)
        }
        else if (metadata.decoratedType === 'class') {
          assert(options?.impl === false)
        }
      })
    })

    it(`normal 3`, () => {
      setImplToFalseIfDecoratedWithBothClassAndMethod(Test, METHOD_KEY_Cacheable, [METHOD_KEY_Cacheable])
      setImplToFalseIfDecoratedWithBothClassAndMethod(Test, METHOD_KEY_Cacheable + Math.random().toString(), [METHOD_KEY_Cacheable])
      setImplToFalseIfDecoratedWithBothClassAndMethod(Test2, METHOD_KEY_Cacheable, [METHOD_KEY_Cacheable])
    })
  })

})

