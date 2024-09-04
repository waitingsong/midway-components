/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'

import {
  type IMidwayContainer,
  type AsyncContextManager,
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
import type { Context as TraceContext } from '@opentelemetry/api'

import type { OtelComponent } from '../component.js'
import type { TraceScopeType, Config } from '../types.js'


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


  getActiveContext(scope: TraceScopeType): TraceContext {
    const traceContext = this.getActiveContextOnlyScope(scope)
    if (traceContext) {
      return traceContext
    }

    const webAppCtx = this.getWebContext()
    if (webAppCtx) {
      const traceCtx = this.otel.getScopeActiveContext(webAppCtx)
      if (traceCtx) {
        return traceCtx
      }
    }
    // create new span and traceContext
    const ctx4 = this.otel.getGlobalCurrentContext()
    return ctx4
  }

  getActiveContextOnlyScope(scope: TraceScopeType): TraceContext | undefined {
    assert(scope, 'getActiveContext() scope should not be null')
    const ctx = this.otel.getScopeActiveContext(scope)
    if (ctx) {
      return ctx
    }
    const webContext = this.getWebContext()
    if (scope === webContext || scope === this.app) {
      const ctx2 = this.getRootTraceContext(scope as Application | Context)
      assert(ctx2, 'getActiveContext() trace ctx should not be null with scope value= webContext or app')
      return ctx2
    }
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

  async flush(): Promise<void> {
    if (! this.config.enable) { return }
    await this.otel.flush()
  }


}

