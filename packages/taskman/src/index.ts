// @ts-ignore
import { PowerPartial } from '@midwayjs/core'

import {
  ConfigKey,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export { TaskManMiddleware } from './middleware/taskman.middleware'
export * from './validation-schema/index.schema'
export * from './controller/index.controller'
export * from './service/index.service'
export * from './repo/index.repo'
export * from './lib/index'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.clientConfig]: PowerPartial<TaskClientConfig>
    [ConfigKey.serverConfig]: PowerPartial<TaskServerConfig>
    [ConfigKey.middlewareConfig]: PowerPartial<MiddlewareConfig>
  }
}

