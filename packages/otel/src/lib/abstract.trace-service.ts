/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Application, Context, DecoratorExecutorParamBase, ClzInstance, ScopeType } from '@mwcp/share'
import type { Attributes, Context as TraceContext, Span, SpanOptions, TimeInput } from '@opentelemetry/api'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import type { AbstractOtelComponent } from './abstract.component.js'
import type { AddEventOptions, AttrNames, Config, SpanStatusOptions } from './types.js'


export abstract class AbstractTraceService {

  readonly abstract isStartedMap: WeakMap<symbol | object, boolean>
  readonly abstract otel: AbstractOtelComponent
  readonly abstract instanceId: symbol
  readonly abstract startTime: string
  readonly abstract rootSpanMap: WeakMap<symbol | object, Span>

  abstract getWebContext(): Context | undefined
  abstract getRootTraceContext(scope: Context | Application): TraceContext | undefined
  abstract getRootSpan(scope: Context | Application): Span | undefined

  abstract getActiveContext(scope?: TraceScopeType): TraceContext
  abstract setActiveContext(traceContext: TraceContext, scope?: TraceScopeType): void
  abstract getActiveSpan(scope?: TraceScopeType): Span | undefined
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
    traceContext?: TraceContext,
    scope?: TraceScopeType,
  ): Span

  /**
   * Starts a new {@link Span}.
   * Additionally the new span gets set in context and this context is activated, you must to call `this.endSpan()` manually.
   * @default options.scope is `this.ctx`
   */
  abstract startScopeActiveSpan(options: StartScopeActiveSpanOptions): { span: Span, traceContext: TraceContext }

  /**
   * Starts a new {@link Span} and calls the given function passing it the created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   * @CAUTION: the span returned by this method is NOT ended automatically,
   *   you must to call `this.endSpan()` manually instead of span.edn() directly.
   */
  abstract startActiveSpan<F extends (...args: [Span, TraceContext]) => ReturnType<F>>(
    name: string,
    callback: F,
    options?: SpanOptions,
    traceContext?: TraceContext,
    scope?: Application | Context,
  ): ReturnType<F>

  /**
   * - ends the given span
   * - set span with error if error passed in params
   * - set span status
   * - call span.end(), except span is root span
   */
  abstract endSpan(options: EndSpanOptions): void

  abstract endRootSpan(
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
    scope?: TraceScopeType,
  ): void

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  abstract setSpanWithError(
    span: Span,
    error: Error | undefined,
    eventName?: string,
    scope?: TraceScopeType,
  ): void

  /**
   * Sets the span with the error passed in params, note span not ended.
   */
  abstract setRootSpanWithError(
    error: Error | undefined,
    eventName?: string,
    scope?: TraceScopeType,
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
    webCtx: Application | Context,
    spanStatusOptions?: SpanStatusOptions,
    endTime?: TimeInput,
  ): void

  abstract flush(): Promise<void>

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

export interface GenDecoratorExecutorOptions {
  config: Config
  traceService: AbstractTraceService
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

export type TraceScopeParamType = string | ScopeType
export type TraceScopeType = ScopeType


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
  /** tags */
  attrs?: Attributes
  /** logs */
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes
}
export type DecoratorTraceDataResp = DecoratorTraceData | undefined
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | undefined>

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
  traceService: AbstractTraceService | undefined
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


/* c8 ignore stop */
