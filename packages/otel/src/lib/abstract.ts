import type { Attributes, Context, Span, SpanOptions, TimeInput } from '@opentelemetry/api'
import type { node } from '@opentelemetry/sdk-node'

import type { AddEventOptions, SpanStatusOptions } from './types.js'


/** OpenTelemetry Component */
export abstract class AbstractOtelComponent {

  /** Active during Midway Lifecycle between onReady and onServerReady */
  abstract appInitProcessContext: Context | undefined
  /** Active during Midway Lifecycle between onReady and onServerReady */
  abstract appInitProcessSpan: Span | undefined

  abstract otelLibraryName: string
  abstract otelLibraryVersion: string
  /* request|response -> Map<lower,norm> */
  readonly abstract captureHeadersMap: Map<string, Map<string, string>>
  readonly abstract traceContextMap: WeakMap<object, Context[]>

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


export abstract class AbstractTraceService {

  abstract isStarted: boolean

  readonly abstract otel: AbstractOtelComponent
  readonly abstract instanceId: symbol
  readonly abstract startTime: string
  readonly abstract rootContext: Context
  readonly abstract rootSpan: Span

  abstract getActiveContext(scope?: object | symbol): Context
  abstract setActiveContext(ctx: Context, scope?: object | symbol): void
  abstract getActiveSpan(scope?: object | symbol): Span | undefined
  /**
   * @default scope is `this.ctx`
   */
  abstract delActiveContext(scope?: object | symbol): void

  abstract getTraceId(): string
  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  abstract startSpan(
    name: string,
    options?: SpanOptions,
    traceContext?: Context,
    scope?: object | symbol,
  ): Span

  /**
   * Starts a new {@link Span}.
   * Additionally the new span gets set in context and this context is activated, you must to call `this.endSpan()` manually.
   * @default options.scope is `this.ctx`
   */
  abstract startScopeActiveSpan(options: StartScopeActiveSpanOptions): Span

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   * @CAUTION: the span returned by this method is NOT ended automatically,
   *   you must to call `this.endSpan()` manually instead of span.edn() directly.
   */
  abstract startActiveSpan<F extends (...args: [Span, Context]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
    scope?: object | symbol,
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
    options?: AddEventOptions,
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


export interface StartScopeActiveSpanOptions {
  name: string
  /**
   * @default scope is `this.ctx`
   */
  scope?: object | symbol | undefined
  spanOptions?: SpanOptions | undefined
  traceContext?: Context | undefined
}
