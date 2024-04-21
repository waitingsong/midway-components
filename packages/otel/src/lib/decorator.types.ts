/* c8 ignore start */
import type { Application, Context } from '@mwcp/share'
import type {
  Context as TraceContext,
  SpanOptions,
  Span,
} from '@opentelemetry/api'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { AbstractOtelComponent, AbstractTraceService } from './abstract.js'


export type TraceOptions<M extends MethodTypeUnknown | undefined = undefined> = Partial<TraceDecoratorOptions<M>> | string

export interface TraceDecoratorOptions<
  /** Decorated method */
  M extends MethodTypeUnknown | undefined = undefined,
  /** Arguments of decorated method */
  MParamType = M extends MethodTypeUnknown<infer P> ? P : [],
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
  before: MethodTypeUnknown<[MParamType, DecoratorContext]> | undefined
  after: MethodTypeUnknown<[MParamType, DecoratorContext]> | undefined
  /**
   * @default true
   */
  autoEndSpan: boolean | undefined
}

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
