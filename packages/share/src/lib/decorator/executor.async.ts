import assert from 'node:assert'

import type { JoinPoint, IMethodAspect } from '@midwayjs/core'
import type { AsyncMethodType } from '@waiting/shared-types'

import type { DecoratorHandlerBase, DecoratorExecutorParamBase } from './custom-decorator.types.js'
import { AopLifeCycle } from './custom-decorator.types.js'
import {
  type DecoratorHandlerInternal,
  type CustomIMethodAspect,
  type AopDispatchOptions,
  prepareOptions,
  removeDecoratorExecutorParamCache,
  processAllErrorAsync,
} from './executor.helper.js'


export function genExecuteDecoratorHandlerAsync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchAsync(
      AopLifeCycle.before,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchAsync(
      AopLifeCycle.around,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchAsync(
      AopLifeCycle.afterReturn,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchAsync(
      AopLifeCycle.after,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result, error },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchAsync(
      AopLifeCycle.afterThrow,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { error },
    )
  }

  return aopCallback
}


async function aopDispatchAsync(
  aopName: AopLifeCycle,
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

  const executorParam = await runPrepareOptions(aopName, options, decoratorHandlerInstance, joinPoint, extParam)
  const fn = decoratorHandlerInstance[aopName].bind(decoratorHandlerInstance) as AsyncMethodType

  switch (aopName) {
    case AopLifeCycle.before: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        throw executorParam.error
      }
      try {
        await fn(executorParam)
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.around: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        throw executorParam.error
      }
      try {
        const res = await fn(executorParam)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.afterReturn: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        throw executorParam.error
      }
      try {
        const res = await fn(executorParam)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.after: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        removeDecoratorExecutorParamCache(joinPoint.args)
        const ex = executorParam.error
        delete executorParam.error
        delete executorParam.methodResult
        delete options.error
        delete options.methodResult
        throw ex
      }
      try {
        await fn(executorParam)
        removeDecoratorExecutorParamCache(joinPoint.args)
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.afterThrow: {
      if (executorParam.errorProcessed.includes(AopLifeCycle.afterThrow) && executorParam.error) {
        throw executorParam.error
      }
      await fn(executorParam)
      // if afterThrow eat the error, then reset it
      executorParam.errorProcessed = []
      delete executorParam.error
      break
    }

    default: {
      throw new Error('Unknown aopName')
    }
  }
}

async function runPrepareOptions(
  aopName: AopLifeCycle,
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerInternal,
  joinPoint: JoinPoint,
  extParam: AopDispatchOptions,
): Promise<DecoratorExecutorParamBase> {

  let executorParam: DecoratorExecutorParamBase | undefined = void 0
  if (options.errorProcessed.includes(AopLifeCycle.genExecutorParam)) {
    if (options.error) {
      throw options.error
    }
    throw new Error('aopDispatchAsync(): options.errorProcessed is true, but options.error is undefined. The error should be thrown in apo.getExecutorParam()')
  }
  else {
    try {
      executorParam = await prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
    }
    catch (ex) {
      options.errorProcessed.push(AopLifeCycle.genExecutorParam) // set before call afterThrow
      await processAllErrorAsync(decoratorHandlerInstance, options, ex)
    }
  }

  assert(executorParam, 'executorParam undefined')
  return executorParam
}


