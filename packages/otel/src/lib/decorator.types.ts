/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* c8 ignore start */
import type { Application, Context } from '@mwcp/share'
import type {
  Attributes,
  Context as TraceContext,
  Span,
  SpanOptions,
} from '@opentelemetry/api'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { AbstractOtelComponent, AbstractTraceService } from './abstract.js'


export type TraceOptions<M extends MethodTypeUnknown | undefined = undefined> = Partial<TraceDecoratorOptions<M>> | string

export interface TraceDecoratorOptions<
  /** Decorated method */
  M extends MethodTypeUnknown | undefined = undefined,
  /** Arguments of decorated method */
  MParamType = M extends MethodTypeUnknown<infer P> ? P : unknown[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MResultType = M extends MethodTypeUnknown<any[], infer R> ? R : unknown,
> extends SpanOptions {

  /** @default `{target.name}/{methodName}` */
  spanName: string | KeyGenerator<MParamType> | undefined
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
    [MParamType, DecoratorContext], // input args
    DecoratorTraceDataResp | DecoratorTraceDataRespAsync // output data
    > | undefined
  after: MethodTypeUnknown<
    [MParamType, Awaited<MResultType>, DecoratorContext], // input args
    DecoratorTraceDataResp | DecoratorTraceDataRespAsync // output data
    > | undefined
  /**
   * @default true
   */
  autoEndSpan: boolean | undefined
  /**
   * 生成唯一标识符，用于确定同一方法的跨度, 避免异步方法并发调用时调用链关系混乱
   * Generate the unique key for spans determination of the same method,
   * avoid the confusion of call chain relationship when async methods are called concurrently
   * @default undefined, runtime value rule (priority from high to low):
   * - passed value in options.traceScope
   * - generated automatically retrieved from object arg of the method args, that containing key `traceScope`,
   * - webContext (traceService.ctx)
   * @caution symbol must be non-registered symbols, it means Symbol(string) is valid, and Symbol.for(string) is invalid
   * @note `TraceInit()` not supported
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
   */
  scope: ScopeGenerator<MParamType> | TraceScopeParamType | undefined
}

export type TraceScopeParamType = string | TraceScopeType
export type TraceScopeType = symbol | object

export interface DecoratorTraceData {
  attrs?: Attributes
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes
}
export type DecoratorTraceDataResp = DecoratorTraceData | undefined
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | undefined>

export type KeyGenerator<ArgsType = unknown[], DContext extends DecoratorContext = DecoratorContext> = (
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => string | undefined

export interface DecoratorContext extends DecoratorContextBase {
  traceContext: TraceContext | undefined
  traceSpan: Span | undefined
}


export type ScopeGenerator<ArgsType = unknown[], DContext extends DecoratorContextBase = DecoratorContextBase> = (
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => object | symbol

export interface DecoratorContextBase {
  webApp: Application | undefined
  webContext: Context | undefined
  otelComponent: AbstractOtelComponent | undefined
  traceService: AbstractTraceService | undefined
  traceScope: TraceScopeType | undefined
  /** Caller Class name */
  instanceName: string
  methodName: string
  // instance: InstanceWithDecorator
}

/* c8 ignore stop */
