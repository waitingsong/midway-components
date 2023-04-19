/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { DecoratorExecutorParamBase } from '@mwcp/share'
import { Attributes, SpanOptions } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract'
import {
  DecoratorContext,
  TraceDecoratorOptions as TraceDecoratorParam,
} from './decorator.types'
import {
  AttrNames,
  ConfigKey,
  TraceContext,
} from './types'


interface GenKeyOptions extends Partial<TraceDecoratorParam> {
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
    spanNameDelimiter,
  } = options

  const delimiter = spanNameDelimiter
    ? spanNameDelimiter
    : '/'

  switch (typeof spanName) {
    case 'string': {
      if (spanName.length > 0) {
        return spanName
      }
      break
    }

    case 'undefined': {
      let name = genEventKeyWhenSpanNameEmpty(options)
      if (! name) {
        name = `${options.callerClass.toString()}${delimiter}${options.callerMethod.toString()}`
      }
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

  const name = `${options.callerClass.toString()}${delimiter}${options.callerMethod.toString()}`
  return name
}

/**
 * For TraceInit used on AutoConfiguration
 */
function genEventKeyWhenSpanNameEmpty(options: GenKeyOptions): string {
  const {
    callerClass,
    callerMethod,
    namespace,
    spanName,
  } = options

  assert(! spanName, 'spanName is not empty')

  let name = ''

  if (callerClass === 'AutoConfiguration' && namespace) {
    switch (callerMethod) {
      case 'onReady':
      case 'onServerReady': {
        name = `INIT ${namespace}.${options.callerMethod.toString()}`
      }
    }
  }

  return name
}

type ExecutorParamBase<T extends TraceDecoratorParam = TraceDecoratorParam> = DecoratorExecutorParamBase<T>

export interface DecoratorExecutorParam<T extends TraceDecoratorParam = TraceDecoratorParam>
  extends ExecutorParamBase<T> {
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<SpanOptions>
  startActiveSpan: boolean
  otelComponent: AbstractOtelComponent
  traceContext: TraceContext | undefined
  traceService: AbstractTraceService | undefined
}

export function genDecoratorExecutorOptions(
  options: ExecutorParamBase,
): DecoratorExecutorParam {

  assert(options.webApp, 'options.webApp is undefined')
  assert(options.instanceName, 'options.instanceName is undefined')
  assert(options.methodName, 'options.methodName is undefined')

  const traceService = options.webContext?.[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined

  const otelKey = `_${ConfigKey.componentName}`
  // @ts-ignore
  const otel: AbstractOtelComponent | undefined = traceService?.otel ?? options.webApp[otelKey] ?? void 0
  assert(otel, 'OtelComponent is not initialized. (OTEL 尚未初始化。)')

  const { mergedDecoratorParam } = options
  assert(mergedDecoratorParam, 'mergedDecoratorParam is undefined')

  if (typeof mergedDecoratorParam.startActiveSpan !== 'boolean') {
    mergedDecoratorParam.startActiveSpan = true
  }

  const decoratorContext: DecoratorContext = {
    webApp: options.webApp,
    webContext: options.webContext,
    otelComponent: otel,
    traceService: traceService ?? void 0,
    traceContext: mergedDecoratorParam.traceContext,
    traceSpan: void 0,
  }

  const keyOpts: GenKeyOptions = {
    ...mergedDecoratorParam,
    callerClass: options.instanceName,
    callerMethod: options.methodName,
    decoratorContext,
    methodArgs: options.methodArgs,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  const callerAttr: Attributes = {
    [AttrNames.CallerClass]: options.instanceName,
    [AttrNames.CallerMethod]: options.methodName,
  }


  const ret: DecoratorExecutorParam<TraceDecoratorParam> = {
    ...options,
    callerAttr,
    spanName,
    spanOptions: mergedDecoratorParam,
    startActiveSpan: mergedDecoratorParam.startActiveSpan,
    otelComponent: otel,
    traceContext: mergedDecoratorParam.traceContext,
    traceService,
  }

  return ret
}


