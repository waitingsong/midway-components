/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Middleware } from '@midwayjs/core'
import { Context, IMiddleware, NextFunction } from '@mwcp/share'
import { humanMemoryUsage } from '@waiting/shared-core'

import { TraceService } from '##/lib/index.js'
import { AttrNames, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import { addSpanEventWithIncomingRequestData } from '##/lib/util.js'

import { handleAppExceptionAndNext } from './helper.middleware.js'


@Middleware()
export class TraceMiddlewareInner implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareNameInner
    return name
  }

  match(ctx: Context) {
    return !! ctx[middlewareEnableCacheKey]
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
): Promise<void> {

  const container = ctx.app.getApplicationContext()
  const traceSvc = (ctx[`_${ConfigKey.serviceName}`] ?? await container.getAsync(TraceService)) as TraceService
  if (! traceSvc.config.enable) { return }

  const rootSpan = traceSvc.getRootSpan(ctx)
  if (rootSpan) {
    addSpanEventWithIncomingRequestData(rootSpan, ctx)
    traceSvc.addEvent(rootSpan, {
      event: AttrNames.PreProcessFinish,
      [AttrNames.ServiceMemoryUsage]: JSON.stringify(humanMemoryUsage(), null, 2),
    })
  }

  // const config = getComponentConfig(ctx.app)
  return handleAppExceptionAndNext(ctx, traceSvc, next)
}

