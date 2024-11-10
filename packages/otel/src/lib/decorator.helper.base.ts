import type { Span } from '@opentelemetry/api'

import type {
  DecoratorTraceDataResp,
  TraceService,
} from './trace.service/index.trace.service.js'
import type { Attributes, TraceContext, TraceScopeParamType } from './types.js'
import { getSpan } from './util.js'


export function processDecoratorSpanData(
  rootTraceContext: TraceContext,
  traceService: TraceService,
  span: Span,
  info: DecoratorTraceDataResp | undefined,
): void {

  if (info && Object.keys(info).length > 0) {
    const { attrs, events, rootAttrs, rootEvents } = info
    if (! attrs && ! events && ! rootAttrs && ! rootEvents) { return }

    const rootSpan = getSpan(rootTraceContext)
    processEvents(traceService, span, events)
    processEvents(traceService, rootSpan, rootEvents)

    processAttrs(traceService, span, attrs)
    processAttrs(traceService, rootSpan, rootAttrs)
  }
}

function processAttrs(
  traceService: TraceService,
  span: Span | undefined,
  attrs: Attributes | undefined,
): void {

  if (! attrs || ! span || ! Object.keys(attrs).length) { return }
  traceService.setAttributes(span, attrs)
}

function processEvents(
  traceService: TraceService,
  span: Span | undefined,
  events: Attributes | undefined,
): void {

  if (! events || ! span || ! Object.keys(events).length) { return }
  traceService.addEvent(span, events)
}

export function isTraceScopeParamType(input: TraceScopeParamType | undefined): input is TraceScopeParamType {
  if (! input) {
    return false
  }

  switch (typeof input) {
    case 'string':
      return true

    case 'symbol':
      return true

    case 'object':
      return true

    default:
      return false
  }
}

