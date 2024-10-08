import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import type { IMethodAspect, JoinPoint } from '@midwayjs/core'
import { genError } from '@waiting/shared-core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { ConfigKey } from '../types.js'

import type { DecoratorExecutorParamBase, DecoratorHandlerBase } from './custom-decorator.types.js'
import { AopLifeCycle } from './custom-decorator.types.js'
import {
  type AopDispatchOptions,
  type CustomIMethodAspect,
  type DecoratorHandlerInternal,
  prepareOptions,
  processAllErrorSync,
  removeDecoratorExecutorParamCache,
} from './executor.helper.js'


export function genExecuteDecoratorHandlerSync(
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const aopCallback: CustomIMethodAspect = { }

  if (typeof decoratorHandlerInstance.before === 'function') {
    aopCallback.before = (joinPoint: JoinPoint) => aopDispatchSync(
      AopLifeCycle.before,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.around === 'function') {
    aopCallback.around = (joinPoint: JoinPoint) => aopDispatchSync(
      AopLifeCycle.around,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      {},
    )
  }

  if (typeof decoratorHandlerInstance.afterReturn === 'function') {
    aopCallback.afterReturn = (joinPoint: JoinPoint, result: unknown) => aopDispatchSync(
      AopLifeCycle.afterReturn,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result },
    )
  }

  if (typeof decoratorHandlerInstance.after === 'function') {
    aopCallback.after = (joinPoint: JoinPoint, result: unknown, error: Error | undefined) => aopDispatchSync(
      AopLifeCycle.after,
      options,
      decoratorHandlerInstance as DecoratorHandlerInternal,
      joinPoint,
      { methodResult: result, error },
    )
  }

  if (typeof decoratorHandlerInstance.afterThrow === 'function') {
    aopCallback.afterThrow = (joinPoint: JoinPoint, error: Error) => aopDispatchSync(
      AopLifeCycle.afterThrow,
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

  const executorParam = runPrepareOptions(aopName, options, decoratorHandlerInstance, joinPoint, extParam)
  const fn = decoratorHandlerInstance[aopName].bind(decoratorHandlerInstance) as MethodTypeUnknown
  assert(typeof fn === 'function', `decoratorHandlerInstance[${aopName}] must be function`)

  switch (aopName) {
    case AopLifeCycle.before: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        throw executorParam.error
      }
      try {
        return fn(executorParam)
      }
      catch (ex) {
        options.error = genError({ error: ex })
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.around: {
      if (executorParam.errorProcessed.length && executorParam.error) {
        throw executorParam.error
      }
      try {
        const res = decoratorHandlerInstance[aopName](executorParam)
        assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value, aopName: "${aopName}"`)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.afterReturn: {
      if (executorParam.errorProcessed.length) {
        const error = executorParam.error ?? options.error ?? new Error('Unknown error from AopLifeCycle.afterReturn')
        throw error
      }
      try {
        const res = decoratorHandlerInstance[aopName](executorParam)
        assert(! isPromise(res), `[@mwcp/${ConfigKey.namespace}] aopDispatchSync() result must not be Promise value, aopName: "${aopName}`)
        executorParam.methodResult = res
        return res
      }
      catch (ex) {
        processAllErrorSync(decoratorHandlerInstance, executorParam, ex)
      }
      break
    }

    case AopLifeCycle.after: {
      if (executorParam.errorProcessed.length) {
        removeDecoratorExecutorParamCache(joinPoint.args)
        const error = executorParam.error ?? options.error ?? new Error('Unknown error from AopLifeCycle.after')
        delete executorParam.error
        delete executorParam.methodResult
        delete options.error
        delete options.methodResult
        throw error
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

    case AopLifeCycle.afterThrow: {
      if (executorParam.errorProcessed.includes(AopLifeCycle.afterThrow) && executorParam.error) {
        throw executorParam.error
      }
      fn(executorParam)
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


function runPrepareOptions(
  aopName: AopLifeCycle,
  options: DecoratorExecutorParamBase,
  decoratorHandlerInstance: DecoratorHandlerInternal,
  joinPoint: JoinPoint,
  extParam: AopDispatchOptions,
): DecoratorExecutorParamBase {

  let executorParam: DecoratorExecutorParamBase | Promise<DecoratorExecutorParamBase> | undefined = void 0
  if (options.errorProcessed.includes(AopLifeCycle.genExecutorParam)) {
    if (options.error) {
      throw options.error
    }
    throw new Error('aopDispatchSync(): options.errorProcessed is true, but options.error is undefined. The error should be thrown in apo.getExecutorParam()')
  }
  else {
    try {
      executorParam = prepareOptions(aopName, options, joinPoint, decoratorHandlerInstance, extParam)
      // assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')
    }
    catch (ex) {
      options.errorProcessed.push(AopLifeCycle.genExecutorParam) // set before call afterThrow
      processAllErrorSync(decoratorHandlerInstance, options, ex)
    }
  }

  assert(executorParam, 'executorParam undefined')
  assert(! isPromise(executorParam), 'aopDispatchSync() executorParam must not be Promise value')
  return executorParam
}

