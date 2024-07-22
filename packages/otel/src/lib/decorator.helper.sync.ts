import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { Application, Context } from '@mwcp/share'
import { isArrowFunction } from '@waiting/shared-core'

import type { DecoratorExecutorParam, DecoratorContext, TraceDecoratorOptions } from './abstract.trace-service.js'
import { processDecoratorSpanData } from './decorator.helper.base.js'
import { AttrNames } from './types.js'
import { isSpanEnded } from './util.js'


// #region processDecoratorBeforeAfterSync

export function processDecoratorBeforeAfterSync(
  scope: Context | Application,
  type: 'before' | 'after' | 'afterThrow',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): void {

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
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['before']>
      data = func2(options.methodArgs, decoratorContext)
    }
    else if (type === 'after') {
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['after']>
      data = func2(options.methodArgs, options.methodResult, decoratorContext)
    }
    else {
      const func2 = funcBind as NonNullable<TraceDecoratorOptions['afterThrow']>
      assert(options.error, 'options.error is required')
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

      processDecoratorSpanData(scope, traceService, span, data)
    }
  }

}

