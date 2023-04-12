/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import {
  REQUEST_OBJ_CTX_KEY,
  JoinPoint,
} from '@midwayjs/core'
import type {
  AopCallbackInputArgsType,
  AroundFactoryOptions,
  DecoratorExecutorOptionsBase,
  Context as WebContext,
} from '@mwcp/share'
import { Attributes, SpanOptions } from '@opentelemetry/api'

import type { AbstractTraceService } from './abstract'
import {
  AttrNames,
  ConfigKey,
  TraceContext,
  TraceDecoratorArg,
  TraceDecoratorOptions,
} from './types'


// export interface MetaDataType {
//   target: new (...args: unknown[]) => unknown
//   propertyName: string
//   metadata: TraceDecoratorArg | undefined
// }
export type MetaDataType = AopCallbackInputArgsType<TraceDecoratorArg>


interface GenKeyOptions extends Partial<TraceDecoratorOptions> {
  webContext: WebContext | undefined
  methodArgs: unknown[]
  callerClass: string
  callerMethod: string
}

function genKey(options: GenKeyOptions): string {
  const {
    webContext,
    methodArgs,
    spanName,
  } = options

  switch (typeof spanName) {
    case 'string': {
      if (spanName.length > 0) {
        return spanName
      }
      break
    }

    case 'undefined': {
      const name = `${options.callerClass.toString()}/${options.callerMethod.toString()}`
      return name
    }

    case 'function': {
      assert(webContext, 'webContext is required when spanName is a function')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const keyStr = spanName.call(webContext, methodArgs)
      assert(
        typeof keyStr === 'string' || typeof keyStr === 'undefined',
        'keyGenerator function must return a string or undefined',
      )
      if (keyStr) {
        return keyStr
      }
      break
    }

    default: {
      assert(false, 'spanName must be a string or a function')
    }
  }

  const name = `${options.callerClass.toString()}/${options.callerMethod.toString()}`
  return name
}

export function genDecoratorExecutorOptions<TDecoratorArgs extends TraceDecoratorArg = TraceDecoratorArg>(
  options: AroundFactoryOptions<TDecoratorArgs>,
): DecoratorExecutorOptions<TDecoratorArgs> {

  const {
    joinPoint,
    aopCallbackInputOptions,
    config,
    decoratorKey,
    webApplication,
  } = options
  assert(webApplication, 'webApplication is required')

  const opts = prepareAroundFactory<TDecoratorArgs>(joinPoint, aopCallbackInputOptions)
  if (typeof opts.config === 'undefined') {
    opts.config = config
  }
  if (typeof opts.decoratorKey === 'undefined') {
    opts.decoratorKey = decoratorKey
  }
  if (typeof opts.webApplication === 'undefined') {
    opts.webApplication = webApplication
  }

  return opts
}


export interface DecoratorExecutorOptions<T extends TraceDecoratorArg = TraceDecoratorArg>
  extends DecoratorExecutorOptionsBase<T> {
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<SpanOptions>
  startActiveSpan: boolean
  traceContext: TraceContext | undefined
  traceService: AbstractTraceService | undefined
}

export function prepareAroundFactory<TDecoratorArgs extends TraceDecoratorArg = TraceDecoratorArg>(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
): DecoratorExecutorOptions<TDecoratorArgs> {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = instance[REQUEST_OBJ_CTX_KEY] as WebContext | undefined

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const callerClass = instance.constructor?.name ?? metaDataOptions.target.name
  const callerMethod = joinPoint.methodName
  const { args, target } = joinPoint

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: callerClass,
    [AttrNames.CallerMethod]: callerMethod,
  }

  const { metadata } = metaDataOptions
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const mdata: TraceDecoratorArg = metadata && typeof metadata === 'object'
    ? metadata
    : {}

  const keyOpts: GenKeyOptions = {
    ...mdata,
    methodArgs: args,
    webContext,
    callerClass,
    callerMethod,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)

  // const traceService = (webContext[`_${ConfigKey.serviceName}`]
  //   ?? await webContext.requestContext.getAsync(TraceService)) as TraceService
  const traceService = webContext?.[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined
  // assert(traceService, `traceService undefined on webContext[_${ConfigKey.serviceName}]`)
  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  const startActiveSpan = typeof mdata === 'object'
    ? mdata.startActiveSpan ?? true
    : true

  const traceContext = typeof mdata === 'object'
    ? mdata.traceContext
    : void 0

  const opts: DecoratorExecutorOptions<TDecoratorArgs> = {
    argsFromClassDecorator: void 0,
    argsFromMethodDecorator: void 0,
    decoratorKey: '',
    config: void 0,
    instance: target,
    method: func,
    // index:0 may webcontext
    methodArgs: args,
    methodName: callerMethod,
    methodIsAsyncFunction: !! joinPoint.proceedIsAsyncFunction,

    callerAttr,
    spanName,
    spanOptions: mdata,
    startActiveSpan,
    traceContext,
    traceService,
  }
  return opts
}
