// @ts-ignore
import { PowerPartial } from '@midwayjs/core'

import {
  Config,
  ConfigKey,
  MiddlewareConfig,
  SpanLogInput,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'
export { TracerMiddleware } from './middleware/tracer.middleware'
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
export {
  globalTracer, Span,
} from 'opentracing'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: PowerPartial<Config>
    [ConfigKey.middlewareConfig]: PowerPartial<MiddlewareConfig>
  }

  interface Context {
    tracerTags: SpanLogInput
  }
}

