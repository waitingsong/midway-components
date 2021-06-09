/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { JsonResp } from '@waiting/shared-types'
import { globalTracer, FORMAT_HTTP_HEADERS } from 'opentracing'

import { TracerManager } from '../lib/tracer'
import { TracerConfig, TracerLog } from '../lib/types'
import { pathMatched } from '../util/common'

import { processHTTPStatus, processResponseData } from './helper'


@Provide()
export class TracerMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return tracerMiddleware
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function tracerMiddleware(
  ctx: IMidwayWebContext<JsonResp | string>,
  next: IMidwayWebNext,
): Promise<unknown> {

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ctx.tracerManager) {
    ctx.logger.warn('tracerManager invalid')
    return next()
  }

  const config = ctx.app.config.tracer as TracerConfig

  // 白名单内的路由不会被追踪
  if (pathMatched(ctx.path, config.whiteList)) {
    ctx.tracerManager = new TracerManager(false)
    return next()
  }
  startSpan(ctx)
  // 设置异常链路一定会采样
  ctx.res.once('finish', () => {
    finishSpan(ctx).catch((ex) => {
      ctx.logger.error(ex)
    })
  })

  return next()
}

function startSpan(ctx: IMidwayWebContext<JsonResp | string>): void {
  // 开启第一个span并入栈
  const tracerManager = new TracerManager(true)
  const requestSpanCtx
    = globalTracer().extract(FORMAT_HTTP_HEADERS, ctx.headers) ?? undefined

  tracerManager.startSpan(ctx.path, requestSpanCtx)
  tracerManager.spanLog({
    event: TracerLog.requestBegin,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  ctx.tracerManager = tracerManager
}

async function finishSpan(ctx: IMidwayWebContext<JsonResp | string>): Promise<void> {
  const { tracerManager } = ctx

  await processHTTPStatus(ctx)
  processResponseData(ctx)

  tracerManager.spanLog({
    event: TracerLog.requestEnd,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  })

  tracerManager.finishSpan()
}
