/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'

import {
  type IMidwayContainer,
  type AsyncContextManager,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
} from '@midwayjs/core'
import {
  type Application,
  type Context,
  type RouterInfoLite,
  genISO8601String,
  getRouterInfo,
} from '@mwcp/share'
import type {
  Attributes,
  Context as TraceContext,
  Span,
  SpanOptions,
  TimeInput,
} from '@opentelemetry/api'
import { context as contextFunc } from '@opentelemetry/api'

import type { OtelComponent } from './component.js'
import { initSpanStatusOptions } from './config.js'
import type { EndSpanOptions, StartScopeActiveSpanOptions } from './trace.service.types.js'
import type { TraceScopeType, AddEventOptions, Config, SpanStatusOptions } from './types.js'
import { getSpan } from './util.js'


export class TraceServiceBase {
  declare app: Application
  declare applicationContext: IMidwayContainer
  declare config: Config
  declare otel: OtelComponent

  readonly isStartedMap = new WeakMap <TraceScopeType, boolean>()
  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  // @FIXME
  readonly routerInfoMap = new WeakMap<TraceScopeType, RouterInfoLite>()

  setProperty(key: string, value: any): void {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this[key] = value
    void 0
  }

  getWebContext(): Context | undefined {
    try {
      const contextManager: AsyncContextManager = this.applicationContext.get(
        ASYNC_CONTEXT_MANAGER_KEY,
      )
      const ctx = contextManager.active().getValue(ASYNC_CONTEXT_KEY) as Context | undefined
      return ctx
    }
    catch (ex) {
      void ex
      // console.warn(new Error('getWebContext() failed', { cause: ex }))
      return void 0
    }
  }

  getWebContextThenApp(): Context | Application {
    try {
      const webContext = this.getWebContext()
      assert(webContext, 'getActiveContext() webContext should not be null, maybe this calling is not in a request context')
      return webContext
    }
    catch (ex) {
      console.warn('getWebContextThenApp() failed', ex)
      return this.app
    }
  }

  async addRequestRouterInfo(webCtx: Context): Promise<void> {
    const routerInfo = await getRouterInfo(webCtx)
    // assert(routerInfo, new MidwayHttpError(`Path not found: "${webCtx.path}"`, 404))
    routerInfo && this.routerInfoMap.set(webCtx, routerInfo)
  }

  getRequestRouterInfo(webCtx: TraceScopeType): RouterInfoLite | undefined {
    const routerInfo = this.routerInfoMap.get(webCtx)
    return routerInfo
  }

  // #region context methods

  getActiveContext(scope: TraceScopeType): TraceContext {
    const traceContext = this.getActiveContextOnlyScope(scope)
    if (traceContext) {
      return traceContext
    }

    const webAppCtx = this.getWebContext()
    if (webAppCtx) {
      const traceCtx = this.otel.getScopeActiveContext(webAppCtx)
      if (traceCtx) {
        return traceCtx
      }
    }
    // create new span and traceContext
    const ctx4 = this.otel.getGlobalCurrentContext()
    return ctx4
  }

  getActiveContextOnlyScope(scope: TraceScopeType): TraceContext | undefined {
    assert(scope, 'getActiveContext() scope should not be null')
    const ctx = this.otel.getScopeActiveContext(scope)
    if (ctx) {
      return ctx
    }
    const webContext = this.getWebContext()
    if (scope === webContext || scope === this.app) {
      const ctx2 = this.getRootTraceContext(scope as Application | Context)
      assert(ctx2, 'getActiveContext() trace ctx should not be null with scope value= webContext or app')
      return ctx2
    }
  }

  setActiveContext(traceContext: TraceContext, scope: TraceScopeType): void {
    if (! this.config.enable) { return }
    const obj = scope
    this.otel.setScopeActiveContext(obj, traceContext)
  }

  delActiveContext(scope?: TraceScopeType): void {
    if (! this.config.enable) { return }
    const obj = scope ?? this.getWebContext()
    if (obj) {
      this.otel.emptyScopeActiveContext(obj)
    }
  }

  // #region span methods

  getRootTraceContext(scope: TraceScopeType): TraceContext | undefined {
    return this.otel.getScopeRootTraceContext(scope)
  }

  setRootContext(scope: TraceScopeType, traceContext: TraceContext): void {
    const rootCtx = this.getRootTraceContext(scope)
    if (rootCtx && rootCtx === traceContext) { return }
    assert(! rootCtx, 'TraceService.setRootContext() failed, scope root trace context exists already')
    this.otel.setScopeActiveContext(scope, traceContext)
  }

  getRootSpan(scope: TraceScopeType): Span | undefined {
    const rootSpan = this.otel.getRootSpan(scope)
    return rootSpan
  }


  /**
   * Get span from the given scope, if not exists, get span from the request context or application.
   */
  getActiveSpan(scope?: TraceScopeType): Span | undefined {
    if (! this.config.enable) { return }
    const scope2 = scope ?? this.getWebContext()
    assert(scope2, 'getActiveSpan() scope should not be null')
    const traceCtx = this.getActiveContext(scope2)
    const span = getSpan(traceCtx)
    return span
  }

  /**
   * Get span from the given scope
   */
  getActiveSpanOnlyScope(scope: TraceScopeType): Span | undefined {
    if (! this.config.enable) { return }
    assert(scope, 'getActiveSpanOnlyScope() scope should not be null')
    const traceCtx = this.getActiveContextOnlyScope(scope)
    if (! traceCtx) { return }
    const span = getSpan(traceCtx)
    return span
  }


  getTraceId(): string {
    const webCtx = this.getWebContext()
    if (webCtx) {
      const rootSpan = this.getRootSpan(webCtx)
      if (rootSpan) {
        return rootSpan.spanContext().traceId
      }
    }
    return ''
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
  ): { span: Span, traceContext: TraceContext } {

    let traceCtx = traceContext
    if (! traceCtx) {
      const scope2 = scope ?? this.getWebContext()
      assert(scope2, 'startSpan() scope should not be null')
      traceCtx = this.getActiveContext(scope2)
    }

    const ret = this.otel.startSpan(name, options, traceCtx)
    return ret
  }

  /**
   * Starts a new {@link Span}.
   * Additionally the new span gets set in context and this context is activated, you must to call `this.endSpan()` manually.
   * @default scope is `request ctx`
   */
  startScopeActiveSpan(options: StartScopeActiveSpanOptions): { span: Span, traceContext: TraceContext } {
    const scope = options.scope ?? this.getWebContext()
    assert(scope, 'startScopeActiveSpan() scope should not be null')

    const parentCtx = options.traceContext ?? this.getActiveContext(scope)
    const ret = this.otel.startSpanContext(options.name, options.spanOptions, parentCtx)
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
    scope?: Application | Context,
  ): ReturnType<F> {

    const scope2 = scope ?? this.getWebContext()
    assert(scope2, 'scope should not be null')

    const { span, traceContext: traceCtx } = this.startScopeActiveSpan({
      name,
      spanOptions: options,
      traceContext,
      scope: scope2,
    })
    const cb = () => callback(span, traceCtx)
    return contextFunc.with(traceCtx, cb, void 0, span)
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
    scope?: Application | Context,
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

  setAttributesLater(span: Span | undefined, input: Attributes): void {
    if (! this.config.enable) { return }

    let target = span
    if (! target) {
      const webCtx = this.getWebContext()
      assert(webCtx, 'setAttributesLater() webCtx should not be null, maybe this calling is not in a request context')
      const rootSpan = this.getRootSpan(webCtx)
      assert(rootSpan, 'rootSpan should not be null')
      target = rootSpan
    }
    this.otel.setAttributesLater(target, input)
  }

  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }


}

