import { Middleware } from '@midwayjs/core'
import { type GrpcContext, Context, IMiddleware, NextFunction } from '@mwcp/share'

import { TraceService } from '##/lib/index.js'
import { AttrNames, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import { addSpanEventWithIncomingRequestData } from '##/lib/util.js'

import { handleAppExceptionAndNext } from './helper.middleware.grpc.js'


@Middleware()
export class TraceMiddlewareInnerGRpc implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareNameInner + 'GRpc'
    return name
  }

  match(ctx: Context) {
    return ctx.getAttr(middlewareEnableCacheKey) === 'true'
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

  const ctx2 = ctx as unknown as GrpcContext
  const rootSpan = traceSvc.getRootSpan(ctx2)
  if (rootSpan) {
    addSpanEventWithIncomingRequestData({
      requestBody: ctx2.request,
      span: rootSpan,
    })
    traceSvc.addEvent(rootSpan, {
      event: AttrNames.PreProcessFinish,
    })
  }

  return handleAppExceptionAndNext(ctx, traceSvc, next)
}

