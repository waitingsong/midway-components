import {
  initCacheManagerOptions,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config.js'
import {
  Config,
  MiddlewareConfig,
} from '../lib/types.js'


export const koa = {
  port: 7001,
}

export const cacheManager: Config = {
  enableDefaultRoute: false,
  clients: {
    default: {
      ...initCacheManagerOptions,
    },
  },
}

export const kmoreMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [],
  options: {
    ...initMiddlewareOptions,
  },
}

