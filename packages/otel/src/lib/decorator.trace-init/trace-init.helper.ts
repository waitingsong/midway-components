import assert from 'assert'

import { Attributes, SpanKind, SpanOptions } from '@opentelemetry/api'

import type { TraceDecoratorArg } from '../decorator.types'
import type { DecoratorExecutorOptions } from '../trace.helper'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<TraceDecoratorArg>,
): Promise<unknown> {

  const { webApp, methodIsAsyncFunction } = options
  assert(webApp, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')


  const {
    callerAttr,
    spanName,
    spanOptions,
    method,
    methodArgs,
    otelComponent,
    // startActiveSpan,
  } = options

  const traceCtx = otelComponent.appInitProcessContext
  if (! otelComponent.appInitProcessSpan || ! traceCtx) {
    const resp = await method(...methodArgs)
    return resp
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
  const addEventOtpions = {
    traceEvent: true,
    logCpuUsage: true,
    logMemeoryUsage: true,
  }
  otelComponent.addEvent(span, events, addEventOtpions)

  const resp = await method(...methodArgs)

  const events2: Attributes = {
    event: `${spanName}.end`,
  }
  otelComponent.addEvent(span, events2, addEventOtpions)

  otelComponent.endSpan(otelComponent.appInitProcessSpan, span)

  return resp
}


