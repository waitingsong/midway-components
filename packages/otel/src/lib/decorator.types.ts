/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* c8 ignore start */
import { type Application, type Context } from '@mwcp/share'
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
  before: MethodTypeUnknown<[MParamType, DecoratorContext], DecoratorTraceDataResp | DecoratorTraceDataRespAsync> | undefined
  after: MethodTypeUnknown<[MParamType, Awaited<MResultType>, DecoratorContext], DecoratorTraceDataResp | DecoratorTraceDataRespAsync> | undefined
  /**
   * @default true
   */
  autoEndSpan: boolean | undefined
}

export interface DecoratorTraceData {
  attrs?: Attributes
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes
}
export type DecoratorTraceDataResp = DecoratorTraceData | void
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | void>

export type KeyGenerator<ArgsType = unknown[], DContext extends DecoratorContext = DecoratorContext> = (
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => string | undefined

export interface DecoratorContext {
  webApp: Application | undefined
  webContext: Context | undefined
  otelComponent: AbstractOtelComponent | undefined
  traceService: AbstractTraceService | undefined
  traceContext: TraceContext | undefined
  traceSpan: Span | undefined
}


/* c8 ignore stop */
