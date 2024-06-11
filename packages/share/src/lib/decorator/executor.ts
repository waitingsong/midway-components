/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/unbound-method */
import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import { JoinPoint, IMethodAspect } from '@midwayjs/core'

import { ConfigKey } from '../types.js'

import type {
  DecoratorHandlerBase,
  DecoratorExecutorParamBase,
} from './custom-decorator.types.js'
import { genExecutorOptionsCommon } from './reg-decorator-handler.helper.js'


export function genExecuteDecoratorHandlerAsync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchAsync(
      'before',
      options,
      decoratorHandlerInstance,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchAsync(
      'around',
      options,
      decoratorHandlerInstance,
      joinPoint,
      {},
    )
  }


  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchAsync(
      'afterReturn',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchAsync(
      'afterThrow',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { error },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchAsync(
      'after',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { methodResult: result, error },
    )
  }

  return aopCallback
}


export function genExecuteDecoratorHandlerSync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchSync(
      'before',
      options,
      decoratorHandlerInstance,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchSync(
      'around',
      options,
      decoratorHandlerInstance,
      joinPoint,
      {},
    )
  }


  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchSync(
      'afterReturn',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchSync(
      'afterThrow',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { error },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchSync(
      'after',
      options,
      decoratorHandlerInstance,
      joinPoint,
      { methodResult: result, error },
    )
  }

  return aopCallback
}

interface CustomIMethodAspect {
  before?: (joinPoint: JoinPoint) => unknown // return type is void
  around?: (joinPoint: JoinPoint) => unknown
  afterReturn?: (joinPoint: JoinPoint, result: unknown) => unknown
  afterThrow?: (joinPoint: JoinPoint, error: Error) => unknown // return type is void
  after?: (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => unknown // return type is void
}
interface AopDispatchOptions {
  methodResult?: DecoratorExecutorParamBase['methodResult']
  error?: DecoratorExecutorParamBase['error']
}

async function aopDispatchAsync(
  aopName: 'before' | 'around' | 'afterReturn' | 'afterThrow' | 'after',
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
  joinPoint: JoinPoint,
  extParam: AopDispatchOptions,
): Promise<unknown> {

  const { instanceName, methodName } = options
  assert(joinPoint.proceedIsAsyncFunction, `${instanceName}.${methodName}() must be async function`)
  // Do not check `isAsyncFunction(func)`, due to `around` may be sync function, let developer to handle it
  // assert(
  //   isAsyncFunction(func),
  //   `${decoratorHandlerClassName}.${func.name}() must be async function, due to method ${instanceName}.${methodName}() is async function`,
  // )

  const executorParam = await prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
  // assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')

  if (aopName === 'around' || aopName === 'afterReturn') {
    // @ts-expect-error - func defined
    const res = await decoratorHandlerInstance[aopName](executorParam)
    executorParam.methodResult = res
    return res
  }

  // @ts-expect-error - func defined
  return decoratorHandlerInstance[aopName](executorParam)
}

function aopDispatchSync(
  aopName: 'around' | 'before' | 'afterReturn' | 'afterThrow' | 'after',
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
  joinPoint: JoinPoint,
  extParam: AopDispatchOptions,
): unknown {

  const { decoratorHandlerClassName, instanceName, methodName } = options
  assert(! joinPoint.proceedIsAsyncFunction, `${instanceName}.${methodName}() must be sync function`)

  const func = decoratorHandlerInstance[aopName]
  assert(typeof func === 'function', 'before must be function')
  assert(
    ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] aopDispatchSync(): ${decoratorHandlerClassName}.${func.name}() must not be AsyncFunction, due to method ${instanceName}.${methodName}() is sync function, you can modify it to SyncFunction or return Promise value`,
  )

  const executorParam = prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
  assert(! isPromise(executorParam), 'aopDispatchSync() executorParam must not be Promise value')
  // assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')

  if (aopName === 'around' || aopName === 'afterReturn') {
    // @ts-expect-error - func defined
    const res = decoratorHandlerInstance[aopName](executorParam)
    assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value`)
    executorParam.methodResult = res
    return res
  }

  // @ts-expect-error
  return decoratorHandlerInstance[aopName](executorParam)
}


const decoratorExecutorParamCache = new WeakMap<DecoratorExecutorParamBase['methodArgs'], DecoratorExecutorParamBase>()

/**
 * @description decoratorHandlerInstance will be add property `ctx` to itself
 */
function prepareOptions(
  aopName: 'before' | 'around' | 'afterReturn' | 'afterThrow' | 'after',
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

  const cache = retrieveDecoratorExecutorParam(joinPoint.args) // not use options.methodArgs
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
    return Object.keys(extParam).length ? Object.assign(cache, extParam) : cache
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

  if (aopName !== 'after') {
    saveDecoratorExecutorParam(joinPoint.args, executorParam)
  }
  return executorParam
}

function saveDecoratorExecutorParam(
  src: DecoratorExecutorParamBase['methodArgs'],
  data: DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase>,
): void {

  assert(typeof src === 'object', 'src must be object')

  if (isPromise(data)) {
    void data.then((ret) => {
      decoratorExecutorParamCache.set(src, ret)
    }).catch(err => console.error(err))
    return
  }
  decoratorExecutorParamCache.set(src, data)
}
function retrieveDecoratorExecutorParam(src: DecoratorExecutorParamBase['methodArgs'] | undefined): DecoratorExecutorParamBase | undefined {
  return src ? decoratorExecutorParamCache.get(src) : void 0
}

