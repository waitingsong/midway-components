import type { Config, ConfigKey, InitTraceOptions, MiddlewareConfig, middlewareEnableCacheKey } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './middleware/index.middleware.js'
export * from './util/common.js'
export {
  type Attributes,
  type AttributeValue,
  type Context,
  type Context as TraceContext,
  type Span,
  SpanKind,
  type SpanContext,
  type SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api'

export { SemanticAttributes } from '@opentelemetry/semantic-conventions'


declare module '@midwayjs/core/dist/interface.js' {
  interface MidwayConfig {
    [ConfigKey.config]?: Partial<Config>
    [ConfigKey.middlewareConfig]?: Partial<MiddlewareConfig>
    [ConfigKey.otlpGrpcExporterConfig]?: Partial<InitTraceOptions['otlpGrpcExporterConfig']>
  }
}
declare module '@midwayjs/koa/dist/interface.js' {
  interface Context {
    [middlewareEnableCacheKey]?: true
  }
}


