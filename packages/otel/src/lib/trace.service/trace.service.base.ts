import assert from 'node:assert'

import {
  type AsyncContextManager,
  type IMidwayContainer,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
} from '@midwayjs/core'
import {
  type Application,
  type Context,
  type RouterInfoLite,
  genISO8601String,
  getRouterInfo,
} from '@mwcp/share'
import type { Context as TraceContext, Span } from '@opentelemetry/api'

import type { OtelComponent } from '../component.js'
import type { Config, TraceScopeType } from '../types.js'
import { getSpan } from '../util.js'


export class TraceServiceBase {
  declare app: Application
  declare applicationContext: IMidwayContainer
  declare config: Config
  declare otel: OtelComponent

  readonly isStartedMap = new WeakMap <TraceScopeType, boolean>()
  readonly instanceId = Symbol(Date.now())
  readonly startTime = genISO8601String()

  // @FIXME
  readonly routerInfoMap = new WeakMap<TraceScopeType, RouterInfoLite>()

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

  getRootTraceContext(scope: TraceScopeType): TraceContext | undefined {
    return this.otel.getScopeRootTraceContext(scope)
  }

  setRootContext(scope: TraceScopeType, traceContext: TraceContext): void {
    const rootCtx = this.getRootTraceContext(scope)
    if (rootCtx && rootCtx === traceContext) { return }
    assert(! rootCtx, 'TraceService.setRootContext() failed, scope root trace context exists already')
    this.otel.setScopeActiveContext(scope, traceContext)
  }


  getActiveContext(): TraceContext {
    const traceCtx = this.otel.getActiveContext()
    return traceCtx
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

  retrieveContextBySpanId(scope: TraceScopeType, spanId: string): TraceContext | undefined {
    assert(scope, 'getActiveContext() scope should not be null')
    assert(spanId, 'retrieveContextBySpanId() spanId should not be empty')

    const arr = this.otel.traceContextMap.get(scope)
    const len = arr?.length
    if (! len) { return }

    for (let i = len - 1; i >= 0; i -= 1) {
      const traceContext = arr.at(i)
      if (traceContext) {
        const span = getSpan(traceContext)
        if (span && span.spanContext().spanId === spanId) {
          return traceContext
        }
      }
      continue
    }
  }

  retrieveTraceInfoBySpanId(spanId: string, scope: TraceScopeType | undefined): TraceInfo | undefined {
    const scope2 = scope ?? this.getWebContext()
    assert(scope2, 'retrieveTraceInfoBySpanId() scope should not be null')

    const traceContext = this.retrieveContextBySpanId(scope2, spanId)
    if (traceContext) {
      const span = getSpan(traceContext)
      assert(span, 'retrieveTraceInfoBySpanId() span should not be null')
      return { span, traceContext }
    }
  }

  retrieveParentTraceInfoBySpan(span: Span, scope?: TraceScopeType): TraceInfo | undefined {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pid = span.parentSpanId
    assert(pid, 'retrieveParentTraceInfoBySpan() span.parentSpanId should not be null')
    assert(typeof pid === 'string', 'retrieveParentTraceInfoBySpan() parentSpanId should be string')
    const info = this.retrieveTraceInfoBySpanId(pid, scope)
    return info
  }


  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }

}


export interface TraceInfo {
  span: Span
  traceContext: TraceContext
}
