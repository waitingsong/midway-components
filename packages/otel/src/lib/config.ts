import { SpanStatusCode } from '@opentelemetry/api'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base'

import {
  AttrNames,
  Config,
  HeadersKey,
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
  AttrNames.ServiceName,
  AttrNames.ServiceVersion,
]

const enableTrace = typeof process.env['DISABLE_OTEL_TRACE'] === 'undefined'
  ? true
  // @ts-expect-error
  : ! (process.env['DISABLE_OTEL_TRACE'] === true || process.env['DISABLE_OTEL_TRACE'] === 'true')

export const initialConfig: Readonly<Omit<Config, 'tracerConfig'>> = {
  enable: enableTrace,
  traceEvent: true,
  logCpuUsage: true,
  captureIncomingQuery: true,
  captureRequestHeaders: [...initCaptureRequestHeaders],
  captureResponseBody: true,
  logMemeoryUsage: true,
  exporters: [SpanExporterList.otlpGrpc],
  propagators: [
    PropagatorList.w3cTraceContext,
    // PropagatorList.jaeger,
  ],
}
export const initMiddlewareOptions: MiddlewareOptions = {
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

