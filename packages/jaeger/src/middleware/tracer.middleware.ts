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
import { globalTracer, Tags, FORMAT_HTTP_HEADERS } from 'opentracing'


import { TracerManager } from '../lib/tracer'
import { SpanLogInput, TracerConfig, TracerLog, TracerTag } from '../lib/types'
import { pathMatched } from '../util/common'
import { procInfo } from '../util/stat'

import { logError } from './helper'


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

  // 白名单内的路由不会被追踪
  if (pathMatched(ctx.path, ctx.app.config.tracer.whiteList)) {
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


async function processHTTPStatus(
  ctx: IMidwayWebContext<JsonResp | string>,
): Promise<void> {

  const { tracerManager } = ctx
  const { status } = ctx.response
  const tracerConfig = ctx.app.config.tracer
  const tags: SpanLogInput = {
    [Tags.HTTP_STATUS_CODE]: status,
  }

  if (status >= 400) {
    if (status === 404) {
      tags[Tags.SAMPLING_PRIORITY] = 1
    }
    else {
      tags[Tags.SAMPLING_PRIORITY] = 90
    }

    tags[Tags.ERROR] = true
    tracerManager.addTags(tags)

    if (! tracerConfig.enableCatchError && ctx._internalError) {
      await logError(tracerManager, ctx._internalError)
    }
  }
  else {
    await processCustomFailure(ctx, tracerManager)
    const opts: ProcessPriorityOpts = {
      starttime: ctx.starttime,
      trm: tracerManager,
      tracerConfig,
    }
    await processPriority(opts)
  }
}

function processResponseData(
  ctx: IMidwayWebContext<JsonResp | string>,
): void {

  const { tracerManager } = ctx
  const tracerConfig = ctx.app.config.tracer
  const tags: SpanLogInput = {}


  // [Tag] 请求参数和响应数据
  if (tracerConfig.isLogginInputQuery) {
    if (ctx.method === 'GET') {
      const { query } = ctx.request
      if (typeof query === 'object' && Object.keys(query).length) {
        tags[TracerTag.reqQuery] = query
      }
      else if (typeof query === 'string') {
        tags[TracerTag.reqQuery] = query // same as above
      }
    }
    else if (ctx.method === 'POST' && ctx.request.type === 'application/json') {
      const { query: body } = ctx.request
      if (typeof body === 'object' && Object.keys(body).length) {
        tags[TracerTag.reqBody] = body
      }
      else if (typeof body === 'string') {
        tags[TracerTag.reqBody] = body // same as above
      }
    }
  }

  if (tracerConfig.isLoggingOutputBody) {
    tags[TracerTag.respBody] = ctx.body
  }

  tracerManager.addTags(tags)
}


async function processCustomFailure(
  ctx: IMidwayWebContext<JsonResp | string>,
  trm: TracerManager,
): Promise<void> {

  const { body } = ctx
  const tracerConfig = ctx.app.config.tracer

  if (typeof body === 'object') {
    if (typeof body.code !== 'undefined' && body.code !== 0) {
      trm.addTags({
        [Tags.SAMPLING_PRIORITY]: 30,
        [TracerTag.resCode]: body.code,
      })
      if (! tracerConfig.enableCatchError && ctx._internalError) {
        await logError(trm, ctx._internalError)
      }
    }
  }
}

export interface ProcessPriorityOpts {
  starttime: number
  trm: TracerManager
  tracerConfig: TracerConfig
}
async function processPriority(options: ProcessPriorityOpts): Promise<number | undefined> {
  const { starttime, trm } = options
  const { reqThrottleMsForPriority: throttleMs } = options.tracerConfig

  if (throttleMs < 0) {
    return
  }

  const cost = Date.now() - starttime
  if (cost >= throttleMs) {
    trm.addTags({
      [Tags.SAMPLING_PRIORITY]: 11,
      [TracerTag.logLevel]: 'warn',
    })

    const info = await procInfo()
    trm.spanLog({
      level: 'warn',
      time: genISO8601String(),
      cost,
      [TracerLog.logThrottleMs]: throttleMs,
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
      ...info,
    })
  }
  return cost
}

