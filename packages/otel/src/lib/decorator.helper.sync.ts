import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import { isArrowFunction } from '@waiting/shared-core'

import { processDecoratorSpanData } from './decorator.helper.base.js'
import type { DecoratorExecutorParam, DecoratorContext, TraceDecoratorOptions, DecoratorTraceDataResp } from './trace.service.js'
import { AttrNames } from './types.js'
import { isSpanEnded } from './util.js'


// #region processDecoratorBeforeAfterSync

export function processDecoratorBeforeAfterSync(
  type: 'before' | 'after' | 'afterThrow',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): DecoratorTraceDataResp {

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

    let data: DecoratorTraceDataResp
    if (type === 'before') {
      const func2 = funcBind
      // @ts-expect-error param type
      data = func2(options.methodArgs, decoratorContext)
    }
    else if (type === 'after') {
      const func2 = funcBind
      // @ts-expect-error param type
      data = func2(options.methodArgs, options.methodResult, decoratorContext)
    }
    else {
      const func2 = funcBind
      assert(options.error, 'options.error is required')
      // @ts-expect-error param type
      data = func2(options.methodArgs, options.error, decoratorContext)
    }

    if (data) {
      if (isPromise(data)) {
        const err = new Error(`processDecoratorBeforeAfterSync() decorator ${type}() return value is a promise,
      class: ${options.callerAttr[AttrNames.CallerClass]}, method: ${options.callerAttr[AttrNames.CallerMethod]}`)
        console.error(err)
        return
      }

      const eventName = type
      if (data.events && ! data.events['event']) {
        data.events['event'] = eventName
      }

      assert(options.traceScope, 'processDecoratorBeforeAfterSync(): traceScope is required')
      processDecoratorSpanData(options.traceScope, traceService, span, data)
    }

    return data
  }

}

