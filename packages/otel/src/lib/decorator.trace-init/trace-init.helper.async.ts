import assert from 'node:assert'

import { SpanKind } from '@opentelemetry/api'
import type { Attributes, SpanOptions } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import type { DecoratorExecutorParam, TraceDecoratorOptions } from '../trace.service.js'


export async function before(options: DecoratorExecutorParam<TraceDecoratorOptions>): Promise<void> {
  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const {
    callerAttr,
    spanName,
    spanOptions,
    mergedDecoratorParam,
    traceService,
  } = options

  options.traceScope = options.webApp

  const traceCtx = traceService.otel.appInitProcessContext
  const spanOpts: SpanOptions = {
    ...spanOptions,
    kind: SpanKind.INTERNAL,
  }
  const { span } = traceService.otel.startSpan(spanName, spanOpts, traceCtx)
  options.span = span

  span.setAttributes(callerAttr)
  const events: Attributes = {
    event: `${spanName}.begin`,
  }
  const addEventOptions = {
    traceEvent: true,
    logCpuUsage: true,
    logMemoryUsage: true,
  }
  traceService.otel.addEvent(span, events, addEventOptions)

  if (mergedDecoratorParam) {
    await processDecoratorBeforeAfterAsync('before', options)
  }
}

export async function afterReturn(options: DecoratorExecutorParam<TraceDecoratorOptions>): Promise<unknown> {
  const { span } = options
  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }

  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const {
    spanName,
    mergedDecoratorParam,
    traceService,
  } = options

  if (mergedDecoratorParam) {
    await processDecoratorBeforeAfterAsync('after', options)
  }

  const events2: Attributes = {
    event: `${spanName}.end`,
  }
  const addEventOptions = {
    traceEvent: true,
    logCpuUsage: true,
    logMemoryUsage: true,
  }
  traceService.otel.addEvent(span, events2, addEventOptions)
  traceService.otel.endSpan(traceService.otel.appInitProcessSpan, span)

  return options.methodResult
}


