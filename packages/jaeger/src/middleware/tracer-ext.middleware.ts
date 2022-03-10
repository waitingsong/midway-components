import { Middleware } from '@midwayjs/decorator'
import { humanMemoryUsage } from '@waiting/shared-core'

import { Context, IMiddleware, NextFunction } from '../interface'
import { ConfigKey } from '../lib/config'
import { TracerLog } from '../lib/types'

import {
  handleAppExceptionAndNext,
  processRequestQuery,
} from './helper'

import { TracerManager } from '~/lib/tracer'
import { getComponentConfig, matchFunc } from '~/util/common'


@Middleware()
export class TracerExtMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.middlewareName + 'Ext'
    return name
  }

  match(ctx?: Context) {
    const flag = matchFunc(ctx)
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
async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<unknown> {


  const { app } = ctx
  const container = app.getApplicationContext()

  const tracerManager = await container.getAsync(TracerManager)
  if (! tracerManager) {
    ctx.logger.warn('tracerManager invalid')
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

