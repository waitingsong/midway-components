import type { Application, Context } from '@mwcp/share'
import type {
  Context as TraceContext,
  SpanOptions,
  Span,
} from '@opentelemetry/api'

import { AbstractOtelComponent, AbstractTraceService } from './abstract'


export type MethodType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ArgsType extends unknown[] = any[],
  ReturnType = unknown,
> = (...input: ArgsType) => ReturnType

export type TraceDecoratorParam<M extends MethodType | void = void> =
  Partial<TraceDecoratorOptions<M>> | string

export interface TraceDecoratorOptions<
  /** Decorated method */
  M extends MethodType | void = void,
  /** Arguments of decorated method */
  MParamType = M extends MethodType<infer P> ? P : [],
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
  before: MethodType<[MParamType, DecoratorContext]> | undefined
  after: MethodType<[MParamType, DecoratorContext]> | undefined
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


