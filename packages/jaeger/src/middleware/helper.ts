import type { IncomingHttpHeaders } from 'http'

import { IMidwayWebContext, IMidwayWebNext } from '@midwayjs/web'
import {
  genISO8601String,
  humanMemoryUsage,
} from '@waiting/shared-core'
import { NpmPkg, JsonResp } from '@waiting/shared-types'
import { Tags } from 'opentracing'

import { TracerManager } from '../lib/tracer'
import { SpanLogInput, TracerConfig, TracerLog, TracerTag } from '../lib/types'
import { retrieveExternalNetWorkInfo } from '../util/common'
import { procInfo } from '../util/stat'


const netInfo = retrieveExternalNetWorkInfo()

export function updateSpan(
  ctx: IMidwayWebContext,
): void {

  const { tracerManager } = ctx
  const pkg = ctx.app.getConfig('pkg') as NpmPkg
  const tags: SpanLogInput = {
    [Tags.HTTP_METHOD]: ctx.req.method ?? 'n/a',
    [TracerTag.svcName]: pkg.name,
  }

  // if (ctx.request.headers['user-agent']) {
  //   tags[TracerTag.httpUserAgent] = ctx.request.headers['user-agent']
  // }

  if (pkg.version) {
    tags[TracerTag.svcVer] = pkg.version
  }
  if (ctx.reqId) {
    tags[TracerTag.reqId] = ctx.reqId
  }

  netInfo.forEach((ipInfo) => {
    if (ipInfo.family === 'IPv4') {
      tags[TracerTag.svcIp4] = ipInfo.cidr
    }
    else {
      tags[TracerTag.svcIp6] = ipInfo.cidr
    }
  })

  tags[Tags.PEER_HOST_IPV4] = ctx.request.ip

  const config = ctx.app.config.tracer as TracerConfig

  if (Array.isArray(config.loggingReqHeaders)) {
    config.loggingReqHeaders.forEach((name) => {
      const val = retrieveHeadersItem(ctx.request.headers, name)
      if (val) {
        tags[`req.headers.${name}`] = val
      }
    })
  }

  tracerManager.addTags(tags)
}


/**
 * Catch and sample exception,
 * throw or not throw catched ex
 */
export async function processHandleExceptionAndNext(
  config: TracerConfig,
  tracerManager: TracerManager,
  next: IMidwayWebNext,
): Promise<void> {

  if (config.enableCatchError) {
    try {
      await next()
      tracerManager.spanLog({
        event: TracerLog.postProcessBegin,
        time: genISO8601String(),
        [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
      })
    }
    catch (ex) {
      tracerManager.addTags({
        [Tags.ERROR]: true,
        [TracerTag.logLevel]: 'error',
      })

      await logError(tracerManager, ex as Error)
      throw ex
    }
  }
  else {
    await next()
    tracerManager.spanLog({
      event: TracerLog.postProcessBegin,
      time: genISO8601String(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })
  }
}

async function logError(trm: TracerManager, err: Error): Promise<void> {
  const info = await procInfo()
  const input: SpanLogInput = {
    event: TracerLog.error,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    ...info,
  }

  // ctx._internalError in error-handler.middleware.ts
  if (err instanceof Error) {
    input[TracerLog.errMsg] = err.message

    const { stack } = err
    if (stack) {
      // udp limit 65k
      // @link https://www.jaegertracing.io/docs/1.22/client-libraries/#emsgsize-and-udp-buffer-limits
      input[TracerLog.errStack] = stack.slice(0, 20000)
    }
  }

  trm.spanLog(input)
}


export async function processHTTPStatus(
  ctx: IMidwayWebContext<JsonResp | string>,
): Promise<void> {

  const { tracerManager } = ctx
  const { status } = ctx.response
  const tracerConfig = ctx.app.config.tracer as TracerConfig
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


export function processRequestQuery(
  ctx: IMidwayWebContext,
): void {

  const { tracerManager } = ctx
  const tracerConfig = ctx.app.config.tracer as TracerConfig
  const tags: SpanLogInput = {}

  // [Tag] 请求参数和响应数据
  if (tracerConfig.logginInputQuery) {
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

  tracerManager.addTags(tags)
}

export function processResponseData(
  ctx: IMidwayWebContext<JsonResp | string>,
): void {

  const { tracerManager } = ctx
  const tracerConfig = ctx.app.config.tracer as TracerConfig
  const tags: SpanLogInput = {}

  if (tracerConfig.loggingOutputBody) {
    tags[TracerTag.respBody] = ctx.body
  }

  tracerManager.addTags(tags)
}


async function processCustomFailure(
  ctx: IMidwayWebContext<JsonResp | string>,
  trm: TracerManager,
): Promise<void> {

  const { body } = ctx
  const tracerConfig = ctx.app.config.tracer as TracerConfig

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

function retrieveHeadersItem(
  headers: IncomingHttpHeaders | HeadersInit | undefined,
  name: string,
): string | null | undefined {

  if (! headers) {
    return ''
  }

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name)
  }
  else if (Array.isArray(headers)) {
    console.warn('Not supported param type Array, only support Record or Headers Map')
  }
  else if (typeof headers === 'object' && Object.keys(headers).length) {
    // @ts-expect-error
    return headers[name] as string | undefined
  }

  return ''
}

