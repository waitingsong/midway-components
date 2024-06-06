/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { DecoratorExecutorParamBase } from '@mwcp/share'
import { Span, SpanOptions } from '@opentelemetry/api'

import type { AbstractTraceService, AbstractOtelComponent } from './abstract.js'
import {
  DecoratorContext,
  TraceDecoratorOptions,
} from './decorator.types.js'
import {
  AttrNames,
  Config,
  ConfigKey,
  TraceContext,
  middlewareEnableCacheKey,
} from './types.js'


const configNameList = [
  'AutoConfiguration',
  'ContainerConfiguration',
]

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

  if (namespace && configNameList.includes(callerClass)) {
    switch (callerMethod) {
      case 'onConfigLoad': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      case 'onReady': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      case 'onServerReady': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      case 'onStop': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      case 'onHealthCheck': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }
    }
  }

  return name
}

export type ExecutorParamBase<T extends TraceDecoratorOptions = TraceDecoratorOptions> = DecoratorExecutorParamBase<T>

export type DecoratorExecutorParam<T extends TraceDecoratorOptions = TraceDecoratorOptions> = ExecutorParamBase<T>
  & GenDecoratorExecutorOptions
  & {
    callerAttr: { [AttrNames.CallerClass]: string, [AttrNames.CallerMethod]: string },
    spanName: string,
    spanOptions: Partial<SpanOptions>,
    startActiveSpan: boolean,
    traceContext: TraceContext | undefined,
    traceService: AbstractTraceService | undefined,
    span: Span | undefined,
  }

export interface GenDecoratorExecutorOptions {
  config: Config
  otelComponent: AbstractOtelComponent
}

export function genDecoratorExecutorOptions(
  optionsBase: DecoratorExecutorParamBase<TraceDecoratorOptions>,
  optionsExt: GenDecoratorExecutorOptions,
): DecoratorExecutorParam<TraceDecoratorOptions> {

  let traceService
  if (optionsBase.webContext) {
    traceService = optionsBase.webContext[`_${ConfigKey.serviceName}`]
    // 根据中间件启用状态判断是否校验 TraceService 是否初始化
    if (optionsBase.webContext[middlewareEnableCacheKey] === true) {
      assert(traceService, 'TraceService is not initialized. (TraceService 尚未初始化) 路由可能设置为忽略追踪')
    }
  }

  // const { otel } = traceService
  const { otelComponent } = optionsExt
  assert(otelComponent, 'OtelComponent is not initialized. (OTEL Component 尚未初始化)')

  const { mergedDecoratorParam } = optionsBase
  assert(mergedDecoratorParam, 'mergedDecoratorParam is undefined')

  if (typeof mergedDecoratorParam.startActiveSpan !== 'boolean') {
    mergedDecoratorParam.startActiveSpan = true
  }

  if (typeof mergedDecoratorParam.autoEndSpan !== 'boolean') {
    mergedDecoratorParam.autoEndSpan = true
  }

  // DO NOT set traceContext
  // if (! mergedDecoratorParam.traceContext) {
  //   mergedDecoratorParam.traceContext = traceService?.getActiveContext()
  // }

  const decoratorContext: DecoratorContext = {
    webApp: optionsBase.webApp,
    webContext: optionsBase.webContext,
    otelComponent,
    traceService,
    traceContext: mergedDecoratorParam.traceContext,
    traceSpan: void 0,
    /** Caller Class name */
    instanceName: optionsBase.instanceName,
    /** Caller method name */
    methodName: optionsBase.methodName,
  }

  const keyOpts: GenKeyOptions = {
    ...mergedDecoratorParam,
    callerClass: optionsBase.instanceName,
    callerMethod: optionsBase.methodName,
    decoratorContext,
    methodArgs: optionsBase.methodArgs,
  }
  const spanName = genKey(keyOpts)
  assert(spanName, 'spanName is undefined')

  const callerAttr = {
    [AttrNames.CallerClass]: optionsBase.instanceName,
    [AttrNames.CallerMethod]: optionsBase.methodName,
  }


  const ret: DecoratorExecutorParam<TraceDecoratorOptions> = {
    ...optionsBase,
    ...optionsExt,
    callerAttr,
    spanName,
    spanOptions: mergedDecoratorParam,
    startActiveSpan: mergedDecoratorParam.startActiveSpan,
    otelComponent,
    traceContext: mergedDecoratorParam.traceContext,
    traceService,
    span: void 0,
  }

  return ret
}


