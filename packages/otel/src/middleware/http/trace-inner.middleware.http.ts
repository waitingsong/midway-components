import { Middleware } from '@midwayjs/core'
import { Context, IMiddleware, NextFunction } from '@mwcp/share'

import { TraceService } from '##/lib/index.js'
import { AttrNames, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import { addSpanEventWithIncomingRequestData } from '##/lib/util.js'

import { handleAppExceptionAndNext } from './helper.middleware.http.js'


@Middleware()
export class TraceMiddlewareInner implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareNameInner
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
  const rootSpan = traceSvc.getRootSpan(ctx)
  if (rootSpan) {
    addSpanEventWithIncomingRequestData({
      headers: ctx.headers,
      query: ctx.query,
      requestBody: ctx.request.body,
      span: rootSpan,
    })
    traceSvc.addEvent(rootSpan, {
      event: AttrNames.PreProcessFinish,
      // [AttrNames.ServiceMemoryUsage]: JSON.stringify(humanMemoryUsage(), null, 2),
    })
  }

  return handleAppExceptionAndNext(ctx, traceSvc, next)
}

