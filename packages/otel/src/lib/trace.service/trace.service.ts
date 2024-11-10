/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'

import {
  App,
  ApplicationContext,
  IMidwayContainer,
  Init,
  Inject,
  Singleton,
} from '@midwayjs/core'
import {
  type ClzInstance,
  type Context,
  type DecoratorExecutorParamBase,
  type GrpcContext,
  Application,
  MConfig,
  retrieveRequestProtocolFromCtx,
} from '@mwcp/share'
import {
  Attributes,
  Context as TraceContext,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatusCode,
  TimeInput,
  propagation,
} from '@opentelemetry/api'
import { genISO8601String } from '@waiting/shared-core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { OtelComponent } from '../component.js'
import { initSpanStatusOptions } from '../config.js'
import {
  type Config,
  type MiddlewareConfig,
  type SpanStatusOptions,
  AttrNames,
  ConfigKey,
  TraceScopeType,
  middlewareEnableCacheKey,
} from '../types.js'
import {
  genRequestSpanName,
  getIncomingRequestAttributesFromWebContext,
  getSpan,
  setSpanWithRequestHeaders,
} from '../util.js'

import { TraceServiceSpan } from './trace.service.span.js'
import type { DecoratorTraceDataResp, DecoratorTraceDataRespAsync } from './trace.service.types.js'


@Singleton()
export class TraceService extends TraceServiceSpan {
  @App() declare readonly app: Application
  @ApplicationContext() declare readonly applicationContext: IMidwayContainer

  @MConfig(ConfigKey.config) declare readonly config: Config
  @MConfig(ConfigKey.middlewareConfig) readonly mwConfig: MiddlewareConfig

  @Inject() declare readonly otel: OtelComponent

  @Init()
  async init(): Promise<void> {
    await this.startOnInit(this.app)
  }

  async startOnRequest(webCtx: Context): Promise<TraceContext | undefined> {
    if (! this.config.enable) { return }
    if (webCtx.getAttr(middlewareEnableCacheKey) !== 'true') { return }
    if (this.isStartedMap.get(webCtx) === true) {
      return this.getActiveContext()
    }

    await this.addRequestRouterInfo(webCtx)

    const traceContext = this.initRootSpan(webCtx)
    this.isStartedMap.set(webCtx, true)

    const events: Attributes = {
      event: AttrNames.RequestBegin,
      time: this.startTime,
    }
    const rootSpan = getSpan(traceContext)
    // const rootSpan = this.getRootSpan(webCtx)
    // assert(rootSpan === rootSpan, 'span should be equal to rootSpan')
    if (rootSpan) {
      this.addEvent(rootSpan, events)
      setSpanWithRequestHeaders(
        rootSpan,
        this.otel.captureHeadersMap.get('request'),
        (key) => {
          if (typeof webCtx.get === 'function') {
            return webCtx.get(key)
          }
        },
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

    return traceContext
  }


  /**
   * Finish the root span and clean the context.
   */
  finish(
    webCtx: Application | Context | GrpcContext,
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


  protected initRootSpan(scope: Context): TraceContext {
    assert(scope, 'initRootSpan() webCtx should not be null, maybe this calling is not in a request context')

    let ret: TraceContext | undefined = void 0

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const traceCtx = typeof scope.getApp === 'function' && scope.request?.headers
      ? propagation.extract(ROOT_CONTEXT, scope.request.headers)
      : ROOT_CONTEXT
    this.startActiveSpan(
      this.genRootSpanName(scope),
      (span, ctx) => {
        assert(span, 'rootSpan should not be null on init')
        this.setRootContext(scope, ctx)
        ret = ctx
      },
      { kind: SpanKind.SERVER },
      traceCtx,
      scope,
    )
    assert(ret, 'initRootSpan() failed')
    return ret
  }

  protected genRootSpanName(scope: Context): string {
    const routerInfo = this.getRequestRouterInfo(scope)
    const protocol = retrieveRequestProtocolFromCtx(scope) || 'unknown'
    const opts = {
      protocol,
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

export type ExecutorParamBase<T extends TraceDecoratorOptions = TraceDecoratorOptions> = DecoratorExecutorParamBase<T>

export type DecoratorExecutorParam<T extends TraceDecoratorOptions = TraceDecoratorOptions> = ExecutorParamBase<T>
  & GenDecoratorExecutorOptions
  & {
    readonly rootTraceContext: TraceContext,
    callerAttr: { [AttrNames.CallerClass]: string, [AttrNames.CallerMethod]: string },
    spanName: string,
    spanOptions: Partial<SpanOptions>,
    startActiveSpan: boolean,
    traceContext: TraceContext | undefined,
    traceScope: TraceScopeType | undefined,
    span: Span | undefined,
  }

export type TraceOptions<M extends MethodTypeUnknown | undefined = undefined> = Partial<TraceDecoratorOptions<M>> | string

// #region TraceDecoratorOptions

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
