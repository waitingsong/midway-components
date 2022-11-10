import assert from 'node:assert'

import {
  Config as _Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import type { Context as WebContext } from '@mwcp/share'
import {
  Attributes,
  Context,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatusCode,
  context,
  TimeInput,
} from '@opentelemetry/api'
import { genISO8601String } from '@waiting/shared-core'

import { OtelComponent } from './component'
import { initSpanStatusOptions } from './config'
import {
  AttrNames,
  SpanStatusOptions,
  ConfigKey,
  Config,
  MiddlewareConfig,
  AddEventOtpions,
} from './types'
import {
  genRequestSpanName,
  getIncomingRequestAttributesFromWebContext,
  getSpan,
  setSpan,
  setSpanWithRequestHeaders,
} from './util'


@Provide()
export class TraceService {

  @_Config(ConfigKey.config) readonly config: Config
  @_Config(ConfigKey.middlewareConfig) readonly mwConfig: MiddlewareConfig

  @Inject() readonly ctx: WebContext
  @Inject() protected readonly otel: OtelComponent

  rootContext: Context
  rootSpan: Span
  isStarted = false

  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  protected readonly traceContextArray: Context[] = []

  @Init()
  init(): void {
    if (! this.config.enable) { return }
    this.start()
  }

  getActiveContext(): Context {
    const len = this.traceContextArray.length
    if (len === 0) {
      return this.rootContext
    }

    for (let i = len - 1; i >= 0; i -= 1) {
      const traceContext = this.traceContextArray.at(-1)
      if (! traceContext) {
        this.traceContextArray.pop()
        continue
      }
      const span = getSpan(traceContext)
      if (span?.spanContext()) {
        return traceContext
      }
    }

    return this.rootContext
  }

  setActiveContext(ctx: Context): void {
    if (! this.config.enable) { return }

    const currCtx = this.getActiveContext()
    if (currCtx === ctx) { return }
    this.traceContextArray.push(ctx)
  }

  getActiveSpan(): Span | undefined {
    if (! this.config.enable) { return }

    const ctx = this.getActiveContext()
    const span = getSpan(ctx)
    return span
  }

  getTraceId(): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return this.isStarted || this.rootSpan ? this.rootSpan.spanContext().traceId : ''
  }

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   */
  startSpan(
    name: string,
    options?: SpanOptions,
    traceContext?: Context,
  ): Span {

    const ctx = traceContext ?? this.getActiveContext()
    const span = this.otel.startSpan(name, options, ctx)
    return span
  }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   * @CAUTION: the span returned by this method is NOT ended automatically,
   *   you must to call `this.endSpan()` manually instead of span.edn() directly.
   */
  startActiveSpan<F extends (
    ...args: [Span, Context]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
  ): ReturnType<F> {

    const parentCtx = traceContext ?? this.getActiveContext()
    const span = this.startSpan(name, options, parentCtx)
    const ctxWithSpanSet = setSpan(parentCtx, span)
    this.setActiveContext(ctxWithSpanSet)
    const cb = () => callback(span, ctxWithSpanSet)
    return context.with(ctxWithSpanSet, cb, void 0, span)
  }

  /**
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  endSpan(
    span: Span,
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }
    this.otel.endSpan(this.rootSpan, span, spanStatusOptions, endTime)
  }

  endRootSpan(
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }
    this.otel.endSpan(this.rootSpan, this.rootSpan, spanStatusOptions, endTime)
    this.rootSpan.end(endTime)
  }

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setSpanWithError(
    span: Span,
    error: Error | undefined,
    eventName?: string,
  ): void {

    if (! this.config.enable) { return }
    this.otel.setSpanWithError(this.rootSpan, span, error, eventName)
  }

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setRootSpanWithError(
    error: Error | undefined,
    eventName?: string,
  ): void {

    if (! this.config.enable) { return }
    this.otel.setSpanWithError(this.rootSpan, this.rootSpan, error, eventName)
  }

  /**
   * Adds an event to the given span.
   */
  addEvent(
    span: Span | undefined,
    input: Attributes,
    options?: AddEventOtpions,
  ): void {

    if (! this.config.enable) { return }
    const span2 = span ?? this.rootSpan
    this.otel.addEvent(span2, input, options)
  }

  /**
   * Sets the attributes to the given span.
   */
  setAttributes(span: Span | undefined, input: Attributes): void {
    if (! this.config.enable) { return }

    const target = span ?? this.rootSpan
    target.setAttributes(input)
  }

  setAttributesLater(span: Span | undefined, input: Attributes): void {
    if (! this.config.enable) { return }

    void Promise.resolve()
      .then(() => {
        this.setAttributes(span, input)
      })
      .catch(console.warn)
  }

  /**
   * Finish the root span and clean the context.
   */
  finish(
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }

    const time = genISO8601String()

    const events: Attributes = {
      time,
      event: AttrNames.RequestEnd,
    }
    this.addEvent(this.rootSpan, events)

    const attr: Attributes = {
      [AttrNames.RequestEndTime]: time,
    }
    this.setAttributes(this.rootSpan, attr)

    if (spanStatusOptions.code !== SpanStatusCode.ERROR) {
      spanStatusOptions.code = SpanStatusCode.OK
    }
    this.endRootSpan(spanStatusOptions, endTime)
    this.traceContextArray.length = 0

    this.ctx[`_${ConfigKey.serviceName}`] = null
  }


  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }

  /* --------------------- */

  protected genRootSpanName(): string {
    const spanName = this.config.rootSpanName && typeof this.config.rootSpanName === 'function'
      ? this.config.rootSpanName(this.ctx)
      : genRequestSpanName(this.ctx)
    return spanName
  }

  protected initRootSpan(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const traceCtx = this.ctx.request?.headers
      ? propagation.extract(ROOT_CONTEXT, this.ctx.request.headers)
      : ROOT_CONTEXT
    this.startActiveSpan(this.genRootSpanName(), (span, ctx) => {
      assert(span, 'rootSpan should not be null on init')
      this.rootSpan = span
      this.rootContext = ctx
    }, { kind: SpanKind.SERVER }, traceCtx)
  }

  protected start(): void {
    if (this.isStarted) { return }
    this.initRootSpan()

    const events: Attributes = {
      event: AttrNames.RequestBegin,
      time: this.startTime,
    }
    this.addEvent(this.rootSpan, events)

    this.isStarted = true
    Object.defineProperty(this.ctx, `_${ConfigKey.serviceName}`, {
      enumerable: true,
      writable: true,
      value: this,
    })

    void Promise.resolve()
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.ctx.get && setSpanWithRequestHeaders(
          this.rootSpan,
          this.otel.captureHeadersMap.get('request'),
          key => this.ctx.get(key),
        )

        const attrs = getIncomingRequestAttributesFromWebContext(this.ctx, this.config)
        attrs[AttrNames.RequestStartTime] = this.startTime
        this.setAttributes(this.rootSpan, attrs)
      })
      .catch(console.error)
  }


}
