import {
  type AsyncContextManager,
  ApplicationContext,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
  IMidwayContainer,
  Inject,
} from '@midwayjs/core'
import { DecoratorHandlerBase, type Context } from '@mwcp/share'
import { SpanStatusCode } from '@opentelemetry/api'

import { type DecoratorExecutorParam, TraceService } from './trace.service/index.trace.service.js'
import { AttrNames } from './types.js'
import { isSpanEnded } from './util.js'

/**
 * Span will be ended if `autoEndSpan` is true when afterReturn() or afterThrow()
 */
export class DecoratorHandlerTraceBase extends DecoratorHandlerBase {

  @ApplicationContext() readonly applicationContext: IMidwayContainer
  @Inject() protected readonly traceService: TraceService

  getWebContext(): Context | undefined {
    try {
      const contextManager: AsyncContextManager = this.applicationContext.get(
        ASYNC_CONTEXT_MANAGER_KEY,
      )
      const ctx = contextManager.active().getValue(ASYNC_CONTEXT_KEY) as Context | undefined
      return ctx
    }
    catch (ex) {
      // throw new Error('DecoratorHandlerTraceBase.getWebContext() failed. The trigger may not a request (eg. TraceInit())', { cause: ex })
      void ex
    }
  }

  isEnable(options: DecoratorExecutorParam): boolean {
    const { config } = options
    /* c8 ignore next 3 */
    if (! config.enable) {
      return false
    }
    return true
  }

  traceError(options: DecoratorExecutorParam, error: Error, endSpan = true): void {
    const { span, traceService } = options
    if (! this.isEnable(options) || ! span) { return }
    // @ts-ignore - IsTraced
    else if (error[AttrNames.IsTraced] && isSpanEnded(span)) { return }

    const webCtx = options.webContext ?? this.getWebContext() ?? this.app

    if (endSpan) {
      traceService.endSpan({
        span,
        spanStatusOptions: { code: SpanStatusCode.ERROR, error },
        scope: options.traceScope ?? webCtx,
      })
    }
    else {
      traceService.setSpanWithError(span, error, void 0, options.traceScope ?? webCtx)
    }
    // traceService.setRootSpanWithError(error, 'DecoratorHandlerTraceBase.traceError()', webCtx)
  }
}

