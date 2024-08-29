/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingHttpHeaders } from 'node:http'

import type { ILogger } from '@midwayjs/logger'
import type { BaseConfig, Context, ScopeType } from '@mwcp/share'
import type {
  Attributes,
  AttributeValue,
  Context as TraceContext,
  SpanStatusCode,
  TimeInput,
} from '@opentelemetry/api'
import type { OTLPGRPCExporterConfigNode as OTLPGRPCExporterConfig } from '@opentelemetry/otlp-grpc-exporter-base'
import type { node } from '@opentelemetry/sdk-node'
import type { MiddlewareConfig as MWConfig, KnownKeys } from '@waiting/shared-types'

import { AttrNames } from './attrnames.types.js'


export type NodeTracerConfig = node.TracerConfig
export {
  type Attributes, AttrNames, type TraceContext,
}


export enum ConfigKey {
  namespace = 'otel',
  config = 'otelConfig',
  middlewareConfig = 'otelMiddlewareConfig',
  componentName = 'otelComponent',
  serviceName = 'otelService',
  middlewareName = 'otelMiddleware',
  middlewareNameInner = 'otelMiddlewareInner',
  otlpGrpcExporterConfig = 'otlpGrpcExporterConfig',
}

export const middlewareEnableCacheKey = Symbol.for(`_${ConfigKey.middlewareName}-enabled_`)

export enum Msg {
  hello = 'hello otel',
}

export interface Config extends BaseConfig {
  /**
   * Enable tracing
   * @default true
   */
  enable: boolean
  /**
   * Whether add event to span
   * @default true
   */
  traceEvent: boolean
  /**
   * @default true
   */
  /**
   * - GET: request.query
   * - POST: request.body (only when content-type: 'application/json')
   * @default true
   */
  captureIncomingQuery: boolean
  /**
   * @default ['authorization', 'host', 'user-agent']
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  captureRequestHeaders: (string | KnownKeys<IncomingHttpHeaders>)[]
  /**
   * @default false
   */
  captureResponseBody: boolean
  /**
   * Log cpu usage when add span event
   * @default false
   */
  logCpuUsage: boolean
  /**
   * Log cpu usage when add span event
   * @default false
   */
  logMemoryUsage: boolean
  /**
   * @default [PropagatorList.w3cTraceContext]
   */
  propagators: PropagatorList[]
  /**
   * Trace Exporter
   * @default
   *  - [SpanExporter.otlpGrpc] for prod and unittest
   *  - [SpanExporter.otlpGrpc, SpanExporter.console] for dev
   * @link https://opentelemetry.io/docs/instrumentation/js/instrumentation/
   * @link https://opentelemetry.io/docs/instrumentation/js/exporters/
   */
  exporters: SpanExporterList[]
  /**
   * @default pkg.name
   * @description \@ 字符将会被删除，/ 替换为 - ,便于（ali）日志服务能正常分类
   */
  serviceName?: string
  /**
   * @default pkg.version
   */
  serviceVersion?: string
  /**
   * Callback to process custom failure
   */
  processCustomFailure?: (ctx: Context) => Promise<void>
  /**
   * Optional function generating root span name,
   * if omitted, then `${ctx.protocol} ${method} ${ctx.url}`,
   * eg. `HTTP GET /api/v1/users`
   */
  rootSpanName?: (ctx: Context) => string
}

export enum SpanExporterList {
  console = 'console',
  /**
   * https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
   */
  otlpGrpc = 'otlp-grpc',
}
/**
 * https://opentelemetry.io/docs/reference/specification/context/api-propagators/#propagators-distribution
 */
export enum PropagatorList {
  jaeger = 'jaeger',
  w3cTraceContext = 'W3CTraceContext',
}


/** Options for middleware */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MiddlewareOptions {
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>

export enum HeadersKey {
  /**
   * format: {trace-id}:{span-id}:{parent-span-id}:{flags}
   */
  traceId = 'uber-trace-id',
  TRACE_PARENT_HEADER = 'traceparent',
  TRACE_STATE_HEADER = 'tracestate',
  /**
   * @deprecated use HeadersKey.TRACE_PARENT_HEADER
   */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  otelTraceId = 'traceparent',
  reqId = 'x-request-id',
  authorization = 'authorization',
  contentType = 'content-type',
  userAgent = 'user-agent',
}


export interface SpanHeaderInit extends Attributes {
  [HeadersKey.traceId]: string
}

export interface TraceLogType {
  /**
   * debug | info | warn | error
   * @default info
   */
  level?: keyof ILogger
  msg: unknown
  args?: unknown[]
  [key: string]: unknown
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
  startTime: [number, number]
  attributes: Record<string, unknown>
  name: string
  status: { code: number }
}

export interface InitTraceOptions {
  [ConfigKey.config]: Config
  [ConfigKey.otlpGrpcExporterConfig]: OTLPGRPCExporterConfig
  /**
   * - true: using SimpleSpanProcessor
   * - false: using BatchSpanProcessor
   */
  isDevelopmentEnvironment: boolean
}

// export type CreateActiveSpanCallback = (span: Span) => unknown

export interface SpanStatusOptions {
  /**
   * The status code of this message.
   * @default SpanStatusCode.OK
   */
  code: SpanStatusCode
  /** normal message. */
  message?: string
  error?: Error
}

export type AttributesMap = Map<string, AttributeValue>


export interface JaegerTraceInfo {
  traceID: string
  spans: JaegerTraceInfoSpan[]
  total: number
  limit: number
  offset: number
  errors: unknown
}

export interface JaegerTraceInfoSpan {
  traceID: string
  spanID: string
  flags: number
  operationName: string
  references: JaegerTraceInfoReferences[]
  startTime: number
  duration: number
  tags: Attributes[]
  logs: JaegerTraceInfoLog[]
  processID: string
  warnings: unknown
}

export interface JaegerTraceInfoReferences {
  refType: 'CHILD_OF'
  traceID: string
  spanID: string
}

export interface JaegerTraceInfoLog {
  timestamp: number
  fields: JaegerTraceInfoLogField[]
}

export interface JaegerTraceInfoLogField {
  key: string
  type: string
  value: AttributeValue
}


export interface TraceError extends Error {
  [AttrNames.IsTraced]?: boolean
}

export interface AddEventOptions {
  /**
   * false not add span event
   */
  traceEvent?: boolean
  /**
   * @default true
   */
  logCpuUsage?: Config['logCpuUsage']
  /**
   * @default true
   */
  logMemoryUsage?: Config['logMemoryUsage']
  eventName?: string
  startTime?: TimeInput
}

export type TraceScopeParamType = string | ScopeType
export type TraceScopeType = ScopeType

