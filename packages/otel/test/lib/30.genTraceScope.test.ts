import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { GenTraceScopeOptions, genTraceScope } from '##/lib/decorator.helper.js'


describe(fileShortPath(import.meta.url), function () {

  const decoratorContext = {
    webApp: void 0,
    webContext: void 0,
    otelComponent: void 0,
    traceService: void 0,
    traceScope: void 0,
    instanceName: 'DecoratorDataComponentController',
    methodName: 'traceDecoratorDataAsync',
  }
  const base: GenTraceScopeOptions = {
    scope: void 0,
    methodArgs: [],
    decoratorContext,
  }

  describe('Should genTraceScope() work', () => {
    it('string', async () => {
      const opt: GenTraceScopeOptions = {
        ...base,
      }
      opt.scope = Math.random().toString(36).substring(7)
      const ret1 = genTraceScope(opt)
      assert(typeof ret1 === 'symbol')

      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)

      opt.scope = Math.random().toString(36).substring(7)
      const ret3 = genTraceScope(opt)
      assert(ret1 !== ret3)
    })

    it('symbol', async () => {
      const opt: GenTraceScopeOptions = {
        ...base,
      }
      opt.scope = Symbol('foo')
      const ret1 = genTraceScope(opt)
      assert(typeof ret1 === 'symbol')

      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)

      opt.scope = Symbol('foo')
      const ret3 = genTraceScope(opt)
      assert(ret1 !== ret3)
    })

    it('undefined', async () => {
      const opt: GenTraceScopeOptions = {
        ...base,
      }
      const ret1 = genTraceScope(opt)
      assert(typeof ret1 === 'undefined')
    })

    it('object', async () => {
      const scope = { foo: 1 }
      const opt: GenTraceScopeOptions = {
        ...base,
        scope,
      }
      const ret1 = genTraceScope(opt)
      assert(ret1 === scope)

      scope.foo = 2
      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)
    })

    it('array', async () => {
      const scope: unknown[] = []
      const opt: GenTraceScopeOptions = {
        ...base,
        scope,
      }
      const ret1 = genTraceScope(opt)
      assert(ret1 === scope)

      scope.push(1)
      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)
    })

    it('function return object', async () => {
      const obj = { foo: 1 }
      const scope = () => {
        return obj
      }
      const opt: GenTraceScopeOptions = {
        ...base,
        scope,
      }
      const ret1 = genTraceScope(opt)
      assert(ret1 === obj)

      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)
    })

    it('function return symbol', async () => {
      const sym = Symbol('foo')
      const scope = () => {
        return sym
      }
      const opt: GenTraceScopeOptions = {
        ...base,
        scope,
      }
      const ret1 = genTraceScope(opt)
      assert(ret1 === sym)

      const ret2 = genTraceScope(opt)
      assert(ret1 === ret2)
    })
  })

})

