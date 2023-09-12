import { Middleware } from '@midwayjs/core'
import { KoidComponent } from '@mwcp/koid'
import { HeadersKey, TraceService } from '@mwcp/otel'

import {
  Context,
  IMiddleware,
  NextFunction,
} from '##/lib/index.js'


@Middleware()
export class RequestIdMiddleware implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = 'requestIdMiddleware'
    return name
  }

  match(ctx?: Context) {
    const flag = !! ctx
    return flag
  }

  resolve() {
    return middleware
  }

}


async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<unknown> {

  const key = HeadersKey.reqId
  let reqId = ctx.get(key)

  if (reqId) {
    ctx['reqId'] = reqId
  }
  else {
    const koid = await ctx.requestContext.getAsync(KoidComponent)
    reqId = koid.idGenerator.toString()
    ctx['reqId'] = reqId
  }

  ctx.set(key, reqId)

  const traceService = await ctx.requestContext.getAsync(TraceService)
  if (traceService.isStarted) {
    traceService.setAttributes(traceService.rootSpan, {
      reqId,
    })
  }

  return next()
}

