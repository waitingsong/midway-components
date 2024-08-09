import type { NextFunction, Context as Context } from '@mwcp/share'
import type { Attributes } from '@opentelemetry/api'
import { genISO8601String, genError } from '@waiting/shared-core'

import type { TraceService } from '##/lib/trace.service.js'
import { AttrNames } from '##/lib/types.js'


/**
 * Catch and sample top exception if __isTraced is false or undefined,
 * ex will NOT be thrown again
 */
export async function handleTopExceptionAndNext(
  ctx: Context,
  traceSvc: TraceService,
  next: NextFunction,
): Promise<void> {

  try {
    await next()
  }
  catch (error) {
    const err = genError({ error })
    traceSvc.setRootSpanWithError(err, void 0, ctx)
    /* c8 ignore next 3 */
    if (typeof ctx.status === 'undefined') {
      ctx.status = 500
    }
    else if (ctx.status >= 200 && ctx.status < 300) {
      ctx.status = 500
    }

    if (typeof ctx.body === 'undefined') {
      if (ctx.status === 404) {
        ctx.status = 500
      }

      if (err.message) {
        ctx.body = err.message
      }
    }
  }
}


/**
 * Catch and sample exception,
 * re-throw ex
 */
export async function handleAppExceptionAndNext(
  webCtx: Context,
  traceSvc: TraceService,
  next: NextFunction,
): Promise<void> {

  try {
    await next()

    const rootSpan = traceSvc.getRootSpan(webCtx)
    if (rootSpan) {
      const events: Attributes = {
        event: AttrNames.PostProcessBegin,
        time: genISO8601String(),
      }
      traceSvc.addEvent(rootSpan, events)
    }
  }
  catch (error) {
    const err = genError({ error })
    const currSpan = traceSvc.getActiveSpanOnlyScope(webCtx)
    if (currSpan) {
      traceSvc.setSpanWithError(currSpan, err, void 0, webCtx)
    }
    else {
      traceSvc.setRootSpanWithError(err, void 0, webCtx)
    }
    throw err
  }
}


