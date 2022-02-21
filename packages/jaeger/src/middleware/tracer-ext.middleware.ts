import { Middleware } from '@midwayjs/decorator'
import { humanMemoryUsage } from '@waiting/shared-core'

import { Context, IMiddleware, NextFunction } from '../interface'
import { TracerConfig, TracerLog } from '../lib/types'
import { pathMatched } from '../util/common'

import {
  handleAppExceptionAndNext,
  processRequestQuery,
} from './helper'


@Middleware()
export class TracerExtMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return tracerMiddleware
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
async function tracerMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<unknown> {

  const { tracerManager } = ctx
  const config = ctx.app.getConfig('tracer ') as TracerConfig

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    return next()
  }
  // 白名单内的路由不会被追踪
  else if (pathMatched(ctx.path, config.whiteList)) {
    return next()
  }

  processRequestQuery(ctx)

  // preProcessFinish,
  tracerManager.spanLog({
    event: TracerLog.preProcessFinish,
    [TracerLog.svcCpuUsage]: process.cpuUsage(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  return handleAppExceptionAndNext(config, tracerManager, next)
}


