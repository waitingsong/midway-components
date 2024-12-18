
import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import type { IMethodAspect, MidwayDecoratorService } from '@midwayjs/core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import type { Application } from '../types.js'

import { customDecoratorRegMap } from './custom-decorator-factory.js'
import { mergeDecoratorMetaDataPayload, retrieveMetadataPayloadsOnClass } from './custom-decorator.helper.js'
import type {
  AopCallbackInputArgsType,
  DecoratorExecutorParamBase,
  DecoratorHandlerBase,
  DecoratorMetaDataPayload,
  InstanceWithDecorator,
} from './custom-decorator.types.js'
import { genExecuteDecoratorHandlerAsync } from './executor.async.js'
import { genExecuteDecoratorHandlerSync } from './executor.sync.js'


export async function autoRegisterDecoratorHandlers(
  app: Application,
  decoratorService: MidwayDecoratorService,
  ignoreRetrieveDecoratorHandlerError: boolean,
): Promise<void> {

  for (const [key] of customDecoratorRegMap) {
    try {
      await registerDecoratorHandlers(app, decoratorService, [key], true)
    }
    /* c8 ignore start */
    catch (ex) {
      assert(ex instanceof Error, 'ex is not an instance of Error')
      if (ignoreRetrieveDecoratorHandlerError) {
        console.warn(`[@mwcp/share] autoRegisterDecoratorHandlers() error, will retry on next MidwayjsLifeCycle: ${ex.message}`)
        continue
      }
      throw ex
    }
    /* c8 ignore stop */
  }
}

export async function registerDecoratorHandlers(
  app: Application,
  decoratorService: MidwayDecoratorService,
  decoratorKeys: string[],
  ignoreDecoratorKeyNotExistsError = false,
): Promise<void> {

  assert(app, 'app is required')
  assert(decoratorKeys, 'decoratorKeys is required')

  const container = app.getApplicationContext()

  for (const key of decoratorKeys) {
    const DecoratorHandler = customDecoratorRegMap.get(key)

    if (ignoreDecoratorKeyNotExistsError && ! DecoratorHandler) { continue }
    assert(
      DecoratorHandler,
      `customDecoratorRegMap does not have key: ${key}.
      maybe the decorator handler is registered by autoRegisterDecoratorHandlers() early.
      you can ignore this error by setting ignoreDecoratorKeyNotExistsError = true.
      `,
    )

    const decoratorHandlerInst = await container.getAsync<DecoratorHandlerBase>(DecoratorHandler)
    assert(decoratorHandlerInst, `retrieve DecoratorHandler instance failed, key: ${key}`)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! Object.prototype.hasOwnProperty.call(decoratorHandlerInst, 'app') || ! decoratorHandlerInst.app) {
      Object.defineProperty(decoratorHandlerInst, 'app', {
        enumerable: true,
        value: app,
      })
    }
    registerDecoratorHandler(app, key, decoratorService, decoratorHandlerInst)
    customDecoratorRegMap.delete(key)
  }
}


function registerDecoratorHandler(
  app: Application,
  decoratorKey: string,
  decoratorService: MidwayDecoratorService,
  decoratorHandler: DecoratorHandlerBase,
): void {

  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorService, 'decoratorService is required')
  assert(decoratorHandler, 'decoratorHandler is required')

  decoratorService.registerMethodHandler(
    decoratorKey,
    (aopCallbackInputOptions: AopCallbackInputArgsType) => registerMethodHandlerCallback(
      app,
      decoratorKey,
      aopCallbackInputOptions,
      decoratorHandler,
    ),
  )
}


function registerMethodHandlerCallback<TDecoratorParam extends object = object>(
  app: Application,
  decoratorKey: string,
  aopCallbackInputOptions: AopCallbackInputArgsType<TDecoratorParam>,
  decoratorHandlerInstance: DecoratorHandlerBase,
): IMethodAspect {

  assert(app, 'app is required')
  assert(decoratorKey, 'decoratorKey is required')
  assert(decoratorHandlerInstance, 'DecoratorHandlerClass is required')

  const argsFromClassDecoratorArray = retrieveMetadataPayloadsOnClass<TDecoratorParam>(
    aopCallbackInputOptions.target,
    decoratorKey,
    aopCallbackInputOptions.propertyName,
  )
  const argsFromMethodDecorator: DecoratorMetaDataPayload<TDecoratorParam> | undefined = aopCallbackInputOptions.metadata

  const mergedDecoratorParam = mergeDecoratorMetaDataPayload(
    argsFromClassDecoratorArray,
    argsFromMethodDecorator,
  )

  const target = aopCallbackInputOptions.target as InstanceWithDecorator
  const { propertyName } = aopCallbackInputOptions
  // const instanceName = target.name ?? target.constructor.name ?? 'anonymous'

  const instanceName = target.name
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const method = target.prototype[propertyName] as MethodTypeUnknown
  assert(typeof method === 'function', 'method is not a function')

  const decoratorHandlerClassName = decoratorHandlerInstance.constructor.name

  const isAsyncFunc = isAsyncFunction(method)
  const options: DecoratorExecutorParamBase = {
    scheme: '',
    argsFromClassDecorator: argsFromClassDecoratorArray[0],
    argsFromMethodDecorator,
    decoratorKey,
    decoratorHandlerClassName,
    instance: target,
    instanceName,
    methodName: propertyName,
    mergedDecoratorParam,
    methodIsAsyncFunction: isAsyncFunc,
    webApp: app,
    errorProcessed: [],

    method,
    methodArgs: [],
    webContext: void 0,
  }

  if (isAsyncFunc) {
    return genExecuteDecoratorHandlerAsync(options, decoratorHandlerInstance)
  }
  else {
    return genExecuteDecoratorHandlerSync(options, decoratorHandlerInstance)
  }
}

