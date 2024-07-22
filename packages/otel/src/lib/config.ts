import type { IncomingHttpHeaders } from 'node:http'

import { SpanStatusCode } from '@opentelemetry/api'
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base'
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base'
import type { KnownKeys } from '@waiting/shared-types'

import { AttrNames, HeadersKey, PropagatorList, SpanExporterList } from './types.js'
import type { Config, MiddlewareConfig, MiddlewareOptions, SpanStatusOptions } from './types.js'

/**
 * Initial config, contains:
 * - authorization
 * - host
 * - user-agent
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const initCaptureRequestHeaders: (string | KnownKeys<IncomingHttpHeaders>)[] = [
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
  logCpuUsage: false,
  logMemoryUsage: false,
  captureIncomingQuery: true,
  captureRequestHeaders: [...initCaptureRequestHeaders],
  captureResponseBody: true,
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

export const initTracerIgnoreArray: readonly (string | RegExp)[] = [
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


export const KEY_Trace = 'decorator:key_Trace'
export const METHOD_KEY_TraceInit = 'decorator:method_key_TraceInit'
export const METHOD_KEY_TraceLog = 'decorator:method_key_TraceLog'

