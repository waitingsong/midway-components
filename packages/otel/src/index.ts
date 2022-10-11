import {
  Config,
  ConfigKey,
  InitTraceOptions,
  MiddlewareConfig,
  middlewareEnableCacheKey,
} from './lib/types'


export {
  Attributes,
  AttributeValue,
  Context,
  Span,
  SpanKind,
  SpanContext,
  SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api'

export { SemanticAttributes } from '@opentelemetry/semantic-conventions'


export { AutoConfiguration as Configuration } from './configuration'
export * from './app/index.controller'
// export * from './helper/index.instrum'
export * from './lib/index'
export * from './middleware/index.middleware'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
    [ConfigKey.middlewareConfig]: Partial<MiddlewareConfig>
    [ConfigKey.otlpGrpcExporterConfig]: Partial<InitTraceOptions['otlpGrpcExporterConfig']>
  }
}
// @ts-ignore
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    [middlewareEnableCacheKey]?: true
  }
}

