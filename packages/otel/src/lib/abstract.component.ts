import type { Attributes, Context as TraceContext, Span, SpanOptions, TimeInput } from '@opentelemetry/api'
import type { node } from '@opentelemetry/sdk-node'

import type { AddEventOptions, SpanStatusOptions } from './types.js'


/** OpenTelemetry Component */
export abstract class AbstractOtelComponent {

  /** Active during Midway Lifecycle between onReady and onServerReady */
  abstract appInitProcessContext: TraceContext | undefined
  /** Active during Midway Lifecycle between onReady and onServerReady */
  abstract appInitProcessSpan: Span | undefined

  abstract otelLibraryName: string
  abstract otelLibraryVersion: string
  /* request|response -> Map<lower,norm> */
  readonly abstract captureHeadersMap: Map<string, Map<string, string>>
  readonly abstract traceContextMap: WeakMap<object, TraceContext[]>

  protected abstract traceProvider: node.NodeTracerProvider | undefined
  protected abstract spanProcessors: node.SpanProcessor[]

  abstract getGlobalCurrentContext(): TraceContext
  abstract getGlobalCurrentSpan(traceContext?: TraceContext): Span | undefined
  abstract getTraceId(): string | undefined
  abstract getScopeRootTraceContext(scope: TraceContext): TraceContext | undefined

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  abstract startSpan(name: string, options?: SpanOptions, traceContext?: TraceContext): Span
  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   */
  abstract startSpanContext(name: string, options?: SpanOptions, traceContext?: TraceContext): { span: Span, traceContext: TraceContext }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   */
  abstract startActiveSpan<F extends (
    ...args: [Span]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: TraceContext,
  ): ReturnType<F>

  abstract flush(): Promise<void>
  abstract shutdown(): Promise<void>

  /**
   * Adds an event to the given span.
   */
  abstract addEvent(
    span: Span,
    input: Attributes,
    options?: AddEventOptions,
  ): void

  abstract addSpanEventWithError(span: Span, error?: Error): void

  /**
   * Sets the attributes to the given span.
   */
  abstract setAttributes(span: Span, input: Attributes): void

  abstract setAttributesLater(span: Span | undefined, input: Attributes): void

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  abstract setSpanWithError(
    rootSpan: Span | undefined,
    span: Span,
    error: Error | undefined,
    eventName?: string,
  ): void


  /**
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  abstract endSpan(
    rootSpan: Span | undefined,
    span: Span,
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void


  abstract endRootSpan(
    rootSpan: Span,
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void


  abstract addAppInitEvent(
    input: Attributes,
    options?: AddEventOptions,
    /** if omit, use this.appInitProcessSpan */
    span?: Span,
  ): void

  abstract endAppInitEvent(): void

}

