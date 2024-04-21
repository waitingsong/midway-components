/* eslint-disable @typescript-eslint/no-unsafe-return */
import { assert } from 'console'

import { Middleware } from '@midwayjs/core'
import { Context, IMiddleware, NextFunction } from '@mwcp/share'
import { humanMemoryUsage } from '@waiting/shared-core'


import { TraceService } from '##/lib/trace.service.js'
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

  const traceSvc = ctx[`_${ConfigKey.serviceName}`] as TraceService
  // const traceSvc = await ctx.requestContext.getAsync(TraceService)
  assert(traceSvc, 'traceSvc is required')
  addSpanEventWithIncomingRequestData(traceSvc.rootSpan, ctx)

  traceSvc.addEvent(traceSvc.rootSpan, {
    event: AttrNames.PreProcessFinish,
    [AttrNames.ServiceMemoryUsage]: JSON.stringify(humanMemoryUsage(), null, 2),
  })

  // const config = getComponentConfig(ctx.app)
  return handleAppExceptionAndNext(traceSvc, next)
}

