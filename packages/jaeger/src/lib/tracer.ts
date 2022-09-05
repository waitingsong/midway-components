/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import assert from 'assert'
import type { IncomingHttpHeaders } from 'http'

import {
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import type { Context, NextFunction } from '@mwcp/share'
import {
  defaultPropDescriptor,
  genISO8601String,
  humanMemoryUsage,
} from '@waiting/shared-core'
import { NpmPkg, JsonResp } from '@waiting/shared-types'
import {
  FORMAT_HTTP_HEADERS,
  Span,
  SpanContext,
  globalTracer,
  Tags,
  SpanOptions,
} from 'opentracing'

import { getComponentConfig, netInfo } from '../util/common'
import { procInfo } from '../util/stat'

import {
  Config,
  SpanHeaderInit,
  SpanLogInput,
  TracerLog,
  TracerTag,
  TracerError,
} from './types'


@Provide()
export class TracerManager {

  @Inject() readonly ctx: Context

  readonly instanceId = Symbol(new Date().getTime().toString())

  isTraceEnabled: boolean
  isStarted: boolean

  spans: Span[]

  @Init()
  async init(): Promise<void> {
    this.isTraceEnabled = false
    this.isStarted = false
    this.spans = []
    if (! this.ctx['tracerTags']) {
      this.ctx['tracerTags'] = {}
    }
  }

  /**
   * 开启第一个span并入栈
   */
  start(): void {
    if (this.isStarted) {
      return
    }
    this.isTraceEnabled = true
    const obj = globalTracer().extract(FORMAT_HTTP_HEADERS, this.ctx.headers) ?? void 0
    const requestSpanCtx = obj && typeof obj.toTraceId === 'function'
      ? obj
      : void 0

    const time = genISO8601String()
    this.startSpan(this.ctx.path, requestSpanCtx)
    const data = {
      [TracerTag.svcPid]: process.pid,
      [TracerTag.svcPpid]: process.ppid,
      [TracerTag.reqStartTime]: time,
    }
    updateCtxTagsData(this.ctx['tracerTags'], data)
    this.spanLog({
      event: TracerLog.requestBegin,
      time,
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })
    // console.log({ instId: this.instanceId })
    this.isStarted = true
  }

  async finish(): Promise<void> {
    await processHTTPStatus(this.ctx)
    processResponseData(this.ctx)
    updateDetailTags(this.ctx)

    const time = genISO8601String()

    this.spanLog({
      event: TracerLog.requestEnd,
      time,
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })

    updateCtxTagsData(this.ctx['tracerTags'], {
      [TracerTag.reqEndTime]: time,
    })
    this.addTags(this.ctx['tracerTags'])

    this.finishSpan()
  }


  currentSpan(): Span | undefined {
    return this.spans[this.spans.length - 1]
  }

  // @ts-ignore
  @RunIfEnabled
  startSpan(name: string, parentSpan?: Span | SpanContext): void {
    const txt = name ?? Date.now().toString()
    const span = this.genSpan(txt, parentSpan)
    this.spans.push(span)
  }

  genSpan(name: string, parentSpan?: Span | SpanContext): Span {
    const opts = {
      childOf: parentSpan ?? this.currentSpan(),
    }
    assert(opts.childOf)
    const span = globalTracer().startSpan(name, opts as SpanOptions)
    return span
  }

  // @ts-ignore
  @RunIfEnabled
  finishSpan(): void {
    const currentSpan = this.currentSpan()
    if (! currentSpan) {
      return
    }
    currentSpan.finish()
    // 保留请求根 span 在栈中
    if (this.spans.length > 1) {
      this.spans.pop()
    }
  }

  // @ts-ignore
  @RunIfEnabled
  spanLog(keyValuePairs: SpanLogInput): void {
    this.currentSpan()?.log(keyValuePairs)
  }

  // @ts-ignore
  @RunIfEnabled
  addTags(tags: SpanLogInput): void {
    this.currentSpan()?.addTags(tags)
  }

  // @ts-ignore
  @RunIfEnabled
  setSpanTag(key: string, value: unknown): void {
    this.currentSpan()?.setTag(key, value)
  }

  headerOfCurrentSpan(currSpan?: Span): SpanHeaderInit | undefined {
    const currentSpan = currSpan ? currSpan : this.currentSpan()
    if (currentSpan) {
      const headerInit = {} as SpanHeaderInit
      globalTracer().inject(currentSpan, FORMAT_HTTP_HEADERS, headerInit)
      return headerInit
    }
  }
}

interface TraceMgrPropDescriptor extends PropertyDescriptor {
  isTraceEnabled?: boolean
}

/**
 * 类方法装饰器
 *  - 链路被启用才执行方法
 * @param _target 目标类
 * @param _propertyKey 函数名
 * @param descriptor 属性描述符
 * @returns
 */
function RunIfEnabled(
  _target: unknown,
  _propertyKey: string,
  descriptor: TraceMgrPropDescriptor,
): TraceMgrPropDescriptor | void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown
  descriptor.value = function(...args: unknown[]): unknown {
    if (this.isTraceEnabled === true) {
      const ret = originalMethod.apply(this, args)
      return ret
    }
  }
  return descriptor
}


function updateDetailTags(
  ctx: Context,
): void {

  const pkg = ctx.app.getConfig('pkg') as NpmPkg
  const tags: SpanLogInput = {
    [Tags.HTTP_METHOD]: ctx.req.method ?? 'n/a',
    [TracerTag.svcName]: pkg.name,
  }

  if (pkg.version) {
    tags[TracerTag.svcVer] = pkg.version
  }
  if (ctx['reqId']) {
    tags[TracerTag.reqId] = ctx['reqId']
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

  tags[Tags.HTTP_URL] = ctx.path
  tags[TracerTag.httpProtocol] = ctx.protocol

  const config = getComponentConfig(ctx.app)

  if (Array.isArray(config.loggingReqHeaders)) {
    config.loggingReqHeaders.forEach((name) => {
      const val = retrieveHeadersItem(ctx.request.headers, name)
      if (val) {
        tags[`req.headers.${name}`] = val
      }
    })
  }

  // tracerManager.addTags(tags)
  updateCtxTagsData(ctx['tracerTags'], tags)
}


/**
 * Catch and sample top exception if __isTraced is false or undefined,
 * ex will NOT be thrown again
 */
export async function handleTopExceptionAndNext(
  tracerManager: TracerManager,
  next: NextFunction,
): Promise<void> {

  try {
    await next()
  }
  catch (ex) {
    const err = ex as TracerError
    if (err[TracerLog.exIsTraced]) {
      return
    }

    await logError(
      tracerManager,
      err,
      TracerLog.topException,
    )
  }
}


/**
 * Catch and sample exception,
 * throw catched ex
 */
export async function handleAppExceptionAndNext(
  config: Config,
  tracerManager: TracerManager,
  next: NextFunction,
): Promise<void> {

  if (config.enableCatchError) {
    try {
      await next()
      tracerManager.spanLog({
        event: TracerLog.postProcessBegin,
        time: genISO8601String(),
        [TracerLog.svcCpuUsage]: process.cpuUsage(),
        [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
      })
    }
    catch (ex) {
      await logError(tracerManager, ex as TracerError)
      throw ex
    }
  }
  else {
    await next()
    tracerManager.spanLog({
      event: TracerLog.postProcessBegin,
      time: genISO8601String(),
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
      [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    })
  }
}

async function logError(
  trm: TracerManager,
  err: TracerError,
  event = TracerLog.error,
): Promise<void> {

  trm.addTags({
    [Tags.ERROR]: true,
    [TracerTag.logLevel]: 'error',
  })

  const info = await procInfo()
  const input: SpanLogInput = {
    event,
    time: genISO8601String(),
    [TracerLog.svcCpuUsage]: process.cpuUsage(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
    ...info,
  }

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
  Object.defineProperty(err, TracerLog.exIsTraced, {
    ...defaultPropDescriptor,
    enumerable: false,
    value: true,
  })
}


async function processHTTPStatus(
  ctx: Context,
): Promise<void> {

  const { status } = ctx.response
  const tracerConfig = getComponentConfig(ctx.app)

  const tags: SpanLogInput = {
    [Tags.HTTP_STATUS_CODE]: status,
  }

  if (status >= 400 && status !== 429) {
    if (status === 404) {
      tags[Tags.SAMPLING_PRIORITY] = 1
    }
    else {
      tags[Tags.SAMPLING_PRIORITY] = 90
    }

    tags[Tags.ERROR] = true
    // tracerManager.addTags(tags)
    updateCtxTagsData(ctx['tracerTags'], tags)
  }
  else {
    if (typeof tracerConfig.processCustomFailure === 'function') {
      await tracerConfig.processCustomFailure(ctx)
    }

    const tracerManager = await ctx.requestContext.getAsync(TracerManager)

    const opts: ProcessPriorityOpts = {
      starttime: ctx.startTime,
      trm: tracerManager,
      tracerTags: ctx['tracerTags'],
      tracerConfig,
    }
    await processPriority(opts)
  }
}


export function processRequestQuery(
  ctx: Context,
): void {

  const config = getComponentConfig(ctx.app)
  const tags: SpanLogInput = {}

  // [Tag] 请求参数和响应数据
  if (config.logginInputQuery) {
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
      const { query } = ctx.request
      if (typeof query === 'object' && Object.keys(query).length) {
        tags[TracerTag.reqQuery] = query
      }
      else if (typeof query === 'string' && query) {
        tags[TracerTag.reqQuery] = query // same as above
      }

      const bdy = ctx.request.body as Record<string, unknown> | string
      if (typeof bdy === 'object' && Object.keys(bdy).length) {
        tags[TracerTag.reqBody] = bdy
      }
      else if (typeof bdy === 'string' && bdy) {
        tags[TracerTag.reqBody] = bdy // same as above
      }
    }
  }

  // tracerManager.addTags(tags)
  updateCtxTagsData(ctx['tracerTags'], tags)
}

function processResponseData(
  ctx: Context,
): void {

  const config = getComponentConfig(ctx.app)
  const tags: SpanLogInput = {}

  if (config.loggingOutputBody) {
    tags[TracerTag.respBody] = ctx.body
  }

  // tracerManager.addTags(tags)
  updateCtxTagsData(ctx['tracerTags'], tags)
}


export async function processCustomFailure(
  ctx: Context,
): Promise<void> {

  const bod = ctx.body as JsonResp
  if (typeof bod !== 'object' || ! bod) {
    return
  }

  if (typeof bod.code === 'undefined') {
    return
  }

  if (bod.code !== 0) {
    updateCtxTagsData(ctx['tracerTags'], {
      [Tags.SAMPLING_PRIORITY]: 30,
      [TracerTag.resCode]: bod.code,
    })
  }
}

export interface ProcessPriorityOpts {
  starttime: number
  trm: TracerManager
  tracerTags: SpanLogInput
  tracerConfig: Config
}
export async function processPriority(options: ProcessPriorityOpts): Promise<number | undefined> {
  const { reqThrottleMsForPriority: throttleMs } = options.tracerConfig
  if (throttleMs < 0) {
    return
  }

  const { starttime, tracerTags, trm } = options

  const cost = Date.now() - starttime
  if (cost >= throttleMs) {
    updateCtxTagsData(tracerTags, {
      [Tags.SAMPLING_PRIORITY]: 11,
      [TracerTag.logLevel]: 'warn',
    })

    const info = await procInfo(['diskstats', 'meminfo', 'stat'])
    trm.spanLog({
      level: 'warn',
      time: genISO8601String(),
      cost,
      [TracerLog.logThrottleMs]: throttleMs,
      [TracerLog.svcCpuUsage]: process.cpuUsage(),
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
    // @ts-ignore
    return headers[name] as string | undefined
  }

  return ''
}


function updateCtxTagsData(
  tracerTags: SpanLogInput,
  input: SpanLogInput,
): void {

  Object.entries(input).forEach(([key, val]) => {
    tracerTags[key] = val
  })
}

