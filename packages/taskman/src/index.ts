
import {
  ConfigKey,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export { TaskManMiddleware } from './middleware/index.middleware.js'
export * from './validation-schema/index.schema.js'
export * from './controller/index.controller.js'
export * from './service/index.service.js'
export * from './repo/index.repo.js'
export * from './lib/index.js'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.clientConfig]?: Partial<TaskClientConfig>
    [ConfigKey.serverConfig]?: Partial<TaskServerConfig>
    [ConfigKey.middlewareConfig]?: Partial<MiddlewareConfig>
  }
}

