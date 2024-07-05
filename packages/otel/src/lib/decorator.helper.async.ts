import assert from 'node:assert'

import { isArrowFunction } from '@waiting/shared-core'

import { processDecoratorSpanData } from './decorator.helper.js'
import type { DecoratorContext, TraceDecoratorOptions } from './decorator.types.js'
import type { DecoratorExecutorParam } from './trace.helper.js'
import { isSpanEnded } from './util.js'

// #region processDecoratorBeforeAfterAsync

export async function processDecoratorBeforeAfterAsync(
  type: 'before' | 'after' | 'afterThrow',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): Promise<void> {

  const { mergedDecoratorParam, otelComponent, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    assert(! isSpanEnded(span), 'span is ended after method call')
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      traceContext: options.traceContext,
      traceSpan: span,
      traceScope: options.traceScope,
      /** Caller Class name */
      instanceName: options.instanceName,
      /** Caller method name */
      methodName: options.methodName,
      instance: options.instance,
    }

    const funcBind = isArrowFunction(func) ? func : func.bind(decoratorContext.instance)

    let data
    if (type === 'before') {
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['before']>
      data = await func2(options.methodArgs, decoratorContext)
    }
    else if (type === 'after') {
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['after']>
      data = await func2(options.methodArgs, options.methodResult, decoratorContext)
    }
    else {
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['afterThrow']>
      assert(options.error, 'options.error is required')
      data = await func2(options.methodArgs, options.error, decoratorContext)
    }

    if (data) {
      const eventName = type
      if (data.events && ! data.events['event']) {
        data.events['event'] = eventName
      }
      processDecoratorSpanData(otelComponent, traceService, span, data)
    }
  }
}

