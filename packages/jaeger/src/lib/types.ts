import type { IncomingHttpHeaders } from 'http'

import type { ILogger } from '@midwayjs/logger'
import type { BaseConfig, Context } from '@mwcp/share'
import { MiddlewareConfig as MWConfig, KnownKeys } from '@waiting/shared-types'
import { TracingConfig } from 'jaeger-client'


export enum ConfigKey {
  namespace = 'tracer',
  config = 'tracerConfig',
  middlewareConfig = 'tracerMiddlewareConfig',
  componentName = 'tracerComponent',
  middlewareName = 'tracerMiddleware',
  extMiddlewareName = 'tracerExtMiddleware'
}

export enum Msg {
  hello = 'hello tracer',
}

export interface Config extends BaseConfig {
  /**
   * 强制采样请求处理时间（毫秒）阈值，
   * 负数不采样
   */
  reqThrottleMsForPriority: number
  tracingConfig: TracingConfig
  /**
   * Catch and sample error,
   * set to false if other tracer middleware log the error
   * @default true
   */
  enableCatchError: boolean
  /**
   * - GET: request.query
   * - POST: request.body (only when content-type: 'application/json')
   * @default true
   */
  logginInputQuery: boolean
  /**
   * @default false
   */
  loggingOutputBody: boolean
  /**
   * @default ['authorization', 'host', 'user-agent']
   */
  loggingReqHeaders: (string | KnownKeys<IncomingHttpHeaders>)[]
  /**
   * @default pkg.name
   * @description \@ 字符将会被删除，/ 替换为 - ,便于（ali）日志服务能正常分类
   */
  serviceName?: string
  /**
   * Callback to process custom failure
   * @default helper.ts/processCustomFailure()
   */
  processCustomFailure?: (ctx: Context) => Promise<void>
}

/** Authentication options for middleware */
export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>

export enum HeadersKey {
  /**
   * format: {trace-id}:{span-id}:{parent-span-id}:{flags}
   */
  traceId = 'uber-trace-id',
  reqId = 'x-request-id',
}

export enum TracerTag {
  reqStartTime = 'req-start-time',
  reqEndTime = 'req-end-time',

  logLevel = 'log.level',
  dbName = 'db',
  dbClient = 'db.client',
  dbHost = 'db.host',
  dbDatabase = 'db.database',
  dbPort = 'db.port',
  dbUser = 'db.user',
  dbCommand = 'db.command',
  callerClass = 'caller.class',

  httpUserAgent = 'http.user-agent',
  httpAuthorization = 'http.authorization',
  httpProtocol = 'http.protocol',
  reqId = 'reqId',
  svcIp4 = 'svc.ipv4',
  svcIp6 = 'svc.ipv6',
  svcException = 'svc.exception',
  svcName = 'svc.name',
  svcPid = 'svc.pid',
  svcPpid = 'svc.ppid',
  svcVer = 'svc.ver',
  resCode = 'res.code',
  message = 'message',
  reqQuery = 'req.query',
  reqBody = 'req.body',
  respBody = 'resp.body',
}

export enum TracerLog {
  logThrottleMs = 'log.throttle',
  exIsTraced = '__isTraced',
  topException = 'top-exp',

  error = 'error',
  requestBegin = 'tracer-request-begin',
  requestEnd = 'tracer-request-end',
  preProcessFinish = 'pre-process-finish',
  postProcessBegin = 'post-process-begin',

  fetchStart = 'fetch-start',
  fetchFinish = 'fetch-finish',
  fetchException = 'fetch-exception',

  queryResponse = 'query-response',
  queryError = 'error',
  queryStart = 'query-start',
  queryFinish = 'query-finish',
  queryRowCount = 'row-count',
  queryCost = 'query-cost',
  queryCostThottleInSec = 'query-cost-thottle-in-sec',
  queryCostThottleInMS = 'query-cost-thottle-in-ms',

  resMsg = 'res.msg',
  errMsg = 'err.msg',
  errStack = 'err.stack',

  svcMemoryUsage = 'svc.memory-usage',
  svcCpuUsage = 'svc.cpu-usage',

  procCpuinfo = 'proc.cpuinfo',
  ProcDiskstats = 'proc.diskstats',
  procMeminfo = 'proc.meminfo',
  procStat = 'proc.stat'
}

export interface SpanHeaderInit {
  [HeadersKey.traceId]: string
}
export interface SpanLogInput {
  [key: string]: unknown
}

export interface LogInfo {
  /**
   * debug | info | warn | error
   */
  level: keyof ILogger
  msg: unknown
  args?: unknown[]
  [key: string]: unknown
}

export interface TracerError extends Error {
  __isTraced: boolean
}


export interface SpanRawLog {
  timestamp: number
  fields: SpanRawLogField[]
}
export interface SpanRawLogField {
  key: string
  value: unknown
}
export interface SpanRawTag {
  key: string
  value: unknown
}
export interface TestSpanInfo {
  startTime: number
  logs: SpanRawLog[]
  tags: SpanRawTag[]
  headerInit: SpanHeaderInit | undefined
  isTraceEnabled: boolean
}
