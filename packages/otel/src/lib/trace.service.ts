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
  SpanStatus,
  SpanStatusCode,
  context,
} from '@opentelemetry/api'
import { SemanticAttributes } from '@opentelemetry/semantic-conventions'
import {
  genISO8601String,
  humanMemoryUsage,
} from '@waiting/shared-core'

import { OtelComponent } from './component'
import { initSpanStatusOptions } from './config'
import {
  AttrNames,
  SpanStatusOptions,
  ConfigKey,
  Config,
  MiddlewareConfig,
} from './types'
import {
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

  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  protected isStarted = false
  protected readonly traceContextArray: Context[] = []

  @Init()
  async init(): Promise<void> {
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
    const currCtx = this.getActiveContext()
    if (currCtx === ctx) { return }
    this.traceContextArray.push(ctx)
  }

  getActiveSpan(): Span | undefined {
    const ctx = this.getActiveContext()
    const span = getSpan(ctx)
    return span
  }

  getTraceId(): string {
    return this.rootSpan.spanContext().traceId
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
  endSpan(span: Span, spanStatusOptions: SpanStatusOptions = initSpanStatusOptions): void {
    const opts: SpanStatusOptions = {
      ...initSpanStatusOptions,
      ...spanStatusOptions,
    }
    const { code } = opts
    if (code === SpanStatusCode.ERROR) {
      this.setSpanWithError(span, spanStatusOptions.error)
    }
    else { // OK, UNSET
      const status: SpanStatus = {
        code,
      }
      if (opts.message) {
        status.message = opts.message
      }
      span.setStatus(status)
    }

    if (span !== this.rootSpan) {
      span.end()
    }
  }

  endRootSpan(spanStatusOptions: SpanStatusOptions = initSpanStatusOptions): void {
    this.endSpan(this.rootSpan, spanStatusOptions)
    this.rootSpan.end()
  }

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setSpanWithError(
    span: Span,
    error: Error | undefined,
    eventName?: string,
  ): void {

    const time = genISO8601String()
    const attrs: Attributes = {
      time,
    }
    if (eventName) {
      attrs['event'] = eventName
    }

    if (error) {
      attrs[AttrNames.HTTP_ERROR_NAME] = error.name
      attrs[AttrNames.HTTP_ERROR_MESSAGE] = error.message
      span.setAttributes(attrs)

      this.addRootSpanEventWithError(error)

      // @ts-ignore
      if (error.cause instanceof Error || error[AttrNames.IsTraced]) {
        if (span !== this.rootSpan) {
          // error contains cause, then add events only
          attrs[SemanticAttributes.EXCEPTION_MESSAGE] = 'skipping'
          this.addEvent(span, attrs)
        }
      }
      else { // if error contains no cause, add error stack to span
        span.recordException(error)
      }

      Object.defineProperty(error, AttrNames.IsTraced, {
        enumerable: false,
        writable: false,
        value: true,
      })
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message ?? 'unknown error' })
  }

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  setRootSpanWithError(
    error: Error | undefined,
    eventName?: string,
  ): void {

    this.setSpanWithError(this.rootSpan, error, eventName)
  }

  /**
   * Adds an event to the given span.
   */
  addEvent(span: Span | undefined, input: Attributes, eventName?: string): void {
    const ename = typeof input['event'] === 'string' || typeof input['event'] === 'number'
      ? String(input['event']) : ''
    const name = eventName ? eventName : ename
    delete input['event']

    const span2 = span ?? this.rootSpan
    span2.addEvent(name, input)
  }

  /**
   * Sets the attributes to the given span.
   */
  setAttributes(span: Span | undefined, input: Attributes): void {
    const target = span ?? this.rootSpan
    target.setAttributes(input)
  }


  /**
   * Finish the root span and clean the context.
   */
  finish(spanStatusOptions: SpanStatusOptions = initSpanStatusOptions): void {
    if (! this.config.enable) { return }

    const time = genISO8601String()

    if (spanStatusOptions.code !== SpanStatusCode.ERROR) {
      spanStatusOptions.code = SpanStatusCode.OK
    }

    const events: Attributes = {
      time,
      event: AttrNames.RequestEnd,
    }
    if (this.config.logMemeoryUsage) {
      events[AttrNames.ServiceMemoryUsage] = JSON.stringify(humanMemoryUsage(), null, 2)
    }
    if (this.config.logCpuUsage) {
      events[AttrNames.ServiceCpuUsage] = JSON.stringify(process.cpuUsage(), null, 2)
    }

    this.addEvent(this.rootSpan, events)

    const attr: Attributes = {
      [AttrNames.RequestEndTime]: time,
    }
    this.setAttributes(this.rootSpan, attr)
    this.endRootSpan(spanStatusOptions)
  }


  async flush(): Promise<void> {
    await this.otel.flush()
  }

  /* --------------------- */

  protected start(): void {
    if (this.isStarted) { return }

    const { method } = this.ctx
    const traceCtx = propagation.extract(ROOT_CONTEXT, this.ctx.request.headers)
    const protocol = this.ctx.request.protocol.toLocaleUpperCase()
    const spanName = this.config.rootSpanName && typeof this.config.rootSpanName === 'function'
      ? this.config.rootSpanName(this.ctx)
      : `${protocol} ${method} ${this.ctx.url}`

    this.startActiveSpan(spanName, (span, ctx) => {
      assert(span, 'rootSpan should not be null on init')
      this.rootSpan = span
      this.rootContext = ctx
    }, { kind: SpanKind.SERVER }, traceCtx)


    const events: Attributes = {
      event: AttrNames.RequestBegin,
      time: this.startTime,
    }
    if (this.config.logMemeoryUsage) {
      events[AttrNames.ServiceMemoryUsage] = JSON.stringify(humanMemoryUsage(), null, 2)
    }
    if (this.config.logCpuUsage) {
      events[AttrNames.ServiceCpuUsage] = JSON.stringify(process.cpuUsage(), null, 2)
    }

    this.addEvent(this.rootSpan, events)

    setSpanWithRequestHeaders(
      this.rootSpan,
      this.otel.captureHeadersMap.get('request'),
      key => this.ctx.get(key),
    )

    const attrs = getIncomingRequestAttributesFromWebContext(this.ctx, this.config)
    attrs[AttrNames.RequestStartTime] = this.startTime
    this.setAttributes(this.rootSpan, attrs)

    this.isStarted = true
  }


  protected addRootSpanEventWithError(error?: Error): void {
    if (! error) { return }

    const span = this.rootSpan
    const { cause } = error

    // @ts-ignore
    if (cause instanceof Error || error[AttrNames.IsTraced]) {
      return // avoid duplicated logs for the same error on the root span
    }

    const { name, message, stack } = error
    const attrs: Attributes = {
      [SemanticAttributes.EXCEPTION_TYPE]: 'exception',
      [SemanticAttributes.EXCEPTION_MESSAGE]: message,
    }
    stack && (attrs[SemanticAttributes.EXCEPTION_STACKTRACE] = stack)
    this.addEvent(span, attrs, `${name}-Cause`) // Error-Cause
  }

}
