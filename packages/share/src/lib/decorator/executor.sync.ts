import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import type { JoinPoint, IMethodAspect } from '@midwayjs/core'
import { genError } from '@waiting/shared-core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { ConfigKey } from '../types.js'

import type { AopLifeCycle, DecoratorHandlerBase, DecoratorExecutorParamBase } from './custom-decorator.types.js'
import {
  type DecoratorHandlerInternal,
  type CustomIMethodAspect,
  type AopDispatchOptions,
  prepareOptions,
  removeDecoratorExecutorParamCache,
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

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchSync(
      'after',
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result, error },
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

  return aopCallback
}


export function aopDispatchSync(
  aopName: AopLifeCycle,
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

  let executorParam: DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase> | undefined = void 0
  if (options.errorProcessed && options.error) {
    throw options.error
  }
  else {
    try {
      executorParam = prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
    // assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')
    }
    catch (ex) {
      processAllErrorSync(decoratorHandlerInstance, options, ex)
    }
  }
  assert(executorParam, 'executorParam undefined')
  assert(! isPromise(executorParam), 'aopDispatchSync() executorParam must not be Promise value')

  const fn = decoratorHandlerInstance[aopName].bind(decoratorHandlerInstance) as MethodTypeUnknown
  assert(typeof fn === 'function', `decoratorHandlerInstance[${aopName}] must be function`)

  switch (aopName) {
    case 'before': {
      try {
        return fn(executorParam)
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'around': {
      if (executorParam.errorProcessed && executorParam.error) {
        throw executorParam.error
      }
      try {
        const res = decoratorHandlerInstance[aopName](executorParam)
        assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value`)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'afterReturn': {
      if (executorParam.errorProcessed && executorParam.error) {
        throw executorParam.error
      }
      try {
        const res = decoratorHandlerInstance[aopName](executorParam)
        assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value`)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'after': {
      if (executorParam.errorProcessed && executorParam.error) {
        removeDecoratorExecutorParamCache(joinPoint.args)
        throw executorParam.error
      }
      try {
        fn(executorParam)
        removeDecoratorExecutorParamCache(joinPoint.args)
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case 'afterThrow': {
      if (executorParam.errorProcessed && executorParam.error) {
        throw executorParam.error
      }
      fn(executorParam)
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



function processAllErrorSync(
  decoratorHandlerInstance: DecoratorHandlerInternal,
  executorParam: DecoratorExecutorParamBase,
  error: unknown,
): void {

  executorParam.error = genError({ error })
  executorParam.methodResult = void 0

  const afterThrow = decoratorHandlerInstance['afterThrow'] as MethodTypeUnknown

  if (typeof afterThrow !== 'function') {
    throw error
  }

  try {
    Reflect.apply(afterThrow, decoratorHandlerInstance, [executorParam])
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
