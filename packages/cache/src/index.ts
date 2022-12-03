import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'

export { CacheManager } from '@midwayjs/cache'

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Config
    [ConfigKey.middlewareConfig]: MiddlewareConfig
  }
}

