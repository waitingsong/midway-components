import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import { IMethodAspect, JoinPoint } from '@midwayjs/core'


import type {
  DecoratorExecutorParamBase,
  DecoratorHandlerBase,
  ExecuteDecoratorHandlerRunnerOptions,
} from './custom-decorator.types.js'
import { genExecutorOptionsCommon } from './reg-decorator-handler.helper.js'


export function executeDecoratorHandlerAsync(
  options: ExecuteDecoratorHandlerRunnerOptions,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const { instanceName, methodName } = options
  assert(typeof decoratorHandlerInstance.executorAsync === 'function', 'executorAsync must be function')
  assert(
    // eslint-disable-next-line @typescript-eslint/unbound-method
    isAsyncFunction(decoratorHandlerInstance.executorAsync),
    `${decoratorHandlerInstance.executorAsync.name}() must be async function, due to method ${instanceName}.${methodName}() is async function`,
  )

  return {
    around: async (joinPoint: JoinPoint) => {
      assert(joinPoint.proceedIsAsyncFunction, `${instanceName}.${methodName}() must be async function`)

      const executorParam = await prepareOptionsAsync(
        options,
        joinPoint,
        decoratorHandlerInstance,
      )
      assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')
      const ret = await decoratorHandlerInstance.executorAsync(executorParam)
      return ret
    },
  }

}

/**
 *
 * - For Async method (executorAsync) ONLY
 * - Async method run before `genExecutorParam()`
 * @description decoratorHandlerInstance will be add property `ctx` to itself
 */
async function prepareOptionsAsync(
  options: ExecuteDecoratorHandlerRunnerOptions,
  joinPoint: JoinPoint,
  decoratorHandlerInstance: DecoratorHandlerBase,
): Promise<DecoratorExecutorParamBase> {

  const baseOpts: DecoratorExecutorParamBase = {
    ...options,
  }
  const executorParamBase: DecoratorExecutorParamBase = genExecutorOptionsCommon(
    joinPoint,
    baseOpts,
  )

  let executorParam: DecoratorExecutorParamBase = typeof decoratorHandlerInstance.genExecutorParamAsync === 'function'
    ? await decoratorHandlerInstance.genExecutorParamAsync(executorParamBase)
    /* c8 ignore next */
    : executorParamBase

  if (typeof decoratorHandlerInstance.genExecutorParam === 'function') {
    executorParam = decoratorHandlerInstance.genExecutorParam(executorParam)
  }

  // if (typeof executorParam.methodIsAsyncFunction === 'undefined') {
  //   executorParam.methodIsAsyncFunction = !! joinPoint.proceedIsAsyncFunction
  // }

  return executorParam
}
