/* eslint-disable @typescript-eslint/no-explicit-any */
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


export interface DecoratorTraceData {
  /** tags */
  attrs?: Attributes
  /** logs */
  events?: Attributes
  rootAttrs?: Attributes
  rootEvents?: Attributes

  /**
   * End then span after method `before()` or `after()` called
   * used by TraceLog decorator, ignored by TraceInit/Trace decorator
   * @default false
   */
  endSpanAfterTraceLog?: boolean
  /**
   * Used by TraceLog decorator and endSpanAfterTraceLog:true, ignored by TraceInit/Trace decorator
   */
  spanStatusOptions?: SpanStatusOptions
}
export type DecoratorTraceDataResp = DecoratorTraceData | undefined | null
export type DecoratorTraceDataRespAsync = Promise<DecoratorTraceData | undefined | null>
