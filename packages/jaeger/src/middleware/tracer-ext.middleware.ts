/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Middleware } from '@midwayjs/decorator'
import type { Context, IMiddleware, NextFunction } from '@mwcp/share'
import { humanMemoryUsage } from '@waiting/shared-core'

import { TracerManager, handleAppExceptionAndNext, processRequestQuery } from '../lib/tracer'
import { ConfigKey, TracerLog } from '../lib/types'
import { getComponentConfig, matchFunc } from '../util/common'


@Middleware()
export class TracerExtMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.extMiddlewareName
    return name
  }

  match(ctx?: Context) {
    const flag = matchFunc(ctx)
    return flag
  }

  resolve() {
    return extMiddleware
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
async function extMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  if (! tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next()
  }

  processRequestQuery(ctx)

  tracerManager.spanLog({
    event: TracerLog.preProcessFinish,
    [TracerLog.svcCpuUsage]: process.cpuUsage(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  const config = getComponentConfig(ctx.app)
  return handleAppExceptionAndNext(config, tracerManager, next)
}

