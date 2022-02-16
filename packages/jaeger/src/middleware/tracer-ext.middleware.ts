/* eslint-disable import/no-extraneous-dependencies */
import { IMiddleware, NextFunction } from '@midwayjs/core'
import { Middleware } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
} from '@midwayjs/web'
import { humanMemoryUsage } from '@waiting/shared-core'

import { TracerConfig, TracerLog } from '../lib/types'
import { pathMatched } from '../util/common'

import {
  handleAppExceptionAndNext,
  processRequestQuery,
} from './helper'


@Middleware()
export class TracerExtMiddleware implements IMiddleware<IMidwayWebContext, NextFunction> {
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
  ctx: IMidwayWebContext,
  next: IMidwayWebNext,
): Promise<unknown> {

  const { tracerManager } = ctx
  const config = ctx.app.config.tracer as TracerConfig

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


