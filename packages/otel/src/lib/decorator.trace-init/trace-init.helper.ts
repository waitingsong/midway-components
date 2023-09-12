import assert from 'assert'
import { isAsyncFunction } from 'node:util/types'

import { Attributes, SpanKind, SpanOptions } from '@opentelemetry/api'

import type { DecoratorContext, TraceDecoratorOptions } from '../decorator.types.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function decoratorExecutor(
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
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
    mergedDecoratorParam,
    otelComponent,
    // startActiveSpan,
  } = options

  assert(otelComponent, 'otelComponent is required')

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

  const decoratorContext: DecoratorContext = {
    webApp,
    webContext: options.webContext,
    otelComponent: options.otelComponent,
    traceService: options.traceService,
    traceContext: options.traceContext,
    traceSpan: span,
  }

  if (mergedDecoratorParam) {
    const { before } = mergedDecoratorParam

    if (before && typeof before === 'function') {
      if (isAsyncFunction(before)) {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await before(methodArgs, decoratorContext)
      }
      else {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        before(methodArgs, decoratorContext)
      }
    }
  }

  // execute method
  const resp = await method(...methodArgs)

  if (mergedDecoratorParam) {
    const { after } = mergedDecoratorParam
    if (after && typeof after === 'function') {
      if (isAsyncFunction(after)) {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await after(methodArgs, decoratorContext)
      }
      else {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        after(methodArgs, decoratorContext)
      }
    }
  }

  const events2: Attributes = {
    event: `${spanName}.end`,
  }
  otelComponent.addEvent(span, events2, addEventOtpions)
  otelComponent.endSpan(otelComponent.appInitProcessSpan, span)

  return resp
}


