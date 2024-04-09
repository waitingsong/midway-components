/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import { IMethodAspect, JoinPoint, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'

import { mergeDecoratorMetaDataPayload, retrieveMetadataPayloadsOnClass } from './custom-decorator.helper.js'
import type {
  AopCallbackInputArgsType,
  AroundFactoryParamBase,
  DecoratorExecutorParamBase,
  RegisterDecoratorHandlerParam,
  InstanceOfDecorator,
  DecoratorMetaDataPayload,
} from './custom-decorator.types.js'


export function executeDecoratorHandler<TDecoratorParam extends {} = any>(
  aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorParam>,
  registerDecoratorHandlerOptions: RegisterDecoratorHandlerParam<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): IMethodAspect {

  const { decoratorKey } = registerDecoratorHandlerOptions

  assert(decoratorKey, 'decoratorKey is required')

  const argsFromClassDecoratorArray = retrieveMetadataPayloadsOnClass<TDecoratorParam>(
    aopCallbackInputOptions.target,
    decoratorKey,
    aopCallbackInputOptions.propertyName,
  )
  const mergedDecoratorParam = mergeDecoratorMetaDataPayload<TDecoratorParam>(
    argsFromClassDecoratorArray,
    aopCallbackInputOptions.metadata,
  )
  // const { metadata } = aopCallbackInputOptions

  const { target, propertyName } = aopCallbackInputOptions
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const instanceName = target.name ?? target.constructor.name ?? 'anonymous'
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const method = target.prototype[propertyName]

  // assert(! (executorAsync === 'bypass' && executorSync === 'bypass'), 'both executorAsync and executorSync can not be bypass together')

  const options = {
    decoratorKey,
    instanceName,
    methodName: propertyName,
    mergedDecoratorParam,
    fnDecoratorExecutorAsync: registerDecoratorHandlerOptions.fnDecoratorExecutorAsync,
    fnDecoratorExecutorSync: registerDecoratorHandlerOptions.fnDecoratorExecutorSync,
    fnGenDecoratorExecutorParam: registerDecoratorHandlerOptions.fnGenDecoratorExecutorParam,
  }

  const isAsyncFunc = isAsyncFunction(method)
  if (isAsyncFunc) {
    return executeDecoratorHandlerAsync(
      options,
      aroundFactoryOptions,
    )
  }
  else { // sync
    return executeDecoratorHandlerSync(
      options,
      aroundFactoryOptions,
    )
  }
}

interface ExecuteDecoratorHandlerRunnerOptions<TDecoratorParam extends {}> {
  decoratorKey: string
  instanceName: string
  methodName: string
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined
  fnDecoratorExecutorAsync: RegisterDecoratorHandlerParam['fnDecoratorExecutorAsync']
  fnDecoratorExecutorSync: RegisterDecoratorHandlerParam['fnDecoratorExecutorSync']
  fnGenDecoratorExecutorParam: RegisterDecoratorHandlerParam['fnGenDecoratorExecutorParam']
}

function executeDecoratorHandlerAsync<TDecoratorParam extends {} = any>(
  options: ExecuteDecoratorHandlerRunnerOptions<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): IMethodAspect {

  const {
    decoratorKey,
    instanceName,
    methodName,
    mergedDecoratorParam,
    fnDecoratorExecutorAsync: executorAsync,
    fnGenDecoratorExecutorParam: genDecoratorExecutorParam,
  } = options

  if (executorAsync === 'bypass') {
    return {}
  }
  if (executorAsync === false) {
    throw new TypeError(`Async method ${instanceName}.${methodName}() is not supported while executorAsync config is false`)
  }
  assert(
    typeof executorAsync === 'function',
    `fnDecoratorExecutorAsync must be function, due to method ${instanceName}.${methodName}() is async function`,
  )
  assert(isAsyncFunction(executorAsync), 'fnDecoratorExecutorAsync must be async function')

  return {
    around: async (joinPoint: JoinPoint) => {
      const executorParam = prepareOptions<TDecoratorParam>(
        decoratorKey,
        aroundFactoryOptions,
        joinPoint,
        mergedDecoratorParam,
        genDecoratorExecutorParam,
      )

      assert(executorParam.methodIsAsyncFunction === true, 'methodIsAsyncFunction must be true')
      const ret = await executorAsync(executorParam)
      return ret
    },
  }
}

function executeDecoratorHandlerSync<TDecoratorParam extends {} = any>(
  options: ExecuteDecoratorHandlerRunnerOptions<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): IMethodAspect {

  const {
    decoratorKey,
    instanceName,
    methodName,
    mergedDecoratorParam,
    fnDecoratorExecutorSync: executorSync,
    fnGenDecoratorExecutorParam: genDecoratorExecutorParam,
  } = options

  if (executorSync === 'bypass') {
    return {}
  }
  // sync
  else if (executorSync === false) {
    throw new TypeError(`Sync method ${instanceName}.${methodName}() is not supported, while executorSync config is false`)
  }

  assert(
    typeof executorSync === 'function',
    `fnDecoratorExecutorSync must be function, due to method ${instanceName}.${methodName}() is sync function`,
  )
  assert(! isAsyncFunction(executorSync), 'fnDecoratorExecutorSync must not be async function')

  return {
    around: (joinPoint: JoinPoint) => {
      const executorParam = prepareOptions<TDecoratorParam>(
        decoratorKey,
        aroundFactoryOptions,
        joinPoint,
        mergedDecoratorParam,
        genDecoratorExecutorParam,
      )

      assert(executorParam.methodIsAsyncFunction === false, 'methodIsAsyncFunction must be false')
      const ret = executorSync(executorParam)
      return ret
    },
  }
}


function prepareOptions<TDecoratorParam extends {} = any>(
  decoratorKey: string,
  aroundFactoryOptions: AroundFactoryParamBase,
  joinPoint: JoinPoint,
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined,
  genDecoratorExecutorParam: RegisterDecoratorHandlerParam['fnGenDecoratorExecutorParam'],
): DecoratorExecutorParamBase<TDecoratorParam> {

  const baseOpts: Partial<DecoratorExecutorParamBase<TDecoratorParam>> = {
    ...aroundFactoryOptions,
    decoratorKey,
  }
  if (mergedDecoratorParam) {
    baseOpts.mergedDecoratorParam = mergedDecoratorParam
  }

  const opts2 = genDecoratorExecutorOptionsCommon<TDecoratorParam>(
    joinPoint,
    baseOpts,
    // metadata,
    void 0,
  )
  const executorParamBase: DecoratorExecutorParamBase<TDecoratorParam> = {
    ...opts2,
    mergedDecoratorParam,
  }

  const executorParam: DecoratorExecutorParamBase<TDecoratorParam> = typeof genDecoratorExecutorParam === 'function'
    ? genDecoratorExecutorParam(executorParamBase)
    : executorParamBase

  if (typeof executorParam.methodIsAsyncFunction === 'undefined') {
    executorParam.methodIsAsyncFunction = !! joinPoint.proceedIsAsyncFunction
  }

  return executorParam
}



export function genDecoratorExecutorOptionsCommon<TDecoratorParam extends {} = {}>(
  joinPoint: JoinPoint,
  baseOptions: Partial<DecoratorExecutorParamBase<TDecoratorParam>> = {},
  metaData?: AopCallbackInputArgsType<TDecoratorParam>['metadata'] | undefined,
): DecoratorExecutorParamBase<TDecoratorParam> {

  assert(baseOptions, 'baseOptions is required')
  assert(typeof baseOptions === 'object', 'baseOptions is not object')
  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not function')

  const decoratorKey = baseOptions.decoratorKey ?? ''
  assert(decoratorKey, 'baseOptions.decoratorKey is undefined')

  // 装饰器所在的类实例
  const instance = joinPoint.target as InstanceOfDecorator
  const webContext = baseOptions.webContext ?? instance[REQUEST_OBJ_CTX_KEY]

  // let span: Span | undefined = void 0
  // if (webContext) {
  //   // _${ConfigKey.serviceName}
  //   const traceSvc = webContext['_otelService']
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  //   if (traceSvc?.isStarted() === true) {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     span = traceSvc.rootSpan as Span | undefined
  //   }
  // }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-condition
  const callerClass = instance.constructor.name ?? ''
  const callerMethod = joinPoint.methodName
  const { args, target } = joinPoint

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)

  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  let { mergedDecoratorParam } = baseOptions
  if (! mergedDecoratorParam && metaData) {
    const argsFromClassDecoratorArray = retrieveMetadataPayloadsOnClass<TDecoratorParam>(
      instance,
      decoratorKey,
      callerMethod,
    )
    mergedDecoratorParam = mergeDecoratorMetaDataPayload<TDecoratorParam>(
      argsFromClassDecoratorArray,
      metaData,
    )
  }

  // @ts-expect-error
  const opts: DecoratorExecutorParamBase<TDecoratorParam> = {
    span: void 0,
    ...baseOptions,
    mergedDecoratorParam,
    decoratorKey,
    instance: target,
    instanceName: callerClass,
    method: func,
    // index:0 may webcontext
    methodArgs: args,
    methodName: callerMethod,
    methodIsAsyncFunction: !! joinPoint.proceedIsAsyncFunction,
    webContext,
  }

  return opts
}

