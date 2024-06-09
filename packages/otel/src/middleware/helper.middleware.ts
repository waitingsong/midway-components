import type { NextFunction } from '@mwcp/share'
import { Attributes } from '@opentelemetry/api'
import { genISO8601String } from '@waiting/shared-core'

import { TraceService } from '##/lib/trace.service.js'
import { AttrNames } from '##/lib/types.js'


/**
 * Catch and sample top exception if __isTraced is false or undefined,
 * ex will NOT be thrown again
 */
export async function handleTopExceptionAndNext(
  traceSvc: TraceService,
  next: NextFunction,
): Promise<void> {

  try {
    await next()
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : typeof ex === 'string' ? new Error(ex) : new Error('unknown error')

    traceSvc.setRootSpanWithError(err)
    const { ctx } = traceSvc
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
 * throw catched ex
 */
export async function handleAppExceptionAndNext(
  traceSvc: TraceService,
  next: NextFunction,
): Promise<void> {

  try {
    await next()

    const events: Attributes = {
      event: AttrNames.PostProcessBegin,
      time: genISO8601String(),
    }
    traceSvc.addEvent(traceSvc.rootSpan, events)
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : typeof ex === 'string' ? new Error(ex) : new Error('unknown error')

    const currSpan = traceSvc.getActiveSpan()
    if (currSpan) {
      traceSvc.setSpanWithError(currSpan, err)
    }
    else {
      traceSvc.setRootSpanWithError(err)
    }
    throw err
  }
}


