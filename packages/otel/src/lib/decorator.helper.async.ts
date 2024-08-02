import assert from 'node:assert'

import type { Application, Context } from '@mwcp/share'
import { isArrowFunction } from '@waiting/shared-core'

import { processDecoratorSpanData } from './decorator.helper.base.js'
import type { DecoratorExecutorParam, DecoratorContext, TraceDecoratorOptions } from './trace.service.js'
import { isSpanEnded } from './util.js'

// #region processDecoratorBeforeAfterAsync

export async function processDecoratorBeforeAfterAsync(
  scope: Context | Application,
  type: 'before' | 'after' | 'afterThrow',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): Promise<void> {

  const { mergedDecoratorParam, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    assert(! isSpanEnded(span), 'span is ended after method call')
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
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
      const func2 = funcBind
      // @ts-expect-error param type
      data = await func2(options.methodArgs, decoratorContext)
    }
    else if (type === 'after') {
      const func2 = funcBind
      // @ts-expect-error param type
      data = await func2(options.methodArgs, options.methodResult, decoratorContext)
    }
    else {
      const func2 = funcBind
      assert(options.error, 'options.error is required')
      // @ts-expect-error param type
      data = await func2(options.methodArgs, options.error, decoratorContext)
    }

    if (data) {
      const eventName = type
      if (data.events && ! data.events['event']) {
        data.events['event'] = eventName
      }

      processDecoratorSpanData(scope, traceService, span, data)
    }
  }
}

