/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'

import {
  type AsyncContextManager,
  App,
  ApplicationContext,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
  Inject,
  Init,
  IMidwayContainer,
  Singleton,
} from '@midwayjs/core'
import {
  type ClzInstance,
  type Context,
  type DecoratorExecutorParamBase,
  type RouterInfoLite,
  Application,
  MConfig,
  getRouterInfo,
} from '@mwcp/share'
import {
  Attributes,
  Context as TraceContext,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatusCode,
  TimeInput,
  context as contextFunc,
} from '@opentelemetry/api'
import { genISO8601String } from '@waiting/shared-core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { OtelComponent } from './component.js'
import { initSpanStatusOptions } from './config.js'
import {
  type AddEventOptions,
  type Config,
  type MiddlewareConfig,
  type SpanStatusOptions,
  AttrNames,
  ConfigKey,
  middlewareEnableCacheKey,
  TraceScopeParamType,
  TraceScopeType,
} from './types.js'
import {
  genRequestSpanName,
  getIncomingRequestAttributesFromWebContext,
  getSpan,
  setSpanWithRequestHeaders,
} from './util.js'


@Singleton()
export class TraceService {
  @App() readonly app: Application
  @ApplicationContext() readonly applicationContext: IMidwayContainer

  @MConfig(ConfigKey.config) readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) readonly mwConfig: MiddlewareConfig

  @Inject() readonly otel: OtelComponent

  readonly isStartedMap = new WeakMap <TraceScopeType, boolean>()

  // @FIXME
  readonly routerInfoMap = new WeakMap<TraceScopeType, RouterInfoLite>()

  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  @Init()
  async init(): Promise<void> {
    await this.startOnInit(this.app)
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

  async startOnRequest(webCtx: Context): Promise<void> {
    if (! webCtx[middlewareEnableCacheKey]) { return }
    if (this.isStartedMap.get(webCtx) === true) { return }

    Object.defineProperty(webCtx, `_${ConfigKey.serviceName}`, {
      enumerable: true,
      writable: true,
      value: this,
    })
    if (! this.config.enable) { return }

    await this.addRequestRouterInfo(webCtx)

    this.initRootSpan(webCtx)
    this.isStartedMap.set(webCtx, true)

    const events: Attributes = {
      event: AttrNames.RequestBegin,
      time: this.startTime,
    }
    const rootSpan = this.getRootSpan(webCtx)
    if (rootSpan) {
      this.addEvent(rootSpan, events)
      setSpanWithRequestHeaders(
        rootSpan,
        this.otel.captureHeadersMap.get('request'),
        key => webCtx.get(key),
      )
    }

    Promise.resolve()
      .then(async () => {
        const attrs = await getIncomingRequestAttributesFromWebContext(webCtx, this.config)
        attrs[AttrNames.RequestStartTime] = this.startTime
        this.setAttributes(rootSpan, attrs)
      })
      .catch((err: Error) => {
        this.setRootSpanWithError(err, void 0, webCtx)
        console.error(err)
      })
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

  /**
   * Finish the root span and clean the context.
   */
  finish(
    webCtx: Application | Context,
    spanStatusOptions: SpanStatusOptions = initSpanStatusOptions,
    endTime?: TimeInput,
  ): void {

    if (! this.config.enable) { return }

    if (! this.isStartedMap.get(webCtx)) { return }

    const time = genISO8601String()

    const events: Attributes = {
      time,
      event: AttrNames.RequestEnd,
    }

    const rootSpan = this.getRootSpan(webCtx)
    assert(rootSpan, 'rootSpan should not be null')

    this.addEvent(rootSpan, events)

    const attr: Attributes = {
      [AttrNames.RequestEndTime]: time,
    }
    this.setAttributes(rootSpan, attr)

    if (spanStatusOptions.code !== SpanStatusCode.ERROR) {
      spanStatusOptions.code = SpanStatusCode.OK
    }
    this.endRootSpan(spanStatusOptions, endTime, webCtx)

    this.delActiveContext(webCtx)
    if (webCtx !== this.app) {
      // @ts-ignore
      webCtx[`_${ConfigKey.serviceName}`] = null
    }
  }


  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }

  // #region protected methods

  protected async startOnInit(webApplication: Application): Promise<void> {
    if (! this.config.enable) { return }
    if (this.isStartedMap.get(webApplication) === true) { return }

    this.isStartedMap.set(webApplication, true)

    // const events: Attributes = {
    //   event: AttrNames.RequestBegin,
    //   time: this.startTime,
    // }
    // const rootSpan = this.getRootSpan(webApplication)
    // rootSpan && this.addEvent(rootSpan, events)
  }


  protected initRootSpan(scope: Context): void {
    assert(scope, 'initRootSpan() webCtx should not be null, maybe this calling is not in a request context')

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const traceCtx = typeof scope.getApp === 'function' && scope.request?.headers
      ? propagation.extract(ROOT_CONTEXT, scope.request.headers)
      : ROOT_CONTEXT
    this.startActiveSpan(
      this.genRootSpanName(scope),
      (span, ctx) => {
        assert(span, 'rootSpan should not be null on init')
        this.setRootContext(scope, ctx)
      },
      { kind: SpanKind.SERVER },
      traceCtx,
      scope,
    )
  }

  protected genRootSpanName(scope: Context): string {
    const routerInfo = this.getRequestRouterInfo(scope)
    const opts = {
      /** ctx.request?.protocol */
      protocol: scope.request.protocol || '',
      /** ctx.method */
      method: scope.method,
      route: routerInfo?.fullUrl ?? scope.path,
    }
    const spanName = this.config.rootSpanName && typeof this.config.rootSpanName === 'function'
      ? this.config.rootSpanName(scope)
      : genRequestSpanName(opts)
    return spanName
  }

}


// #region types

export interface GenDecoratorExecutorOptions {
  config: Config
  traceService: TraceService
}


export interface StartScopeActiveSpanOptions {
  name: string
  /**
   * @default scope is request context
   */
  scope?: TraceScopeType | undefined
  spanOptions?: SpanOptions | undefined
  traceContext?: TraceContext | undefined
}

export interface EndSpanOptions {
  span: Span
  scope?: TraceScopeType | undefined
  spanStatusOptions?: SpanStatusOptions
  endTime?: TimeInput
}

export type ExecutorParamBase<T extends TraceDecoratorOptions = TraceDecoratorOptions> = DecoratorExecutorParamBase<T>

export type DecoratorExecutorParam<T extends TraceDecoratorOptions = TraceDecoratorOptions> = ExecutorParamBase<T>
  & GenDecoratorExecutorOptions
  & {
    callerAttr: { [AttrNames.CallerClass]: string, [AttrNames.CallerMethod]: string },
    spanName: string,
    spanOptions: Partial<SpanOptions>,
    startActiveSpan: boolean,
    traceContext: TraceContext | undefined,
    traceScope: TraceScopeType | undefined,
    span: Span | undefined,
  }

export type TraceOptions<M extends MethodTypeUnknown | undefined = undefined> = Partial<TraceDecoratorOptions<M>> | string

export interface TraceDecoratorOptions<
  /** Decorated method */
  M extends MethodTypeUnknown | undefined = undefined,
  /** Arguments of decorated method */
  MParamType = M extends MethodTypeUnknown<infer P> ? P : unknown[],
  MResultType = M extends MethodTypeUnknown<any[], infer R> ? R : unknown,
  MThis = unknown extends ThisParameterType<M> ? ClzInstance : ThisParameterType<M>,
> extends SpanOptions {

  /** @default `{target.name}/{methodName}` */
  spanName: string | KeyGenerator<MThis, MParamType> | undefined
  /**
   * @default true
   */
  startActiveSpan: boolean
  traceContext: TraceContext | undefined
  /**
   * Used as the prefix of the span name,
   * if spanName is not provided,
   *   and the Caller ClassName is `AutoConfiguration` | `ContainerConfiguration`,
   *   and the Caller MethodName is event name, such as `onReady` | `onServerReady`,
   */
  namespace: string | undefined
  /**
   * @default `/`
   */
  spanNameDelimiter: string | undefined

  /**
   * 生成唯一标识符，用于确定同一方法的跨度, 避免异步方法并发调用时调用链关系混乱
   * Generate the unique key for spans determination of the same method,
   * avoid the confusion of call chain relationship when async methods are called concurrently
   * @default undefined, runtime value rule (priority from high to low):
   * - passed value in options.traceScope
   * - generated automatically retrieved from object arg of the method args, that containing key `traceScope`,
   * - webContext (traceService.ctx)
   * - run before the `before()` method
   * @caution symbol must be non-registered symbols, it means Symbol(string) is valid, and Symbol.for(string) is invalid
   * @note `TraceInit()` not supported
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
   */
  scope: ScopeGenerator<MThis, MParamType> | TraceScopeParamType | undefined

  before: MethodTypeUnknown<
    [MParamType, DecoratorContext<MThis>], // input args
    DecoratorTraceDataResp | DecoratorTraceDataRespAsync, // output data
    ThisParameterType<M> // this
  > | undefined

  after: MethodTypeUnknown<
    [MParamType, Awaited<MResultType>, DecoratorContext<MThis>], // input args
    DecoratorTraceDataResp | DecoratorTraceDataRespAsync, // output data
    ThisParameterType<M> // this
  > | undefined

  afterThrow: MethodTypeUnknown<
    [MParamType, Error, DecoratorContext<MThis>], // input args
    DecoratorTraceDataResp | DecoratorTraceDataRespAsync, // output data
    ThisParameterType<M> // this
  > | undefined

  /**
   * @default true
   */
  autoEndSpan: boolean | undefined
}

export interface DecoratorTraceData {
  /**
   * End then span after method `before()` or `after()` called
   * used by TraceLog decorator, ignored by TraceInit/Trace decorator
   * @default false
   */
  endSpanAfterTraceLog?: boolean
  /** tags */
  attrs?: Attributes
  /** logs */
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes
}
export type DecoratorTraceDataResp = DecoratorTraceData | undefined | null
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | undefined | null>

export type KeyGenerator<
  TThis = any,
  ArgsType = unknown[],
  DContext extends DecoratorContext = DecoratorContext,
> = (
  this: TThis,
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => string | undefined

export type ScopeGenerator<
  TThis = any,
  ArgsType = unknown[],
  DContext extends DecoratorContextBase = DecoratorContextBase,
> = (
  this: TThis,
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => object | symbol

export interface DecoratorContextBase {
  webApp: Application | undefined
  webContext: Context | undefined
  traceService: TraceService | undefined
  traceScope: TraceScopeType | undefined
  /** Caller Class name */
  instanceName: string
  methodName: string
}
export interface DecoratorContext<T = ClzInstance> extends DecoratorContextBase {
  traceContext: TraceContext | undefined
  traceSpan: Span | undefined
  instance: T
}
