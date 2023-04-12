import assert from 'assert'

import { Attributes, SpanKind, SpanOptions } from '@opentelemetry/api'

import { OtelComponent } from '../component'
import { DecoratorExecutorOptions } from '../trace.helper'
import { ConfigKey, TraceDecoratorArg } from '../types'


export async function decoratorExecutor(
  options: DecoratorExecutorOptions<TraceDecoratorArg>,
): Promise<unknown> {

  const { webApplication, methodIsAsyncFunction } = options
  assert(webApplication, 'webApplication is required')
  assert(methodIsAsyncFunction === true, 'decorated method must be AsyncFunction')

  const key = `_${ConfigKey.componentName}`
  // @ts-ignore
  const otel = webApplication[key] as OtelComponent | undefined
  // if (! otel) {
  //   otel = await webApplication.getApplicationContext().getAsync(OtelComponent)
  // }
  assert(otel, 'OtelComponent is not initialized. (OTEL 尚未初始化。)')

  const {
    callerAttr,
    spanName,
    spanOptions,
    // startActiveSpan,
  } = options

  const { method, methodArgs } = options
  const traceCtx = otel.appInitProcessContext
  if (! otel.appInitProcessSpan || ! traceCtx) {
    const resp = await method(...methodArgs)
    return resp
  }

  const spanOpts: SpanOptions = {
    ...spanOptions,
    kind: SpanKind.INTERNAL,
  }
  const span = otel.startSpan(spanName, spanOpts, traceCtx)

  span.setAttributes(callerAttr)

  const events: Attributes = {
    event: `${spanName}.begin`,
  }
  const addEventOtpions = {
    traceEvent: true,
    logCpuUsage: true,
    logMemeoryUsage: true,
  }
  otel.addEvent(span, events, addEventOtpions)

  const resp = await method(...methodArgs, span)

  const events2: Attributes = {
    event: `${spanName}.end`,
  }
  otel.addEvent(span, events2, addEventOtpions)

  otel.endSpan(otel.appInitProcessSpan, span)

  return resp
}


