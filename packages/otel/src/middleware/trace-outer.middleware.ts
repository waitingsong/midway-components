/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Middleware } from '@midwayjs/decorator'
import { Context, IMiddleware, NextFunction, shouldEnableMiddleware } from '@mwcp/share'
import { SpanKind, SpanStatus } from '@opentelemetry/api'

import { handleTopExceptionAndNext } from './helper.middleware'

import { TraceService } from '~/lib/trace.service'
import { ConfigKey, Config, MiddlewareConfig } from '~/lib/types'
import {
  addSpanEventWithOutgoingResponseData,
  parseResponseStatus,
  propagateOutgoingHeader,
} from '~/lib/util'


@Middleware()
export class TraceMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx: Context) {
    const config = ctx.app.getConfig(ConfigKey.config) as Config
    if (! config.enable) {
      return false
    }
    const mwConfig = ctx.app.getConfig(ConfigKey.middlewareConfig) as MiddlewareConfig
    if (! mwConfig.enableMiddleware) {
      return false
    }

    const flag = shouldEnableMiddleware(ctx, mwConfig)
    return flag
  }

  resolve() {
    return middleware
  }

}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const traceSvc = await ctx.requestContext.getAsync(TraceService)
  ctx.res.once('finish', () => finishCallback(traceSvc))
  // ctx.res.once('error', (error) => {
  //   traceSvc.finish({ code: SpanStatusCode.ERROR, error })
  // })
  await handleTopExceptionAndNext(traceSvc, next)
  propagateOutgoingHeader(traceSvc.rootContext, ctx.res)
}


function finishCallback(traceSvc: TraceService): void {
  addSpanEventWithOutgoingResponseData(traceSvc.rootSpan, traceSvc.ctx)

  const code = parseResponseStatus(SpanKind.CLIENT, traceSvc.ctx.status)
  const spanStatus: SpanStatus = { code }
  traceSvc.finish(spanStatus)
}

