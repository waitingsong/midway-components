import assert from 'node:assert'

import type { Application, Context, GrpcContext } from '@mwcp/share'
import type {
  Attributes,
  Context as TraceContext,
  Span,
  SpanOptions,
  TimeInput,
} from '@opentelemetry/api'
import { context as contextFunc } from '@opentelemetry/api'

import { initSpanStatusOptions } from '../config.js'
import type { AddEventOptions, SpanStatusOptions, TraceScopeType } from '../types.js'
import { getSpan } from '../util.js'

import { type TraceInfo, TraceServiceBase } from './trace.service.base.js'
import type { EndSpanOptions, StartScopeActiveSpanOptions } from './trace.service.types.js'


export class TraceServiceSpan extends TraceServiceBase {

  getTraceId(): string {
    return this.otel.getTraceId() ?? ''
  }

  getRootSpan(scope: TraceScopeType): Span | undefined {
    const rootSpan = this.otel.getRootSpan(scope)
    return rootSpan
  }


  /**
   * Get span from the given scope, if not exists, get span from the request context or application.
   */
  getActiveSpan(): Span | undefined {
    return this.getActiveTraceInfo().span
  }

  getActiveTraceInfo(): TraceInfo {
    const traceCtx = this.getActiveContext()
    const span = getSpan(traceCtx)
    assert(span, 'getActiveTraceInfo() span should not be null')
    return { span, traceContext: traceCtx }
  }

  /**
   * Starts a new {@link Span}. Start the span **without** setting it on context.
   * This method do NOT modify the current Context.
   * @default scope is `request ctx`
   */
  startSpan(
    name: string,
    options?: SpanOptions,
    traceContext?: TraceContext,
    scope?: TraceScopeType,
  ): TraceInfo {

    let traceCtx = traceContext
    if (! traceCtx) {
      const scope2 = scope ?? this.getWebContext()
      assert(scope2, 'startSpan() scope should not be null')
      traceCtx = this.getActiveContext()
    }

    const ret = this.otel.startSpan(name, options, traceCtx)
    return ret
  }

  /**
   * Starts a new {@link Span}. Start the span **without** setting it on context.
   * @default scope is `request ctx`
   */
  startScopeSpan(options: StartScopeActiveSpanOptions): TraceInfo {
    const scope = options.scope ?? this.getWebContext()
    assert(scope, 'startScopeSpan() scope should not be null')

    const parentCtx = options.traceContext ?? this.getActiveContext()
    const ret = this.otel.startSpanContext(options.name, options.spanOptions, parentCtx)
    // const cb = (span: Span, ctx: TraceContext) => { return { span, traceContext: ctx } }
    // const ret: TraceInfo = this.otel.startActiveSpan(options.name, cb, options.spanOptions, parentCtx)
    assert(ret, 'startScopeActiveSpan() ret should not be null')

    this.setActiveContext(ret.traceContext, scope)
    return ret
  }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   *
   * @default scope is `this.ctx`
   * @CAUTION: the span returned by this method is NOT ended automatically,
   *   you must to call `this.endSpan()` manually instead of span.edn() directly.
   */
  startActiveSpan<F extends (...args: [Span, TraceContext]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: TraceContext,
    scope?: TraceScopeType,
  ): ReturnType<F> {

    const scope2 = scope ?? this.getWebContext()
    assert(scope2, 'scope should not be null')

    const { span, traceContext: traceCtx } = this.startScopeSpan({
      name,
      spanOptions: options,
      traceContext,
      scope: scope2,
    })
    return contextFunc.with(traceCtx, callback, void 0, span, traceCtx)
  }

  /**
   * Do following steps:
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  endSpan(options: EndSpanOptions): void {
    const { span, spanStatusOptions, endTime, scope } = options
    if (! this.config.enable) { return }

    const scope2 = scope ?? this.getWebContext()
    const rootSpan = scope2 ? this.getRootSpan(scope2) : void 0
    const statusOpts = spanStatusOptions ?? initSpanStatusOptions
    const isRootSpan = scope2 ? this.otel.spanIsRootSpan(scope2, span) : true // true?
    if (isRootSpan) {
      this.otel.endRootSpan(span, spanStatusOptions, endTime)
    }
    else {
      this.otel.endSpan(rootSpan, span, statusOpts, endTime)
    }
  }

  endRootSpan(
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
    scope?: TraceScopeType,
  ): void {

    if (! this.config.enable) { return }
    assert(scope, 'scope should not be null')

    const rootSpan = this.getRootSpan(scope)
    assert(rootSpan, 'traceService.endRootSpan(): rootSpan should not be null')
    this.otel.endRootSpan(rootSpan, spanStatusOptions, endTime)
  }


  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setSpanWithError(
    span: Span,
    error: Error | undefined,
    eventName?: string,
    scope?: TraceScopeType,
  ): void {

    if (! this.config.enable) { return }

    const scope2 = scope ?? this.getWebContext()
    const rootSpan = scope2 ? this.getRootSpan(scope2) : void 0
    this.otel.setSpanWithError(rootSpan, span, error, eventName)
  }

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setRootSpanWithError(
    error: Error | undefined,
    eventName?: string,
    scope?: Application | Context | GrpcContext,
  ): void {

    if (! this.config.enable) { return }

    const scope2 = scope ?? this.getWebContext()
    const rootSpan = scope2 ? this.getRootSpan(scope2) : void 0
    if (rootSpan) {
      this.otel.setSpanWithError(rootSpan, rootSpan, error, eventName)
    }
  }

  /**
   * Adds an event to the given span.
   */
  addEvent(
    span: Span,
    input: Attributes,
    options?: AddEventOptions,
  ): void {

    if (! this.config.enable) { return }
    this.otel.addEvent(span, input, options)
  }

  /**
   * Sets the attributes to the given span.
   */
  setAttributes(span: Span | undefined, input: Attributes): void {
    if (! this.config.enable) { return }

    let target = span
    if (! target) {
      const webCtx = this.getWebContext()
      assert(webCtx, 'setAttributes() webCtx should not be null, maybe this calling is not in a request context')
      const rootSpan = this.getRootSpan(webCtx)
      assert(rootSpan, 'rootSpan should not be null')
      target = rootSpan
    }
    this.otel.setAttributes(target, input)
  }

}


