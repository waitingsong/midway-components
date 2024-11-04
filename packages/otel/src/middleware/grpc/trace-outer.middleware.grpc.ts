import { Middleware } from '@midwayjs/core'
import { type Context, type GrpcContext, IMiddleware, NextFunction, RpcMethodType } from '@mwcp/share'
import { SpanKind, SpanStatus, propagation } from '@opentelemetry/api'

import type { Span } from '##/index.js'
import { TraceService } from '##/lib/index.js'
import { Config, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import {
  addSpanEventWithOutgoingResponseData,
  getSpan,
  parseResponseStatus,
} from '##/lib/util.js'

import { detectRpcMethodType, handleTopExceptionAndNext, isGrpcContextFinished, metadataGetter } from './helper.middleware.grpc.js'


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

  const ctx2 = ctx as unknown as GrpcContext
  const rpcMethodType = detectRpcMethodType(ctx2)
  if (rpcMethodType !== RpcMethodType.unary) {
    return next()
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const traceSvc = container.get(TraceService) ?? await container.getAsync(TraceService)
  const rootTraceContext = await traceSvc.startOnRequest(ctx)

  if (! rootTraceContext) {
    return next()
  }

  const { metadata } = ctx2
  if (metadata) {
    propagation.extract(rootTraceContext, metadata, metadataGetter)
  }

  const rootSpan = getSpan(rootTraceContext)
  if (! rootSpan) {
    return next()
  }

  ctx.setAttr('rootTraceContext', rootTraceContext)
  ctx.setAttr('rootSpan', rootSpan)


  const res = await handleTopExceptionAndNext(ctx2, traceSvc, next)
  addSpanEventWithOutgoingResponseData({
    body: res,
    span: rootSpan,
    status: ctx.status,
  })
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (rpcMethodType === RpcMethodType.unary) {
    if (isGrpcContextFinished(ctx2)) { // unary
      finishCallback(ctx2, traceSvc)
      return
    }

    setImmediate(() => {
      if (isGrpcContextFinished(ctx2)) { // unary
        finishCallback(ctx2, traceSvc)
        return
      }
    })
  }

  if (res instanceof Error) {
    throw res
  }
  else {
    return res
  }
}


function finishCallback(ctx: GrpcContext, traceSvc: TraceService): void {
  const rootSpan = ctx.getAttr<Span | undefined>('rootSpan')
  if (! rootSpan?.isRecording()) { return }
  const code = parseResponseStatus(SpanKind.CLIENT, ctx.status)
  const spanStatus: SpanStatus = { code }
  traceSvc.finish(ctx, spanStatus)
}

