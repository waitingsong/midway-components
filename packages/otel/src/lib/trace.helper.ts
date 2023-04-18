/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { DecoratorExecutorOptionsBase } from '@mwcp/share'
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
  options: DecoratorExecutorOptionsBase<TraceDecoratorArg>,
): DecoratorExecutorOptions<TraceDecoratorArg> {

  assert(options.webApp, 'options.webApp is undefined')
  assert(options.instanceName, 'options.instanceName is undefined')
  assert(options.methodName, 'options.methodName is undefined')

  const traceService = options.webContext?.[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: options.instanceName,
    [AttrNames.CallerMethod]: options.methodName,
  }

  const { argsFromMethodDecorator } = options

  const mdata: Partial<TraceDecoratorArg> = argsFromMethodDecorator && typeof argsFromMethodDecorator === 'object'
    ? argsFromMethodDecorator
    : { spanName: argsFromMethodDecorator }

  const startActiveSpan = typeof mdata.startActiveSpan === 'boolean'
    ? mdata.startActiveSpan
    : true
  const { traceContext } = mdata

  const otelKey = `_${ConfigKey.componentName}`
  // @ts-expect-error
  const otel: AbstractOtelComponent | undefined = traceService?.otel ?? options.webApp[otelKey] ?? void 0,

  const decoratorContext: DecoratorContext = {
    webApp: options.webApp,
    webContext: options.webContext,
    otelComponent: otel,
    traceService: traceService ?? void 0,
    traceContext: traceContext ?? void 0,
    traceSpan: void 0,
  }

  const keyOpts: GenKeyOptions = {
    ...mdata,
    callerClass: options.instanceName,
    callerMethod: options.methodName,
    decoratorContext,
    methodArgs: options.methodArgs,
    startActiveSpan,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  assert(options.argsFromClassDecorator, 'options.argsFromClassDecorator is undefined')
  assert(options.argsFromMethodDecorator, 'options.argsFromMethodDecorator is undefined')

  const ret: DecoratorExecutorOptions<TraceDecoratorArg> = {
    ...options,
    callerAttr,
    spanName,
    spanOptions: mdata,
    startActiveSpan,
    traceContext,
    traceService,
  }

  return ret
}


