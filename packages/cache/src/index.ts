
import type { Config, ConfigKey, MiddlewareConfig } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'

export {
  CachingFactory,
  type CacheManagerOptions,
  type MidwayUnionCache,
  type MidwayCache,
  type MidwayMultiCache,
} from '@midwayjs/cache-manager'

// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Config
    [ConfigKey.middlewareConfig]?: MiddlewareConfig
  }
}


