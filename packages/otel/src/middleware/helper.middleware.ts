import type { NextFunction } from '@mwcp/share'
import { Attributes } from '@opentelemetry/api'
import { genISO8601String } from '@waiting/shared-core'

import { TraceService } from '~/lib/trace.service'
import { AttrNames } from '~/lib/types'


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


