/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert'

import { DecoratorExecutorParamBase } from '@mwcp/share'
import { Attributes, SpanOptions } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract.js'
import {
  DecoratorContext,
  TraceDecoratorOptions,
} from './decorator.types.js'
import {
  AttrNames,
  Config,
  ConfigKey,
  TraceContext,
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
      case 'onReady':

      // eslint-disable-next-line no-fallthrough
      case 'onServerReady': {
        name = `INIT ${namespace}.${options.callerMethod.toString()}`
      }
    }
  }

  return name
}

export type ExecutorParamBase<T extends TraceDecoratorOptions = TraceDecoratorOptions> = DecoratorExecutorParamBase<T>

export interface DecoratorExecutorParam<T extends TraceDecoratorOptions = TraceDecoratorOptions>
  extends ExecutorParamBase<T> {
  config: Config
  callerAttr: Attributes
  spanName: string
  spanOptions: Partial<SpanOptions>
  startActiveSpan: boolean
  otelComponent: AbstractOtelComponent
  traceContext: TraceContext | undefined
  traceService: AbstractTraceService | undefined
}

export interface GenDecoratorExecutorOptions {
  config: Config
  otelComponent: AbstractOtelComponent
}

export function genDecoratorExecutorOptions(
  optionsBase: DecoratorExecutorParamBase<TraceDecoratorOptions>,
  optionsExt: GenDecoratorExecutorOptions,
): DecoratorExecutorParam<TraceDecoratorOptions> {

  assert(optionsBase.webApp, 'options.webApp is undefined')
  assert(optionsBase.instanceName, 'options.instanceName is undefined')
  assert(optionsBase.methodName, 'options.methodName is undefined')

  let traceService
  if (optionsBase.webContext) {
    traceService = optionsBase.webContext[`_${ConfigKey.serviceName}`] as AbstractTraceService | undefined
    assert(traceService, 'TraceService is not initialized. (TraceService 尚未初始化)')
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

  const decoratorContext: DecoratorContext = {
    webApp: optionsBase.webApp,
    webContext: optionsBase.webContext,
    otelComponent,
    traceService,
    traceContext: mergedDecoratorParam.traceContext,
    traceSpan: void 0,
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

  const callerAttr: Attributes = {
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
  }

  return ret
}


