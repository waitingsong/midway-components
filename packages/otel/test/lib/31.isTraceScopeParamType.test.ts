import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { isTraceScopeParamType } from '##/lib/decorator.helper.base.js'


describe(fileShortPath(import.meta.url), function () {

  describe('Should isTraceScopeParamType() work', () => {
    it('string', async () => {
      const ret = isTraceScopeParamType('foo')
      assert(ret)
    })

    it('symbol', async () => {
      const ret = isTraceScopeParamType(Symbol('foo'))
      assert(ret)
    })

    it('object', async () => {
      const scope = { foo: 1 }
      const ret = isTraceScopeParamType(scope)
      assert(ret)
    })

    it('array', async () => {
      const fake: unknown[] = []
      const ret = isTraceScopeParamType(fake)
      assert(ret)
    })

    it('undefined', async () => {
      const ret = isTraceScopeParamType(void 0)
      assert(! ret)
    })

    it('function invalid', async () => {
      const obj = { foo: 1 }
      const scope = () => {
        return obj
      }
      const ret = isTraceScopeParamType(scope)
      assert(! ret)
    })
  })

})

