
import type { ConfigKey, MiddlewareConfig } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'

export {
  type CacheManagerOptions,
  type MidwayCache,
  type MidwayMultiCache,
  type MidwayUnionCache,
  CachingFactory,
} from '@midwayjs/cache-manager'

declare module '@midwayjs/core/dist/interface.js' {
  interface MidwayConfig {
    // [ConfigKey.config]?: Config
    [ConfigKey.middlewareConfig]?: MiddlewareConfig
  }
}


