import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { JoinPoint, IMethodAspect } from '@midwayjs/core'
import { genError } from '@waiting/shared-core'
import type { AsyncMethodType } from '@waiting/shared-types'

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

  let executorParam: DecoratorExecutorParamBase | undefined = void 0
  try {
    executorParam = await prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
  }
  catch (ex) {
    await processAllErrorAsync(decoratorHandlerInstance, options, ex)
  }
  assert(executorParam, 'executorParam undefined')

  const fn = decoratorHandlerInstance[aopName].bind(decoratorHandlerInstance) as AsyncMethodType
  assert(typeof fn === 'function', `decoratorHandlerInstance[${aopName}] must be function`)

  switch (aopName) {
    case 'before': {
      try {
        const resp = fn(executorParam)
        if (isPromise(resp)) {
          // eslint-disable-next-line @typescript-eslint/return-await
          return resp.catch((ex: Error) => {
            // let midway aop to handle it if afterThrow throw error again
            return processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
          })
        }
        return resp
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'around': {
      const res = await fn(executorParam)
      executorParam.methodResult = res
      return res
    }

    case 'afterReturn': {
      const res = await fn(executorParam)
      executorParam.methodResult = res
      return res
    }

    case 'after': {
      if (executorParam.errorProcessed && executorParam.error) {
        throw executorParam.error
      }
      try {
        const resp = fn(executorParam)
        if (isPromise(resp)) {
          // eslint-disable-next-line @typescript-eslint/return-await
          return resp.catch((ex: Error) => {
            // let midway aop to handle it if afterThrow throw error again
            return processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
          })
        }
        return resp
      }
      catch (ex) {
        await processAllErrorAsync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'afterThrow': {
      if (executorParam.errorProcessed && executorParam.error) {
        throw executorParam.error
      }
      await fn(executorParam)
      // if afterThrow eat the error, then reset it
      executorParam.errorProcessed = void 0
      executorParam.error = void 0
      break
    }

    default: {
      throw new Error('Unknown aopName')
    }
  }
}

async function processAllErrorAsync(
  decoratorHandlerInstance: DecoratorHandlerInternal,
  executorParam: DecoratorExecutorParamBase,
  error: unknown,
): Promise<void> {

  executorParam.error = genError({ error })

  const afterThrow = decoratorHandlerInstance['afterThrow'] as AsyncMethodType

  if (typeof afterThrow !== 'function') {
    throw error
  }

  try {
    await Reflect.apply(afterThrow, decoratorHandlerInstance, [executorParam])
    // if afterThrow eat the error, then reset it
    executorParam.errorProcessed = void 0
    executorParam.error = void 0
  }
  finally {
    if (executorParam.error) {
      executorParam.errorProcessed = true
    }
    else {
      executorParam.errorProcessed = void 0
    }
  }
}

