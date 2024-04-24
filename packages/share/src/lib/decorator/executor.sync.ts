import assert from 'node:assert'
import { isAsyncFunction, isPromise } from 'node:util/types'

import { IMethodAspect, JoinPoint } from '@midwayjs/core'

import type {
  DecoratorExecutorParamBase,
  DecoratorHandlerBase,
  ExecuteDecoratorHandlerRunnerOptions,
} from './custom-decorator.types.js'
import { genExecutorOptionsCommon } from './reg-decorator-handler.helper.js'


export function genExecuteDecoratorHandlerSync(
  options: ExecuteDecoratorHandlerRunnerOptions,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  const { instanceName, methodName } = options
  assert(typeof decoratorHandlerInstance.executorSync === 'function', 'executorSync must be function')
  assert(
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ! isAsyncFunction(decoratorHandlerInstance.executorSync),
    `${decoratorHandlerInstance.executorSync.name}() must be sync function, due to method ${instanceName}.${methodName}() is sync function`,
  )

  return {
    around: (joinPoint: JoinPoint) => {
      assert(! joinPoint.proceedIsAsyncFunction, `${instanceName}.${methodName}() must be sync function`)

      const executorParam = prepareOptions(
        options,
        joinPoint,
        decoratorHandlerInstance,
      )
      assert(executorParam.methodIsAsyncFunction === false, 'methodIsAsyncFunction must be false')
      const ret = decoratorHandlerInstance.executorSync(executorParam)
      assert(! isPromise(ret), `result must not be Promise, due to method ${instanceName}.${methodName}() is sync function`)
      return ret
    },
  }
}


/**
 *
 * @description decoratorHandlerInstance will be add property `ctx` to itself
 */
function prepareOptions(
  options: ExecuteDecoratorHandlerRunnerOptions,
  joinPoint: JoinPoint,
  decoratorHandlerInstance: DecoratorHandlerBase,
): DecoratorExecutorParamBase {

  const baseOpts: DecoratorExecutorParamBase = {
    ...options,
  }

  const executorParamBase: DecoratorExecutorParamBase = genExecutorOptionsCommon(
    joinPoint,
    baseOpts,
  )

  const executorParam: DecoratorExecutorParamBase = typeof decoratorHandlerInstance.genExecutorParam === 'function'
    ? decoratorHandlerInstance.genExecutorParam(executorParamBase)
    /* c8 ignore next */
    : executorParamBase

  // if (typeof executorParam.methodIsAsyncFunction === 'undefined') {
  //   executorParam.methodIsAsyncFunction = !! joinPoint.proceedIsAsyncFunction
  // }

  return executorParam
}
