import assert from 'node:assert'

import {
  Init,
  Inject,
  Provide,
} from '@midwayjs/core'
import { Context as WebContext, MConfig, getRouterInfo, RouterInfoLite } from '@mwcp/share'
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

import { AbstractTraceService, StartScopeActiveSpanOptions } from './abstract.js'
import { OtelComponent } from './component.js'
import { initSpanStatusOptions } from './config.js'
import {
  AddEventOptions,
  AttrNames,
  ConfigKey,
  Config,
  MiddlewareConfig,
  SpanStatusOptions,
  middlewareEnableCacheKey,
} from './types.js'
import {
  genRequestSpanName,
  getIncomingRequestAttributesFromWebContext,
  getSpan,
  setSpan,
  setSpanWithRequestHeaders,
} from './util.js'


@Provide()
export class TraceService extends AbstractTraceService {

  @MConfig(ConfigKey.config) readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) readonly mwConfig: MiddlewareConfig

  @Inject() readonly ctx: WebContext
  @Inject() readonly otel: OtelComponent

  rootContext: Context
  rootSpan: Span
  isStarted = false
  routerInfo: RouterInfoLite | undefined

  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  @Init()
  async init(): Promise<void> {
    if (! this.ctx[middlewareEnableCacheKey]) { return }

    const routerInfo = await getRouterInfo(this.ctx)
    this.routerInfo = routerInfo
    this.start()
  }

  /**
   * @default scope is `this.ctx`
   */
  getActiveContext(scope?: object): Context {
    const obj = scope ?? this.ctx
    const ctx = this.otel.getScopeActiveContext(obj)
    return ctx ? ctx : this.rootContext
  }

  /**
   * @default scope is `this.ctx`
   */
  setActiveContext(ctx: Context, scope?: object): void {
    if (! this.config.enable) { return }
    const obj = scope ?? this.ctx
    this.otel.setScopeActiveContext(obj, ctx)
  }

  /**
   * @default scope is `this.ctx`
   */
  delActiveContext(scope?: object): void {
    if (! this.config.enable) { return }
    const obj = scope ?? this.ctx
    this.otel.delScopeActiveContext(obj)
  }

  /**
   * @default scope is `this.ctx`
   */
  getActiveSpan(scope?: object): Span | undefined {
    if (! this.config.enable) { return }
    const traceCtx = this.getActiveContext(scope)
    const span = getSpan(traceCtx)
    return span
  }

  getTraceId(): string {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return this.isStarted || this.rootSpan ? this.rootSpan.spanContext().traceId : ''
  }

  /**
   * Starts a new {@link Span}. Start the span without setting it on context.
   * This method do NOT modify the current Context.
   * @default scope is `this.ctx`
   */
  startSpan(
    name: string,
    options?: SpanOptions,
    traceContext?: Context,
    scope?: object,
  ): Span {

    const ctx = traceContext ?? this.getActiveContext(scope)
    const span = this.otel.startSpan(name, options, ctx)
    return span
  }

  /**
   * Starts a new {@link Span}.
   * Additionally the new span gets set in context and this context is activated, you must to call `this.endSpan()` manually.
   * @default options.scope is `this.ctx`
   */
  startScopeActiveSpan(options: StartScopeActiveSpanOptions): Span {
    const scope = options.scope ?? this.ctx
    const parentCtx = options.traceContext ?? this.getActiveContext(scope)
    const span = this.startSpan(options.name, options.spanOptions, parentCtx, scope)
    const traceCtx = setSpan(parentCtx, span)
    this.setActiveContext(traceCtx, scope)
    return span
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
  startActiveSpan<F extends (
    ...args: [Span, Context]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: Context,
    scope?: object,
  ): ReturnType<F> {

    const parentCtx = traceContext ?? this.getActiveContext(scope)
    const span = this.startSpan(name, options, parentCtx, scope)
    const traceCtx = setSpan(parentCtx, span)
    this.setActiveContext(traceCtx, scope)
    const cb = () => callback(span, traceCtx)
    return context.with(traceCtx, cb, void 0, span)
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
    options?: AddEventOptions,
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
    this.otel.setAttributes(target, input)
  }

  setAttributesLater(span: Span | undefined, input: Attributes): void {
    if (! this.config.enable) { return }

    const target = span ?? this.rootSpan
    this.otel.setAttributesLater(target, input)
  }

  /**
   * Finish the root span and clean the context.
   */
  finish(
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.isStarted) { return }
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
    this.delActiveContext()

    this.ctx[`_${ConfigKey.serviceName}`] = null
  }


  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }

  // #region private methods

  protected genRootSpanName(): string {
    const opts = {
      /** ctx.request?.protocol */
      protocol: this.ctx.request.protocol || '',
      /** ctx.method */
      method: this.ctx.method,
      route: this.routerInfo?.fullUrl ?? '',
    }
    const spanName = this.config.rootSpanName && typeof this.config.rootSpanName === 'function'
      ? this.config.rootSpanName(this.ctx)
      : genRequestSpanName(opts)
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

    Object.defineProperty(this.ctx, `_${ConfigKey.serviceName}`, {
      enumerable: true,
      writable: true,
      value: this,
    })
    if (! this.config.enable) { return }

    this.initRootSpan()
    this.isStarted = true

    const events: Attributes = {
      event: AttrNames.RequestBegin,
      time: this.startTime,
    }
    this.addEvent(this.rootSpan, events)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.ctx.get && setSpanWithRequestHeaders(
      this.rootSpan,
      this.otel.captureHeadersMap.get('request'),
      key => this.ctx.get(key),
    )

    Promise.resolve()
      .then(async () => {
        const attrs = await getIncomingRequestAttributesFromWebContext(this.ctx, this.config)
        attrs[AttrNames.RequestStartTime] = this.startTime
        this.setAttributes(this.rootSpan, attrs)
      })
      .catch((err: Error) => {
        this.setRootSpanWithError(err)
        console.error(err)
      })
  }


}
