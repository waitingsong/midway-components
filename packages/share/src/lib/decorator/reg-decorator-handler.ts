/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import {
  JoinPoint,
  REQUEST_OBJ_CTX_KEY,
} from '@midwayjs/core'

import type { Context as WebContext } from '../types.js'

import {
  mergeDecoratorMetaDataPayload,
  retrieveMetadataPayloadsOnClass,
} from './custom-decorator.helper.js'
import type {
  AopCallbackInputArgsType,
  AroundFactoryParamBase,
  DecoratorExecutorParamBase,
  RegisterDecoratorHandlerParam,
  InstanceOfDecorator,
  DecoratorMetaDataPayload,
} from './custom-decorator.types.js'


export function registerDecoratorHandler<TDecoratorParam extends {} = any>(
  options: RegisterDecoratorHandlerParam<TDecoratorParam>,
  aroundFactoryOptions: AroundFactoryParamBase,
): void {

  const {
    decoratorKey,
    decoratorService,
    fnDecoratorExecutorAsync: executorAsync,
    fnDecoratorExecutorSync: executorSync,
    fnGenDecoratorExecutorParam: genDecoratorExecutorParam,
  } = options

  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorService, 'decoratorService is required')

  decoratorService.registerMethodHandler(
    decoratorKey,
    (aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorParam>) => {

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

      const isAsyncFunc = isAsyncFunction(method)
      if (isAsyncFunc) {
        if (executorAsync === false) {
          throw new TypeError(`Async method ${instanceName}.${propertyName}() is not supported`)
        }
        assert(typeof executorAsync === 'function', 'fnDecoratorExecutorAsync must be function')
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
      } // async

      // sync and bypass
      if (executorSync === 'bypass') {
        return {}
      }
      // sync
      else if (executorSync === false) {
        throw new TypeError(`Sync method ${instanceName}.${propertyName}() is not supported`)
      }

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
    },
  )
}


function prepareOptions<TDecoratorParam extends {} = any>(
  decoratorKey: string,
  aroundFactoryOptions: AroundFactoryParamBase,
  joinPoint: JoinPoint,
  mergedDecoratorParam: DecoratorMetaDataPayload<TDecoratorParam> | undefined,
  genDecoratorExecutorParam: RegisterDecoratorHandlerParam['fnegenDecoratorExecutorParam'],
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


// async function run<TDecoratorParam extends {} = {}>(
//   decoratorExecutor: FnDecoratorExecutor,
//   options: DecoratorExecutorParamBase<TDecoratorParam>,
// ): Promise<unknown> {

//   // not return directly, https://v8.dev/blog/fast-async#improved-developer-experience
//   const dat = await decoratorExecutor(options)
//   return dat
// }

// function runSync<TDecoratorParam extends {} = {}>(
//   decoratorExecutor: FnDecoratorExecutor,
//   options: DecoratorExecutorParamBase<TDecoratorParam>,
// ): unknown {

//   const dat = decoratorExecutor(options)
//   return dat
// }


export function genDecoratorExecutorOptionsCommon<TDecoratorParam extends {} = {}>(
  joinPoint: JoinPoint,
  baseOptions: Partial<DecoratorExecutorParamBase<TDecoratorParam>> = {},
  metaData?: AopCallbackInputArgsType<TDecoratorParam>['metadata'] | undefined,
): DecoratorExecutorParamBase<TDecoratorParam> {

  assert(baseOptions, 'baseOptions is required')
  assert(typeof baseOptions === 'object', 'baseOptions is not object')
  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  const decoratorKey = baseOptions.decoratorKey ?? ''
  assert(decoratorKey, 'baseOptions.decoratorKey is undefined')

  // 装饰器所在的类实例
  const instance = joinPoint.target as InstanceOfDecorator
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = baseOptions.webContext ?? instance[REQUEST_OBJ_CTX_KEY] as WebContext | undefined

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

