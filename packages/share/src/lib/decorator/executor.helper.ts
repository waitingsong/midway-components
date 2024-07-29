import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { JoinPoint } from '@midwayjs/core'

import { type Application } from '../types.js'

import type { DecoratorExecutorParamBase, DecoratorHandlerBase } from './custom-decorator.types.js'
import { genExecutorOptionsCommon } from './reg-decorator-handler.helper.js'


export type AopName = 'before' | 'around' | 'afterReturn' | 'afterThrow' | 'after'

export interface DecoratorHandlerInternal {
  readonly app: Application
  genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase>
  before(options: DecoratorExecutorParamBase): void | Promise<void>
  around(options: DecoratorExecutorParamBase): unknown
  afterReturn(options: DecoratorExecutorParamBase): unknown
  afterThrow(options: DecoratorExecutorParamBase): void
  after(options: DecoratorExecutorParamBase): void
}

export interface CustomIMethodAspect {
  before?: (joinPoint: JoinPoint) => unknown // return type is void
  around?: (joinPoint: JoinPoint) => unknown
  afterReturn?: (joinPoint: JoinPoint, result: unknown) => unknown
  afterThrow?: (joinPoint: JoinPoint, error: Error) => unknown // return type is void
  after?: (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => unknown // return type is void
}
export interface AopDispatchOptions {
  methodResult?: DecoratorExecutorParamBase['methodResult']
  error?: DecoratorExecutorParamBase['error']
}

const decoratorExecutorParamCache = new WeakMap<DecoratorExecutorParamBase['methodArgs'], DecoratorExecutorParamBase>()

export function removeDecoratorExecutorParamCache(src: DecoratorExecutorParamBase['methodArgs']): void {
  assert(typeof src === 'object', 'src must be object')
  decoratorExecutorParamCache.delete(src)
}

function saveDecoratorExecutorParamCache(
  src: DecoratorExecutorParamBase['methodArgs'],
  data: DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase>,
): void {

  assert(typeof src === 'object', 'src must be object')

  if (isPromise(data)) {
    void data.then((ret) => {
      decoratorExecutorParamCache.set(src, ret)
    }).catch((err) => { console.error(err) })
    return
  }
  decoratorExecutorParamCache.set(src, data)
}

function retrieveDecoratorExecutorParam(src: DecoratorExecutorParamBase['methodArgs'] | undefined): DecoratorExecutorParamBase | undefined {
  return src ? decoratorExecutorParamCache.get(src) : void 0
}

// #region prepareOptions

/**
 * @description decoratorHandlerInstance will be add property `ctx` to itself
 */
export function prepareOptions(
  aopName: AopName,
  options: DecoratorExecutorParamBase,
  joinPoint: JoinPoint,
  decoratorHandlerInstance: DecoratorHandlerBase,
  extParam: AopDispatchOptions,
): DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase> {

  switch (aopName) {
    case 'before': {
      assert(typeof options.methodResult === 'undefined', `methodResult must be undefined in ${aopName}() lifecycle`)
      assert(typeof extParam.methodResult === 'undefined', `extParam.methodResult must be undefined at the beginning of ${aopName}() lifecycle`)
      break
    }

    case 'around':
      assert(typeof extParam.methodResult === 'undefined', `extParam.methodResult must be undefined at the beginning of ${aopName}() lifecycle`)
      break

    default:
      break
  }

  let cache = retrieveDecoratorExecutorParam(joinPoint.args) // not use options.methodArgs
  if (cache) {
    switch (aopName) {
      /* c8 ignore next 2 */
      case 'before':
        throw new Error('before() should not return value with cache')

      case 'after':
        decoratorExecutorParamCache.delete(joinPoint.args)
        break

      default:
        break
    }
    /* c8 ignore next 3 */
    if (['before'].includes(aopName)) {
      assert(typeof cache.methodResult === 'undefined', `result must be undefined in ${aopName}() lifecycle`)
    }
    if (Object.keys(extParam).length) {
      cache = Object.assign(cache, extParam) // update cache item
    }
    return cache
  }

  const executorParamBase: DecoratorExecutorParamBase = genExecutorOptionsCommon(
    joinPoint,
    options,
    extParam,
  )
  const executorParam = typeof decoratorHandlerInstance.genExecutorParam === 'function'
    ? decoratorHandlerInstance.genExecutorParam(executorParamBase)
    /* c8 ignore next */
    : executorParamBase

  saveDecoratorExecutorParamCache(joinPoint.args, executorParam)
  return executorParam
}

