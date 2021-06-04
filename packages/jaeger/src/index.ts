import type { Context } from 'egg'

import { TracerManager } from './lib/tracer'
import { TracerConfig } from './lib/types'


export { AutoConfiguration as Configuration } from './configuration'
export { TracerMiddleware } from './middleware/tracer.middleware'
export { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
export { Logger } from './lib/logger'
export type { TracerManager }
export * from './lib/types'
export { procInfo } from './util/stat'


declare module '@midwayjs/core' {
  interface Context {
    tracerManager: TracerManager
  }
}
declare module 'egg' {
  interface EggAppConfig {
    tracer: TracerConfig
  }
}
declare const dummy: Context

