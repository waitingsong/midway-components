import assert from 'node:assert'

import type { DecoratorExecutorParamBase } from '@mwcp/share'
import type { Span } from '@opentelemetry/api'
import { isArrowFunction } from '@waiting/shared-core'

import type { SpanStatusOptions } from '##/lib/types.js'

import type {
  DecoratorContext,
  DecoratorExecutorParam,
  GenDecoratorExecutorOptions,
  KeyGenerator,
  TraceDecoratorOptions,
} from './trace.service/index.trace.service.js'
import type { TraceServiceSpan } from './trace.service/trace.service.span.js'
import { AttrNames } from './types.js'


const configNameList = [
  'AutoConfiguration',
  'ContainerConfiguration',
]

interface GenKeyOptions extends Partial<TraceDecoratorOptions> {
  methodArgs: unknown[]
  decoratorContext: DecoratorContext
  callerClass: string
  callerMethod: string
  instance: DecoratorExecutorParam['instance']
}

function genKey(options: GenKeyOptions): string {
  const {
    methodArgs,
    decoratorContext,
    spanName,
    spanNameDelimiter,
    instance,
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
      assert(instance, 'options.instance is required')
      const funcBind: KeyGenerator = isArrowFunction(spanName) ? spanName : spanName.bind(instance)
      const keyStr = funcBind(methodArgs as [], decoratorContext)
      assert(
        typeof keyStr === 'string' || typeof keyStr === 'undefined',
        'keyGenerator function must return a string or undefined',
      )
      if (keyStr) {
        return keyStr
      }
      break
    }

    /* c8 ignore next 3 */
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
      /* c8 ignore next 4 */
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

      /* c8 ignore next 4 */
      case 'onStop': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      /* c8 ignore next 4 */
      case 'onHealthCheck': {
        name = `TraceInit ${namespace}.${options.callerMethod.toString()}`
        break
      }

      /* c8 ignore next 2 */
      default:
        break
    }
  }

  return name
}


export function genDecoratorExecutorOptions(
  optionsBase: DecoratorExecutorParamBase<TraceDecoratorOptions>,
  optionsExt: GenDecoratorExecutorOptions,
): DecoratorExecutorParam<TraceDecoratorOptions> {

  const { methodArgs } = optionsBase

  const { traceService } = optionsExt
  assert(traceService, 'traceService is required')

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
    traceService,
    traceContext: mergedDecoratorParam.traceContext,
    traceSpan: void 0,
    traceScope: void 0,
    /** Caller Class name */
    instanceName: optionsBase.instanceName,
    /** Caller method name */
    methodName: optionsBase.methodName,
    instance: optionsBase.instance,
  }

  const keyOpts: GenKeyOptions = {
    ...mergedDecoratorParam,
    callerClass: optionsBase.instanceName,
    callerMethod: optionsBase.methodName,
    decoratorContext,
    methodArgs,
    instance: optionsBase.instance,
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
    traceContext: mergedDecoratorParam.traceContext,
    traceService,
    traceScope: void 0,
    span: void 0,
  }

  return ret
}


export function endTraceSpan(traceService: TraceServiceSpan, span: Span, spanStatusOptions: SpanStatusOptions | undefined): void {
  if (spanStatusOptions) {
    traceService.endSpan({ span, spanStatusOptions })
  }
  else {
    traceService.endSpan({ span })
  }
}
