import type { Metadata } from '@midwayjs/grpc'
import type { Context as Context, GrpcContext, NextFunction } from '@mwcp/share'
import { RpcMethodType } from '@mwcp/share'
import type { Attributes, TextMapGetter, TextMapSetter } from '@opentelemetry/api'
import { genError, genISO8601String } from '@waiting/shared-core'

import type { TraceService } from '##/lib/index.js'
import { AttrNames } from '##/lib/types.js'

import { GrpcStatusCode } from './status.grpc.js'


/**
 * Catch and sample top exception if __isTraced is false or undefined,
 * ex will NOT be thrown again
 */
export async function handleTopExceptionAndNext(
  ctx: GrpcContext,
  traceSvc: TraceService,
  next: NextFunction,
): Promise<object | Error> {

  try {
    const res = await next() as object
    if (typeof ctx.status === 'undefined') { // for gRPC
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (res) {
        ctx.status = 200
      }
      else {
        ctx.status = 500
      }
    }
    return res
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

    ctx.pendingStatus.details = ctx.pendingStatus.details && ctx.pendingStatus.details !== 'OK'
      ? `${ctx.pendingStatus.details}\n${err.message}`
      : err.message

    if (ctx.pendingStatus.code === 0) {
      ctx.pendingStatus.code = GrpcStatusCode.INTERNAL
    }

    return err
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
): Promise<unknown> {

  try {
    const res = await next() as unknown

    const rootSpan = traceSvc.getRootSpan(webCtx)
    if (rootSpan) {
      const events: Attributes = {
        event: AttrNames.PostProcessBegin,
        time: genISO8601String(),
      }
      traceSvc.addEvent(rootSpan, events)
    }
    return res
  }
  catch (error) {
    const err = genError({ error })
    const currSpan = traceSvc.getActiveSpan()
    if (currSpan) {
      traceSvc.setSpanWithError(currSpan, err, void 0, webCtx)
    }
    else {
      traceSvc.setRootSpanWithError(err, void 0, webCtx)
    }
    throw err
  }
}


export const metadataSetter: TextMapSetter<NonNullable<GrpcContext['metadata']>> = {
  set(carrier, key, value) {
    carrier.set(key, value)
  },
}
export const metadataGetter: TextMapGetter<Metadata> = {
  get: (carrier, key) => {
    return carrier.get(key) as string | string[] | undefined
  },
  keys: (carrier) => {
    // @ts-expect-error internalRepr
    const data = carrier.internalRepr
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data) {
      return Array.from(data, ([key]) => key)
    }
    return []
  },
}


export function detectRpcMethodType(ctx: GrpcContext): RpcMethodType.unary | RpcMethodType.bidi {
  if (ctx['readable']) {
    return RpcMethodType.bidi
  }
  return RpcMethodType.unary
}


export function isGrpcContextFinished(ctx: GrpcContext): boolean {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return !! (ctx['closed'] || ctx['cancelled'] || ctx['errored'] || ctx['destroyed'])
}
