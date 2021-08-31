import { SpanLogInput, TracerManager } from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'
export { TracerMiddleware } from './middleware/tracer.middleware'
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
export {
  globalTracer, Span,
} from 'opentracing'

declare module '@midwayjs/core' {
  interface Context {
    tracerManager: TracerManager
    tracerTags: SpanLogInput
  }
}

