import assert from 'assert'

import { Attributes, SpanKind, SpanOptions } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.js'
import type { TraceDecoratorOptions } from '../decorator.types.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function decoratorExecutor(options: DecoratorExecutorParam<TraceDecoratorOptions>): Promise<unknown> {
  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const {
    config,
    callerAttr,
    spanName,
    spanOptions,
    method,
    methodArgs,
    mergedDecoratorParam,
    otelComponent,
  } = options

  assert(otelComponent, 'otelComponent is required')

  /* c8 ignore next 3 */
  if (! config.enable) {
    return method(...methodArgs)
  }

  const traceCtx = otelComponent.appInitProcessContext
  /* c8 ignore next 4 */
  if (! otelComponent.appInitProcessSpan || ! traceCtx) {
    return method(...methodArgs)
  }

  const spanOpts: SpanOptions = {
    ...spanOptions,
    kind: SpanKind.INTERNAL,
  }
  const span = otelComponent.startSpan(spanName, spanOpts, traceCtx)

  span.setAttributes(callerAttr)

  const events: Attributes = {
    event: `${spanName}.begin`,
  }
  const addEventOptions = {
    traceEvent: true,
    logCpuUsage: true,
    logMemoryUsage: true,
  }
  otelComponent.addEvent(span, events, addEventOptions)

  if (mergedDecoratorParam) {
    await processDecoratorBeforeAfterAsync('before', options, span, void 0)
  }

  // execute method
  const resp = await method(...methodArgs)

  if (mergedDecoratorParam) {
    await processDecoratorBeforeAfterAsync('after', options, span, resp)
  }

  const events2: Attributes = {
    event: `${spanName}.end`,
  }
  otelComponent.addEvent(span, events2, addEventOptions)
  otelComponent.endSpan(otelComponent.appInitProcessSpan, span)

  return resp
}


