/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'

import { JoinPoint, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core'

import type {
  DecoratorExecutorParamBase,
  InstanceWithDecorator,
} from './custom-decorator.types.js'


export function genExecutorOptionsCommon<TDecoratorParam extends object = object>(
  joinPoint: JoinPoint,
  baseOptions: DecoratorExecutorParamBase<TDecoratorParam>,
): DecoratorExecutorParamBase<TDecoratorParam> {

  assert(baseOptions, 'baseOptions is required')
  assert(typeof baseOptions === 'object', 'baseOptions is not object')
  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not function')

  assert(baseOptions.decoratorKey, 'baseOptions.decoratorKey is undefined')
  assert(baseOptions.instanceName, 'baseOptions.instanceName is empty')

  // 装饰器所在的类实例
  // instance.constructor === baseOptions.instance, Object.getPrototypeOf(instance) === baseOptions.instance.prototype
  const instance = joinPoint.target as InstanceWithDecorator
  const webContext = baseOptions.webContext ?? instance[REQUEST_OBJ_CTX_KEY]
  assert(baseOptions.webApp, 'webApp is empty')
  assert(baseOptions.methodName, 'methodName is undefined')

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

  // assert(instance.constructor.name, 'instance.constructor.name is empty')
  // const callerClass = instance.constructor.name
  // const callerMethod = joinPoint.methodName

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const method = joinPoint.proceed
  // const method = joinPoint.proceed.bind(joinPoint.target)
  // const method = joinPoint.proceed.bind(void 0)
  assert(
    typeof method === 'function',
    `${baseOptions.instanceName}.${baseOptions.methodName}() Func referencing joinPoint.proceed is not function`,
  )

  // let { mergedDecoratorParam } = baseOptions
  // if (! mergedDecoratorParam && metaData) {
  //   const argsFromClassDecoratorArray = retrieveMetadataPayloadsOnClass<TDecoratorParam>(
  //     instance,
  //     decoratorKey,
  //     callerMethod,
  //   )
  //   mergedDecoratorParam = mergeDecoratorMetaDataPayload<TDecoratorParam>(
  //     argsFromClassDecoratorArray,
  //     metaData,
  //   )
  // }

  const opts: DecoratorExecutorParamBase<TDecoratorParam> = {
    span: void 0,
    ...baseOptions,
    instance,
    method,
    // index:0 may webcontext
    methodArgs: joinPoint.args,
    webContext,
  }

  assert(opts.instance, 'options.instance is undefined')

  return opts
}

