import { Middleware } from '@midwayjs/decorator'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { globalTracer, FORMAT_HTTP_HEADERS } from 'opentracing'

import { Context, IMiddleware, NextFunction } from '../interface'
import { compName } from '../lib/config'
import { TracerManager } from '../lib/tracer'
import { TracerConfig, TracerLog, TracerTag } from '../lib/types'
import { pathMatched } from '../util/common'

import {
  handleTopExceptionAndNext,
  processHTTPStatus,
  processResponseData,
  updateCtxTagsData,
  updateDetailTags,
} from './helper'


@Middleware()
export class TracerMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return tracerMiddleware
  }

  static getName(): string {
    return compName
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function tracerMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  ctx.tracerTags = {}

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ctx.tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    return next()
  }

  const { app } = ctx

  // const config = ctx.app.config.tracer as TracerConfig
  const config = app.getConfig('tracer') as TracerConfig

  // 白名单内的路由不会被追踪
  if (pathMatched(ctx.path, config.whiteList)) {
    ctx.tracerManager = new TracerManager(false)
    return next()
  }
  const trm = startSpan(ctx)
  ctx.res.once('finish', () => {
    finishSpan(ctx)
      .catch((ex) => {
        ctx.logger.error(ex)
      })
      .finally(() => {
        ctx.tracerTags = {}
      })
  })

  return handleTopExceptionAndNext(trm, next)
}

function startSpan(ctx: Context): TracerManager {
  // 开启第一个span并入栈
  const tracerManager = new TracerManager(true)
  const requestSpanCtx
    = globalTracer().extract(FORMAT_HTTP_HEADERS, ctx.headers) ?? undefined

  ctx.tracerManager = tracerManager

  const time = genISO8601String()
  tracerManager.startSpan(ctx.path, requestSpanCtx)
  updateCtxTagsData(ctx.tracerTags, {
    [TracerTag.svcPid]: process.pid,
    [TracerTag.svcPpid]: process.ppid,
    [TracerTag.reqStartTime]: time,
  })
  tracerManager.spanLog({
    event: TracerLog.requestBegin,
    time,
    [TracerLog.svcCpuUsage]: process.cpuUsage(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  return tracerManager
}

async function finishSpan(ctx: Context): Promise<void> {
  const { tracerManager } = ctx

  await processHTTPStatus(ctx)
  processResponseData(ctx)
  updateDetailTags(ctx)

  const time = genISO8601String()

  tracerManager.spanLog({
    event: TracerLog.requestEnd,
    time,
    [TracerLog.svcCpuUsage]: process.cpuUsage(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  updateCtxTagsData(ctx.tracerTags, {
    [TracerTag.reqEndTime]: time,
  })
  tracerManager.addTags(ctx.tracerTags)

  tracerManager.finishSpan()
}

