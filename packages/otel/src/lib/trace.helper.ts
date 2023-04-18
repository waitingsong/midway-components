/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { JoinPoint } from '@midwayjs/core'
import {
  AopCallbackInputArgsType,
  DecoratorExecutorOptionsBase,
  genDecoratorExecutorOptionsBase,
} from '@mwcp/share'
import { Attributes, SpanOptions } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract'
import {
  DecoratorContext,
  TraceDecoratorArg,
  TraceDecoratorOptions,
} from './decorator.types'
import {
  AttrNames,
  ConfigKey,
  TraceContext,
} from './types'


interface GenKeyOptions extends Partial<TraceDecoratorOptions> {
  methodArgs: unknown[]
  decoratorContext: DecoratorContext
  callerClass: string
  callerMethod: string
}

function genKey(options: GenKeyOptions): string {
  const {
    methodArgs,
    decoratorContext,
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
      const keyStr = spanName(methodArgs as [], decoratorContext)
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
  joinPoint: JoinPoint,
  aopCallbackInputOptions: AopCallbackInputArgsType<TraceDecoratorArg>,
  baseOptions: Partial<DecoratorExecutorOptionsBase<TraceDecoratorArg>> = {},
): DecoratorExecutorOptions<TraceDecoratorArg> {

  assert(baseOptions.webApp, 'baseOptions.webApp is undefined')

  const baseOpts = genDecoratorExecutorOptionsBase<TraceDecoratorArg>(joinPoint, aopCallbackInputOptions, baseOptions)
  const { webApp, config, decoratorKey } = baseOpts
  assert(webApp, 'webApp is undefined')
  assert(config, 'config is undefined')
  assert(decoratorKey, 'decoratorKey is undefined')

  const traceService = baseOpts.webContext?.[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: baseOpts.instanceName,
    [AttrNames.CallerMethod]: baseOpts.methodName,
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
  const otel: AbstractOtelComponent | undefined = traceService?.otel ?? baseOpts.webApp[otelKey] ?? void 0,

  const decoratorContext: DecoratorContext = {
    webApp: baseOpts.webApp,
    webContext: baseOpts.webContext,
    otelComponent: otel,
    traceService: traceService ?? void 0,
    traceContext: traceContext ?? void 0,
    traceSpan: void 0,
  }

  const keyOpts: GenKeyOptions = {
    ...mdata,
    startActiveSpan,
    methodArgs: baseOpts.methodArgs,
    decoratorContext,
    callerClass: baseOpts.instanceName,
    callerMethod: baseOpts.methodName,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  const ret: DecoratorExecutorOptions<TraceDecoratorArg> = {
    ...baseOpts,
    callerAttr,
    spanName,
    spanOptions: mdata,
    startActiveSpan,
    traceContext,
    traceService,
  }

  return ret
}


