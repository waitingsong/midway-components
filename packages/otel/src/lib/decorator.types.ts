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

export type TraceDecoratorArg<M extends MethodType | void = void> =
  Partial<TraceDecoratorOptions<M>> | string

export interface TraceDecoratorOptions<
  /** Decorated method */
  M extends MethodType | void = void,
  /** Arguments of decorated method */
  MArgsType = M extends MethodType<infer A> ? A : [],
> extends SpanOptions {

  /** @default `{target.name}/{methodName}` */
  spanName: string | KeyGenerator<MArgsType> | undefined
  /**
   * @default true
   */
  startActiveSpan: boolean
  traceContext: TraceContext | undefined
  // before: MethodType | undefined
  // after: MethodType | undefined
}

export type KeyGenerator<ArgsType = unknown[], DContext extends DecoatorContext = DecoatorContext> = (
  /** Arguments of the method */
  args: ArgsType,
  context: DContext,
) => string | undefined

export interface DecoatorContext {
  webApp: Application | undefined
  webContext: Context | undefined
  otelComponent: AbstractOtelComponent | undefined
  traceService: AbstractTraceService | undefined
  traceContext: TraceContext | undefined
  traceSpan: Span | undefined
}


