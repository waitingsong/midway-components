import { SpanStatusCode } from '@opentelemetry/api'
// eslint-disable-next-line import/no-extraneous-dependencies
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base'

import {
  AttrNames,
  Config,
  HeadersKey,
  // InstrumentationList,
  MiddlewareConfig,
  MiddlewareOptions,
  PropagatorList,
  SpanExporterList,
  SpanStatusOptions,
} from './types'

/**
 * Initial config, contains:
 * - authorization
 * - host
 * - user-agent
 */
export const initCaptureRequestHeaders: Readonly<string[]> = [
  HeadersKey.authorization,
  HeadersKey.contentType,
  HeadersKey.userAgent,
  AttrNames.SvcName,
  AttrNames.SvcVer,
  AttrNames.ServiceName,
  AttrNames.ServiceVersion,
]

export const initialConfig: Readonly<Omit<Config, 'tracerConfig'>> = {
  enable: true,
  instrumentations: [],
  // instrumentations: [
  //   InstrumentationList.http,
  //   InstrumentationList.knex,
  //   InstrumentationList.pg,
  // ],
  logCpuUsage: true,
  captureIncomingQuery: true,
  captureRequestHeaders: [...initCaptureRequestHeaders],
  captureResponseBody: true,
  logMemeoryUsage: true,
  propagators: [
    PropagatorList.w3cTraceContext,
    // PropagatorList.jaeger,
  ],
  spanExporters: [SpanExporterList.otlpGrpc],
  reqThrottleMsForPriority: 500,
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const initTracerIgnoreArray: Readonly<(string|RegExp)[]> = [
  '/favicon.ico',
  '/favicon.png',
  '/ping',
  '/metrics',
  '/untracedPath',
  /\/unitTest[\d.]+/u,
]



export const initSpanStatusOptions: SpanStatusOptions = {
  /**
   * The status code of this message.
   * @default {@link SpanStatusCode.OK}
   */
  code: SpanStatusCode.OK,
  /** A developer-facing error message. */
  message: '',
  /**
   * @default default
   */
  entry: 'default',
}

/**
 * env: OTEL_EXPORTER_OTLP_ENDPOINT
 * https://opentelemetry.io/docs/reference/specification/protocol/exporter/#configuration-options
 * https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
 * @default http://localhost:4317
 * @example http://127.0.0.1:4317
 */
export const exporterEndpoint = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4317'
/**
 * https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
 * https://opentelemetry.io/docs/reference/specification/protocol/exporter/#configuration-options
 */
export const initOtlpGrpcExporterConfig: OTLPGRPCExporterConfigNode = {
  /* url is optional and can be omitted - default is http://localhost:4317 */
  url: exporterEndpoint,
  compression: CompressionAlgorithm.GZIP,
}

