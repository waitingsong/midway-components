import assert from 'assert'

import { Attributes, SpanKind, SpanOptions } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.js'
import type { TraceDecoratorOptions } from '../decorator.types.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function before(options: DecoratorExecutorParam<TraceDecoratorOptions>): Promise<void> {
  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const {
    callerAttr,
    spanName,
    spanOptions,
    mergedDecoratorParam,
    otelComponent,
  } = options

  assert(otelComponent, 'otelComponent is required')

  const traceCtx = otelComponent.appInitProcessContext
  const spanOpts: SpanOptions = {
    ...spanOptions,
    kind: SpanKind.INTERNAL,
  }
  const span = otelComponent.startSpan(spanName, spanOpts, traceCtx)
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
  otelComponent.addEvent(span, events, addEventOptions)

  if (mergedDecoratorParam) {
    await processDecoratorBeforeAfterAsync('before', options)
  }
}

export async function afterReturn(options: DecoratorExecutorParam<TraceDecoratorOptions>): Promise<unknown> {
  const { span } = options
  if (! span) {
    return options.methodResult
  }

  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const {
    spanName,
    mergedDecoratorParam,
    otelComponent,
  } = options

  assert(otelComponent, 'otelComponent is required')

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
  otelComponent.addEvent(span, events2, addEventOptions)
  otelComponent.endSpan(otelComponent.appInitProcessSpan, span)

  return options.methodResult
}


