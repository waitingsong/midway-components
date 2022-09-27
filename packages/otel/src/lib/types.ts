/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingHttpHeaders } from 'http'

import type { ILogger } from '@midwayjs/logger'
import type { BaseConfig, Context } from '@mwcp/share'
import type { Attributes, AttributeValue, SpanStatusCode } from '@opentelemetry/api'
// import { ExporterConfig as JaegerExporterConfig } from '@opentelemetry/exporter-jaeger'
import type { OTLPGRPCExporterConfigNode as OTLPGRPCExporterConfig } from '@opentelemetry/otlp-grpc-exporter-base'
import type { TracerConfig as NodeTracerConfig } from '@opentelemetry/sdk-trace-base'
import { MiddlewareConfig as MWConfig, KnownKeys } from '@waiting/shared-types'

import { AttrNames } from './attrnames.types'


export {
  AttrNames,
  NodeTracerConfig,
}

export enum ConfigKey {
  namespace = 'otel',
  config = 'otelConfig',
  middlewareConfig = 'otelMiddlewareConfig',
  componentName = 'otelComponent',
  middlewareName = 'otelMiddleware',
  middlewareNameInner = 'otelMiddlewareInner',
  jaegerExporterConfig = 'jaegerExporterConfig',
  otlpGrpcExporterConfig = 'otlpGrpcExporterConfig',
}

export enum Msg {
  hello = 'hello otel',
}

export interface Config extends BaseConfig {
  /**
   * Enable trace
   * @default true
   */
  enable: boolean
  /**
   * Enable instrumtation list
   * @default none
   * @docs https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#readme
   */
  instrumentations?: InstrumentationList[]
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
  captureRequestHeaders: (string | KnownKeys<IncomingHttpHeaders>)[]
  /**
   * @default false
   */
  captureResponseBody: boolean
  logCpuUsage: boolean
  /**
   * @default true
   */
  logMemeoryUsage: boolean
  /**
   * @default [PropagatorList.w3cTraceContext]
   */
  propagators: PropagatorList[]
  /**
   * Trace Exporter
   * @default [SpanExporter.otlpGrpc]
   * @link https://opentelemetry.io/docs/instrumentation/js/instrumentation/
   * @link https://opentelemetry.io/docs/instrumentation/js/exporters/
   */
  spanExporters: SpanExporterList[]
  /**
   * 强制采样请求处理时间（毫秒）阈值，
   * 负数不采样
   */
  reqThrottleMsForPriority: number
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
   * @default helper.ts/processCustomFailure()
   */
  processCustomFailure?: (ctx: Context) => Promise<void>

  /**
   * Generate span name,
   * @default `${ctx.protocol} ${method} ${ctx.url}`
   */
  rootSpanName?: (ctx: Context) => string
}

export enum SpanExporterList {
  console = 'console',
  /** https://www.jaegertracing.io/docs/1.37/apis/ */
  // jaeger = 'jaeger',
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


/**
 * @docs https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#readme
 */
export enum InstrumentationList {
  dns = 'dns',
  koa = 'koa',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-grpc
   */
  grpc = 'grpc',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-http
   */
  http = 'http',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-ioredis
   */
  ioredis = 'ioredis',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-knex
   */
  knex = 'knex',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-mongodb
   */
  mongodb = 'mongodb',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-mysql
   */
  mysql = 'mysql',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-pg
   */
  pg = 'pg',
  /**
   * @link https://www.npmjs.com/package/@opentelemetry/instrumentation-redis
   */
  redis = 'redis',
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
  otelTraceId = 'traceparent',
  reqId = 'x-request-id',
  authorization = 'authorization',
  contentType = 'content-type',
  userAgent = 'user-agent',
}


export interface SpanHeaderInit extends Attributes {
  [HeadersKey.traceId]: string
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
  // logs: SpanRawLog[]
  // tags: SpanRawTag[]
  // headerInit: SpanHeaderInit | undefined
}

export interface InitTraceOptions {
  [ConfigKey.config]: Config
  // [ConfigKey.jaegerExporterConfig]: JaegerExporterConfig
  [ConfigKey.otlpGrpcExporterConfig]: OTLPGRPCExporterConfig
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
  /**
   * @default default
   */
  entry?: string
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
  tags: Attributes
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

