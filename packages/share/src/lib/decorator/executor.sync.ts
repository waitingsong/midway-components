import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import type { JoinPoint, IMethodAspect } from '@midwayjs/core'

import { ConfigKey } from '../types.js'

import type { DecoratorHandlerBase, DecoratorExecutorParamBase } from './custom-decorator.types.js'
import {
  type AopName,
  type DecoratorHandlerInternal,
  type CustomIMethodAspect,
  type AopDispatchOptions,
  prepareOptions,
} from './executor.helper.js'


export function genExecuteDecoratorHandlerSync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchSync(
      'before',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchSync(
      'around',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchSync(
      'afterReturn',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchSync(
      'afterThrow',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { error },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchSync(
      'after',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result, error },
    )
  }

  return aopCallback
}


export function aopDispatchSync(
  aopName: AopName,
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerInternal,
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
    const res = decoratorHandlerInstance[aopName](executorParam)
    assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value`)
    executorParam.methodResult = res
    return res
  }

  return decoratorHandlerInstance[aopName](executorParam)
}


