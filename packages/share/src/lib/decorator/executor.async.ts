import assert from 'node:assert'

import type { JoinPoint, IMethodAspect } from '@midwayjs/core'

import type { DecoratorHandlerBase, DecoratorExecutorParamBase } from './custom-decorator.types.js'
import {
  type AopName,
  type DecoratorHandlerInternal,
  type CustomIMethodAspect,
  type AopDispatchOptions,
  prepareOptions,
} from './executor.helper.js'


export function genExecuteDecoratorHandlerAsync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchAsync(
      'before',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchAsync(
      'around',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }


  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchAsync(
      'afterReturn',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchAsync(
      'afterThrow',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { error },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchAsync(
      'after',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result, error },
    )
  }

  return aopCallback
}



async function aopDispatchAsync(
  aopName: AopName,
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerInternal,
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
    const res = await decoratorHandlerInstance[aopName](executorParam)
    executorParam.methodResult = res
    return res
  }
  else if (aopName === 'afterThrow') {
    decoratorHandlerInstance[aopName](executorParam); return
  }

  const resp = decoratorHandlerInstance[aopName](executorParam)
  return resp
}

