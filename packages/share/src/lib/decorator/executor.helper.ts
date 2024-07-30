import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { JoinPoint } from '@midwayjs/core'
import { genError } from '@waiting/shared-core'
import type { AsyncMethodType, MethodTypeUnknown } from '@waiting/shared-types'

import { type Application } from '../types.js'

import type { DecoratorExecutorParamBase, DecoratorHandlerBase } from './custom-decorator.types.js'
import { AopLifeCycle } from './custom-decorator.types.js'
import { genExecutorOptionsCommon } from './reg-decorator-handler.helper.js'


export interface DecoratorHandlerInternal {
  readonly app: Application
  [AopLifeCycle.genExecutorParam](options: DecoratorExecutorParamBase): DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase>
  [AopLifeCycle.before](options: DecoratorExecutorParamBase): void | Promise<void>
  [AopLifeCycle.around](options: DecoratorExecutorParamBase): unknown
  [AopLifeCycle.afterReturn](options: DecoratorExecutorParamBase): unknown
  [AopLifeCycle.afterThrow](options: DecoratorExecutorParamBase): void
  [AopLifeCycle.after](options: DecoratorExecutorParamBase): void
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
  aopName: AopLifeCycle,
  options: DecoratorExecutorParamBase,
  joinPoint: JoinPoint,
  decoratorHandlerInstance: DecoratorHandlerBase,
  extParam: AopDispatchOptions,
): DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase> {

  switch (aopName) {
    case AopLifeCycle.before: {
      assert(typeof options.methodResult === 'undefined', `methodResult must be undefined in ${aopName}() lifecycle`)
      assert(typeof extParam.methodResult === 'undefined', `extParam.methodResult must be undefined at the beginning of ${aopName}() lifecycle`)
      break
    }

    case AopLifeCycle.around:
      assert(typeof extParam.methodResult === 'undefined', `extParam.methodResult must be undefined at the beginning of ${aopName}() lifecycle`)
      break

    default:
      break
  }

  let cache = retrieveDecoratorExecutorParam(joinPoint.args) // not use options.methodArgs
  if (cache) {
    switch (aopName) {
      /* c8 ignore next 2 */
      case AopLifeCycle.before:
        throw new Error('before() should not return value with cache')

      case AopLifeCycle.after:
        decoratorExecutorParamCache.delete(joinPoint.args)
        break

      default:
        break
    }
    /* c8 ignore next 3 */
    if ([AopLifeCycle.before].includes(aopName)) {
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

// #region processAllErrorAsync

export async function processAllErrorAsync(
  decoratorHandlerInstance: DecoratorHandlerInternal,
  executorParam: DecoratorExecutorParamBase,
  error: unknown,
): Promise<void> {

  executorParam.error = genError({ error })
  executorParam.methodResult = void 0

  const afterThrow = decoratorHandlerInstance['afterThrow'] as AsyncMethodType

  if (typeof afterThrow !== 'function') {
    executorParam.errorProcessed.push(AopLifeCycle.afterThrow)
    throw error
  }

  try {
    await Reflect.apply(afterThrow, decoratorHandlerInstance, [executorParam])
    // if afterThrow eat the error, then reset it
    executorParam.errorProcessed = []
    executorParam.error = void 0
  }
  finally {
    if (executorParam.error) {
      executorParam.errorProcessed.push(AopLifeCycle.afterThrow)
    }
    else {
      executorParam.errorProcessed = []
    }
  }
}

// #region processAllErrorSync

export function processAllErrorSync(
  decoratorHandlerInstance: DecoratorHandlerInternal,
  executorParam: DecoratorExecutorParamBase,
  error: unknown,
): void {

  executorParam.error = genError({ error })
  executorParam.methodResult = void 0

  const afterThrow = decoratorHandlerInstance['afterThrow'] as MethodTypeUnknown

  if (typeof afterThrow !== 'function') {
    executorParam.errorProcessed.push(AopLifeCycle.afterThrow)
    throw error
  }

  try {
    Reflect.apply(afterThrow, decoratorHandlerInstance, [executorParam])
    // if afterThrow eat the error, then reset it
    executorParam.errorProcessed = []
    executorParam.error = void 0
  }
  finally {
    if (executorParam.error) {
      executorParam.errorProcessed.push(AopLifeCycle.afterThrow)
    }
    else {
      executorParam.errorProcessed = []
    }
  }
}
