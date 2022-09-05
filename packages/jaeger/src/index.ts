
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
  SpanLogInput,
} from './lib/types'


export { AutoConfiguration as Configuration } from './configuration'
export * from './app/index.controller'
export * from './lib/index'
export { TracerMiddleware } from './middleware/tracer.middleware'
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
export {
  globalTracer, Span,
} from 'opentracing'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
    [ConfigKey.middlewareConfig]: Partial<MiddlewareConfig>
  }

  interface Context {
    tracerTags: SpanLogInput
  }
}
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    tracerTags: SpanLogInput
  }
}

