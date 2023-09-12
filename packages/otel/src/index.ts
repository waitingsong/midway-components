import {
  Config,
  ConfigKey,
  InitTraceOptions,
  MiddlewareConfig,
  middlewareEnableCacheKey,
} from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './middleware/index.middleware.js'
export {
  Attributes,
  AttributeValue,
  Context,
  Context as TraceContext,
  Span,
  SpanKind,
  SpanContext,
  SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api'

export { SemanticAttributes } from '@opentelemetry/semantic-conventions'


// @ts-ignore
// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Partial<Config>
    [ConfigKey.middlewareConfig]?: Partial<MiddlewareConfig>
    [ConfigKey.otlpGrpcExporterConfig]?: Partial<InitTraceOptions['otlpGrpcExporterConfig']>
  }
}
// @ts-ignore
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    [middlewareEnableCacheKey]?: true
  }
}

