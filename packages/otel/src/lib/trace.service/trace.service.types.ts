
import type {
  Attributes,
  Context as TraceContext,
  Span,
  SpanOptions,
  TimeInput,
} from '@opentelemetry/api'

import type { SpanStatusOptions, TraceScopeType } from '../types.js'


export interface StartScopeActiveSpanOptions {
  name: string
  /**
   * @default scope is request context, grpc stream should be root trace context
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


export interface DecoratorTraceData {
  /** tags */
  attrs?: Attributes
  /** logs */
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes

  /**
   * End the span after method `before()` or `after()` called
   * used by TraceLog decorator, ignored by TraceInit/Trace decorator
   * @description Current span also will be ended if endParentSpan:true, regardless of this value
   * @default false
   */
  endSpanAfterTraceLog?: boolean
  /**
   * End the parent span after method `before()` or `after()` called
   * used by TraceLog decorator, ignored by TraceInit/Trace decorator
   * @description Current span also will be ended if endParentSpan:true, regardless of endSpanAfterTraceLog
   * @default false
   */
  endParentSpan?: boolean
  /**
   * Used by TraceLog decorator and endSpanAfterTraceLog:true, ignored by TraceInit/Trace decorator
   */
  spanStatusOptions?: SpanStatusOptions
  /**
   * options.traceContext will be overwritten by this value, and options.span also will be updated
   */
  traceContext?: TraceContext
}
export type DecoratorTraceDataResp = DecoratorTraceData | undefined | null
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | undefined | null>
