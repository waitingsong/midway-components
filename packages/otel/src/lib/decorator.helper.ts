import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { Span } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract.js'
import type { DecoratorContext, DecoratorTraceDataResp, TraceDecoratorOptions } from './decorator.types.js'
import { DecoratorExecutorParam } from './trace.helper.js'
import { AttrNames } from './types.js'


export async function processDecoratorBeforeAfterAsync(
  type: 'before' | 'after',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): Promise<void> {

  const { mergedDecoratorParam, otelComponent, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    // @ts-expect-error
    if (typeof span.ended === 'function') {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      assert(! span.ended(), 'span is ended after method call')
    }
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      traceContext: options.traceContext,
      traceSpan: span,
    }

    let data
    if (type === 'before') {
      const func2 = func as NonNullable<TraceDecoratorOptions['before']>
      data = await func2(options.methodArgs, decoratorContext)
    }
    else {
      const func2 = func as NonNullable<TraceDecoratorOptions['after']>
      data = await func2(options.methodArgs, options.methodResult, decoratorContext)
    }

    if (data) {
      const eventName = type
      if (data.events && ! Object.keys(data.events).includes(eventName)) {
        data.events['event'] = eventName
      }
      processDecoratorSpanData(otelComponent, traceService, span, data)
    }
  }
  return
}

export function processDecoratorBeforeAfterSync(
  type: 'before' | 'after',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): void {

  const { mergedDecoratorParam, otelComponent, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    // @ts-expect-error
    if (typeof span.ended === 'function') {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      assert(! span.ended(), 'span is ended after method call')
    }
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      traceContext: options.traceContext,
      traceSpan: span,
    }

    let data
    if (type === 'before') {
      const func2 = func as NonNullable<TraceDecoratorOptions['before']>
      data = func2(options.methodArgs, decoratorContext)
    }
    else {
      const func2 = func as NonNullable<TraceDecoratorOptions['after']>
      data = func2(options.methodArgs, options.methodResult, decoratorContext)
    }

    if (data) {
      if (isPromise(data)) {
        const err = new Error(`processDecoratorBeforeAfterSync() decorator ${type}() return value is a promise,
      class: ${options.callerAttr[AttrNames.CallerClass]}, method: ${options.callerAttr[AttrNames.CallerMethod]}`)
        console.error(err)
        return
      }

      const eventName = type
      if (data.events && ! Object.keys(data.events).includes(eventName)) {
        data.events['event'] = eventName
      }
      processDecoratorSpanData(otelComponent, traceService, span, data)
    }
  }
  return
}

function processDecoratorSpanData(
  otelComponent: AbstractOtelComponent,
  traceService: AbstractTraceService | undefined,
  span: Span,
  info: DecoratorTraceDataResp | undefined,
): void {

  if (info && Object.keys(info).length > 0) {
    const { attrs, events, rootAttrs, rootEvents } = info
    if (events) {
      if (traceService) {
        traceService.addEvent(span, events)
      }
      else {
        otelComponent.addEvent(span, events)
      }
    }

    if (rootEvents) {
      if (traceService) {
        traceService.addEvent(traceService.rootSpan, rootEvents)
      }
    }

    if (rootAttrs && Object.keys(rootAttrs).length) {
      if (traceService) {
        traceService.setAttributes(traceService.rootSpan, rootAttrs)
      }
    }

    if (attrs && Object.keys(attrs).length) {
      if (traceService) {
        traceService.setAttributes(span, attrs)
      }
      else {
        otelComponent.setAttributes(span, attrs)
      }
    }
  }
}
