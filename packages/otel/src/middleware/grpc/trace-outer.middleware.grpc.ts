import { Middleware } from '@midwayjs/core'
import { type Context, type GrpcContext, IMiddleware, NextFunction } from '@mwcp/share'
import { SpanKind, SpanStatus, propagation } from '@opentelemetry/api'

import { TraceService } from '##/lib/index.js'
import { Config, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import {
  addSpanEventWithOutgoingResponseData,
  getSpan,
  parseResponseStatus,
} from '##/lib/util.js'

import { handleTopExceptionAndNext, metadataGetter } from './helper.middleware.grpc.js'


@Middleware()
export class TraceMiddlewareGRpc implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareName + 'GRpc'
    return name
  }

  match(ctx: Context) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! ctx.app) { // false when ctx is a grpc instance
      ctx.app = ctx.getApp() as unknown as Context['app']
    }

    const config = ctx.app.getConfig(ConfigKey.config) as Config
    if (! config.enable) {
      return false
    }
    // check config.enable only, ignore middleware.enable
    ctx.setAttr(middlewareEnableCacheKey, 'true')
    return true
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
async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<unknown> {

  const container = ctx.app.getApplicationContext()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const traceSvc = container.get(TraceService) ?? await container.getAsync(TraceService)
  const rootTraceContext = await traceSvc.startOnRequest(ctx)

  if (! rootTraceContext) {
    return next()
  }

  const ctx2 = ctx as unknown as GrpcContext
  const { metadata } = ctx2
  if (metadata) {
    propagation.extract(rootTraceContext, metadata, metadataGetter)
  }

  const rootSpan = getSpan(rootTraceContext)
  if (! rootSpan) {
    return next()
  }

  const res = await handleTopExceptionAndNext(ctx2, traceSvc, next)
  addSpanEventWithOutgoingResponseData({
    body: res,
    span: rootSpan,
    status: ctx.status,
  })

  setTimeout(() => {
    finishCallback(ctx, traceSvc)
  }, 0)

  if (res instanceof Error) {
    throw res
  }
  else {
    return res
  }
}


function finishCallback(ctx: Context, traceSvc: TraceService): void {
  const code = parseResponseStatus(SpanKind.CLIENT, ctx.status)
  const spanStatus: SpanStatus = { code }
  traceSvc.finish(ctx, spanStatus)
}

