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

import type { AbstractOtelComponent, AbstractTraceService } from './abstract'
import {
  AttrNames,
  ConfigKey,
  DecoatorContext,
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
  methodArgs: unknown[]
  appendArg: DecoatorContext
  callerClass: string
  callerMethod: string
}

function genKey(options: GenKeyOptions): string {
  const {
    methodArgs,
    appendArg,
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
      const keyStr = spanName(methodArgs as [], appendArg)
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

export interface DecoratorExecutorOptions<T extends TraceDecoratorArg = TraceDecoratorArg>
  extends DecoratorExecutorOptionsBase<T> {
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<SpanOptions>
  startActiveSpan: boolean
  traceContext: TraceContext | undefined
  traceService: AbstractTraceService | undefined
}

export function genDecoratorExecutorOptions(
  options: AroundFactoryOptions<TraceDecoratorArg>,
): DecoratorExecutorOptions<TraceDecoratorArg> {

  const {
    joinPoint,
    aopCallbackInputOptions,
    config,
    decoratorKey,
    webApp,
  } = options
  assert(webApp, 'webApplication is required')

  const baseOps: Partial<DecoratorExecutorOptionsBase<TraceDecoratorArg>> = {
    config,
    decoratorKey,
    webApp,
  }

  const opts = prepareAroundFactory<TraceDecoratorArg>(joinPoint, aopCallbackInputOptions, baseOps)
  assert(webApp, 'webApp is undefined')
  assert(config, 'config is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const traceService = opts.webContext?.[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: opts.instanceName,
    [AttrNames.CallerMethod]: opts.methodName,
  }

  const { metadata } = aopCallbackInputOptions

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const mdata: Partial<TraceDecoratorArg> = metadata && typeof metadata === 'object'
    ? metadata
    : { spanName: metadata }

  const startActiveSpan = typeof mdata.startActiveSpan === 'boolean'
    ? mdata.startActiveSpan
    : true
  const { traceContext } = mdata

  const otelKey = `_${ConfigKey.componentName}`
  // @ts-expect-error
  const otel: AbstractOtelComponent | undefined = traceService?.otel ?? opts.webApp[otelKey] ?? void 0,

  const appendArg: DecoatorContext = {
    webApp: opts.webApp,
    webContext: opts.webContext,
    otelComponent: otel,
    traceService: traceService ?? void 0,
    traceContext: traceContext ?? void 0,
    traceSpan: void 0,
  }

  const keyOpts: GenKeyOptions = {
    ...mdata,
    startActiveSpan,
    methodArgs: opts.methodArgs,
    appendArg,
    callerClass: opts.instanceName,
    callerMethod: opts.methodName,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  const ret: DecoratorExecutorOptions<TraceDecoratorArg> = {
    ...opts,
    callerAttr,
    spanName,
    spanOptions: mdata,
    startActiveSpan,
    traceContext,
    traceService,
  }

  return ret
}


function prepareAroundFactory<TDecoratorArgs extends TraceDecoratorArg = TraceDecoratorArg>(
  joinPoint: JoinPoint,
  metaDataOptions: MetaDataType,
  baseOptions: Partial<DecoratorExecutorOptionsBase<TDecoratorArgs>> = {},
): DecoratorExecutorOptionsBase<TDecoratorArgs> {

  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(joinPoint.proceed, 'joinPoint.proceed is undefined')
  assert(typeof joinPoint.proceed === 'function', 'joinPoint.proceed is not funtion')

  // 装饰器所在的实例
  const instance = joinPoint.target
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const webContext = baseOptions.webContext ?? instance[REQUEST_OBJ_CTX_KEY] as WebContext | undefined

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const callerClass = instance.constructor?.name ?? metaDataOptions.target.name ?? ''
  const callerMethod = joinPoint.methodName
  const { args, target } = joinPoint

  // const func = joinPoint.proceed.bind(joinPoint.target)
  const func = joinPoint.proceed.bind(void 0)

  assert(typeof func === 'function', 'Func referencing joinPoint.proceed is not function')

  const opts: DecoratorExecutorOptionsBase<TDecoratorArgs> = {
    argsFromClassDecorator: void 0,
    argsFromMethodDecorator: void 0,
    decoratorKey: baseOptions.decoratorKey ?? '',
    config: baseOptions.config ?? void 0,
    instance: target,
    instanceName: callerClass,
    method: func,
    // index:0 may webcontext
    methodArgs: args,
    methodName: callerMethod,
    methodIsAsyncFunction: !! joinPoint.proceedIsAsyncFunction,
    webApp: baseOptions.webApp ?? void 0,
    webContext,
  }
  return opts
}
