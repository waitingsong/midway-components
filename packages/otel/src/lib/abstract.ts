import { Config as _Config } from '@midwayjs/core'
import {
  Attributes,
  Context,
  Span,
  SpanOptions,
  TimeInput,
} from '@opentelemetry/api'
import { node } from '@opentelemetry/sdk-node'

import {
  AddEventOtpions,
  SpanStatusOptions,
} from './types'


/** OpenTelemetry Component */
export abstract class AbstractOtelComponent {
  /** Active during Midway Lifecyle between onReady and onServerReady */
  abstract appInitProcessContext: Context | undefined
  /** Active during Midway Lifecyle between onReady and onServerReady */
  abstract appInitProcessSpan: Span | undefined

  abstract otelLibraryName: string
  abstract otelLibraryVersion: string
  /* request|response -> Map<lower,norm> */
  readonly abstract captureHeadersMap: Map<string, Map<string, string>>

  protected abstract traceProvider: node.NodeTracerProvider | undefined
  protected abstract spanProcessors: node.SpanProcessor[]

  abstract getGlobalCurrentContext(): Context
  abstract getGlobalCurrentSpan(traceContext?: Context): Span | undefined
  abstract getTraceId(): string | undefined

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  abstract startSpan(name: string, options?: SpanOptions, traceContext?: Context): Span

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
    traceContext?: Context,
  ): ReturnType<F>

  abstract flush(): Promise<void>
  abstract shutdown(): Promise<void>

  /**
   * Adds an event to the given span.
   */
  abstract addEvent(
    span: Span,
    input: Attributes,
    options?: AddEventOtpions,
  ): void

  abstract addRootSpanEventWithError(span: Span, error?: Error): void

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
    options?: AddEventOtpions,
    /** if omit, use this.appInitProcessSpan */
    span?: Span,
  ): void

  abstract endAppInitEvent(): void
}


export abstract class AbstractTraceService {
  abstract isStarted: boolean

  readonly abstract otel: AbstractOtelComponent
  readonly abstract instanceId: symbol
  readonly abstract startTime: string
  protected readonly abstract traceContextArray: Context[]

  abstract getActiveContext(): Context
  abstract setActiveContext(ctx: Context): void
  abstract getActiveSpan(): Span | undefined
  abstract getTraceId(): string

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  abstract startSpan(
    name: string,
    options?: SpanOptions,
    traceContext?: Context,
  ): Span

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   * @CAUTION: the span returned by this method is NOT ended automatically,
   *   you must to call `this.endSpan()` manually instead of span.edn() directly.
   */
  abstract startActiveSpan<F extends (
    ...args: [Span, Context]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
  ): ReturnType<F>

  /**
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  abstract endSpan(
    span: Span,
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void

  abstract endRootSpan(
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  abstract setSpanWithError(
    span: Span,
    error: Error | undefined,
    eventName?: string,
  ): void

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  abstract setRootSpanWithError(
    error: Error | undefined,
    eventName?: string,
  ): void

  /**
   * Adds an event to the given span.
   */
  abstract addEvent(
    span: Span | undefined,
    input: Attributes,
    options?: AddEventOtpions,
  ): void

  /**
   * Sets the attributes to the given span.
   */
  abstract setAttributes(span: Span | undefined, input: Attributes): void

  abstract setAttributesLater(span: Span | undefined, input: Attributes): void

  /**
   * Finish the root span and clean the context.
   */
  abstract finish(
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void

  abstract flush(): Promise<void>
}

